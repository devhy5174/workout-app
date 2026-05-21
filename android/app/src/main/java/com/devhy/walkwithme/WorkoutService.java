package com.devhy.walkwithme;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import java.io.InputStream;

public class WorkoutService extends Service implements SensorEventListener {

    static final String CHANNEL_ID    = "workout_channel";
    static final int    NOTIF_ID      = 1001;
    static final String ACTION_START  = "ACTION_START";
    static final String ACTION_PAUSE  = "ACTION_PAUSE";
    static final String ACTION_RESUME = "ACTION_RESUME";
    static final String ACTION_STOP   = "ACTION_STOP";
    static final String EXTRA_ACTIVITY  = "activity_type";
    static final String EXTRA_NICKNAME  = "nickname";
    static final String EXTRA_CHARACTER = "character_id";
    static final String BROADCAST_UPDATE = "com.devhy.walkwithme.WORKOUT_UPDATE";

    private SensorManager sensorManager;
    private Sensor stepSensor;

    private int    baselineSteps = -1;
    private int    currentSteps  = 0;
    private long   startTimeMs   = 0;
    private long   pausedMs      = 0;
    private long   pauseStartMs  = 0;
    private boolean isPaused     = false;
    private String activityType  = "walker";
    private String nickname      = "";
    private String characterId   = "";

    private final IBinder binder = new LocalBinder();

    public class LocalBinder extends Binder {
        WorkoutService getService() { return WorkoutService.this; }
    }

    @Override public IBinder onBind(Intent intent) { return binder; }

    @Override
    public void onCreate() {
        super.onCreate();
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        stepSensor    = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;
        String action = intent.getAction();
        if (action == null) return START_NOT_STICKY;

        switch (action) {
            case ACTION_START:
                activityType  = intent.getStringExtra(EXTRA_ACTIVITY) != null
                                ? intent.getStringExtra(EXTRA_ACTIVITY) : "walker";
                nickname      = intent.getStringExtra(EXTRA_NICKNAME) != null
                                ? intent.getStringExtra(EXTRA_NICKNAME) : "";
                characterId   = intent.getStringExtra(EXTRA_CHARACTER) != null
                                ? intent.getStringExtra(EXTRA_CHARACTER) : "";
                baselineSteps = -1;
                currentSteps  = 0;
                startTimeMs   = System.currentTimeMillis();
                pausedMs      = 0;
                isPaused      = false;
                if (stepSensor != null) {
                    sensorManager.registerListener(this, stepSensor,
                        SensorManager.SENSOR_DELAY_NORMAL);
                }
                try {
                    startForeground(NOTIF_ID, buildNotification());
                } catch (Exception e) {
                    stopSelf();
                    return START_NOT_STICKY;
                }
                startNotificationRefresh();
                break;

            case ACTION_PAUSE:
                isPaused     = true;
                pauseStartMs = System.currentTimeMillis();
                updateNotification();
                break;

            case ACTION_RESUME:
                if (isPaused) {
                    pausedMs += System.currentTimeMillis() - pauseStartMs;
                    isPaused  = false;
                }
                updateNotification();
                break;

            case ACTION_STOP:
                sensorManager.unregisterListener(this);
                stopForeground(true);
                stopSelf();
                break;
        }
        return START_NOT_STICKY;
    }

    private void startNotificationRefresh() {
        new Thread(() -> {
            while (!isPaused) {
                try { Thread.sleep(1000); } catch (InterruptedException e) { break; }
                if (startTimeMs == 0) break;
                updateNotification();
                broadcastUpdate();
            }
        }).start();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        int total = (int) event.values[0];
        if (baselineSteps < 0) baselineSteps = total;
        currentSteps = total - baselineSteps;
        updateNotification();
        broadcastUpdate();
    }

    @Override public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    private void broadcastUpdate() {
        Intent bc = new Intent(BROADCAST_UPDATE);
        bc.putExtra("steps",   currentSteps);
        bc.putExtra("elapsed", getElapsedSec());
        sendBroadcast(bc);
    }

    public int getElapsedSec() {
        if (startTimeMs == 0) return 0;
        long now   = System.currentTimeMillis();
        long total = (isPaused ? pauseStartMs : now) - startTimeMs - pausedMs;
        return (int) (total / 1000);
    }

    public int getCurrentSteps() { return currentSteps; }

    private void updateNotification() {
        NotificationManager nm =
            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        nm.notify(NOTIF_ID, buildNotification());
    }

    private Notification buildNotification() {
        String emoji = activityEmoji(activityType);
        String label = activityLabel(activityType);
        int elapsed  = getElapsedSec();
        int min      = elapsed / 60;
        int sec      = elapsed % 60;
        String timeStr = String.format("%02d:%02d", min, sec);

        double distance = currentSteps * 0.0008;
        int    calories = (int)(kcalPerMin(activityType) * elapsed / 60.0);

        String titleText = emoji + " " + label + " 중" +
            (nickname.isEmpty() ? "" : "  ·  " + nickname);
        // 4개 항목 한 줄로 항상 표시 (칼로리 먼저, 거리 마지막)
        String statsLine = "⏱ " + timeStr
            + "   👟 " + currentSteps + "보"
            + "   🔥 " + calories + "kcal"
            + "   📍 " + String.format("%.2f", distance) + "km";

        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent piOpen = PendingIntent.getActivity(this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent pauseIntent = new Intent(this, WorkoutService.class);
        pauseIntent.setAction(isPaused ? ACTION_RESUME : ACTION_PAUSE);
        PendingIntent piPause = PendingIntent.getService(this, 1, pauseIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent stopIntent = new Intent(this, WorkoutService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent piStop = PendingIntent.getService(this, 2, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // 캐릭터 이미지 로드 (Capacitor 번들 assets에서)
        Bitmap largeIcon = loadCharacterBitmap(characterId);
        if (largeIcon == null) {
            largeIcon = BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher);
        }

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setLargeIcon(largeIcon)
            .setContentTitle(titleText)
            .setContentText(statsLine)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(piOpen)
            .addAction(0, isPaused ? "▶ 재개" : "⏸ 일시정지", piPause)
            .addAction(0, "■ 종료", piStop)
            .build();
    }

    // Vite 빌드 시 해시가 붙으므로 prefix로 스캔해서 찾음
    // 예: character_01-CYcv8PvW.webp
    private Bitmap loadCharacterBitmap(String charId) {
        if (charId == null || charId.isEmpty()) return null;
        try {
            String[] files = getAssets().list("public/assets");
            if (files == null) return null;
            for (String filename : files) {
                if (filename.startsWith(charId + "-") && filename.endsWith(".webp")) {
                    InputStream is = getAssets().open("public/assets/" + filename);
                    Bitmap raw = BitmapFactory.decodeStream(is);
                    is.close();
                    return toCircleBitmap(raw);
                }
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    private Bitmap toCircleBitmap(Bitmap src) {
        int size = Math.min(src.getWidth(), src.getHeight());
        Bitmap output = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(output);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        canvas.drawCircle(size / 2f, size / 2f, size / 2f, paint);
        paint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_IN));
        int offsetX = -(src.getWidth() - size) / 2;
        int offsetY = -(src.getHeight() - size) / 2;
        canvas.drawBitmap(src, offsetX, offsetY, paint);
        return output;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(
                CHANNEL_ID, "운동 트래킹", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("운동 중 실시간 기록 표시");
            ch.setShowBadge(false);
            ((NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE))
                .createNotificationChannel(ch);
        }
    }

    private String activityEmoji(String t) {
        switch (t) {
            case "runner":       return "🏃";
            case "power_walker": return "💪";
            case "hiker":        return "⛰️";
            default:             return "🚶";
        }
    }

    private String activityLabel(String t) {
        switch (t) {
            case "runner":       return "러닝";
            case "power_walker": return "파워워킹";
            case "hiker":        return "등산";
            default:             return "산책";
        }
    }

    private double kcalPerMin(String t) {
        switch (t) {
            case "runner":       return 10.0;
            case "power_walker": return 6.0;
            case "hiker":        return 7.0;
            default:             return 4.0;
        }
    }
}
