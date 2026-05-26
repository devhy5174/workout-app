package com.togetherwalk.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.widget.RemoteViews;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import java.io.InputStream;
import java.util.Locale;

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
    static final String EXTRA_THEME     = "theme";
    static final String BROADCAST_UPDATE = "com.togetherwalk.app.WORKOUT_UPDATE";

    // ── Step sensor (source of truth for steps) ─────────────────────────────
    private SensorManager sensorManager;
    private Sensor stepSensor;

    private int    baselineSteps = -1;
    private int    currentSteps  = 0;
    private long   startTimeMs   = 0;
    private long   pausedMs      = 0;
    private long   pauseStartMs  = 0;
    private boolean isPaused     = false;
    private volatile boolean isRunning = false;
    private String activityType  = "walker";
    private String nickname      = "";
    private String characterId   = "";
    private String theme         = "energy";

    // ── GPS tracking (distance/pace only — steps remain step sensor based) ──
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private double gpsDistanceMeters = 0.0;
    private Location lastGpsLocation = null;
    private boolean gpsActive        = false;

    private static WorkoutService instance;

    private final IBinder binder = new LocalBinder();

    public class LocalBinder extends Binder {
        WorkoutService getService() { return WorkoutService.this; }
    }

    @Override public IBinder onBind(Intent intent) { return binder; }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        stepSensor    = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        setupLocationCallback();
        createNotificationChannel();
    }

    @Override
    public void onDestroy() {
        isRunning = false;
        try { sensorManager.unregisterListener(this); } catch (Exception ignored) {}
        stopGpsTracking();
        instance = null;
        super.onDestroy();
    }

    // ── Static accessors (WorkoutPlugin queries these) ───────────────────────
    public static boolean isServiceRunning() {
        return instance != null && instance.isRunning;
    }
    public static int getStaticSteps() {
        return instance != null ? instance.currentSteps : 0;
    }
    public static int getStaticElapsedSec() {
        return instance != null ? instance.getElapsedSec() : 0;
    }
    public static String getStaticActivityType() {
        return instance != null ? instance.activityType : "walker";
    }
    public static boolean getStaticIsPaused() {
        return instance != null && instance.isPaused;
    }
    public static double getStaticGpsDistanceKm() {
        return instance != null ? instance.gpsDistanceMeters / 1000.0 : 0.0;
    }
    public static boolean getStaticGpsActive() {
        return instance != null && instance.gpsActive;
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
                theme         = intent.getStringExtra(EXTRA_THEME) != null
                                ? intent.getStringExtra(EXTRA_THEME) : "energy";
                baselineSteps    = -1;
                currentSteps     = 0;
                gpsDistanceMeters = 0.0;
                lastGpsLocation  = null;
                gpsActive        = false;
                startTimeMs   = System.currentTimeMillis();
                pausedMs      = 0;
                isPaused      = false;
                isRunning     = true;
                if (stepSensor != null) {
                    sensorManager.registerListener(this, stepSensor,
                        SensorManager.SENSOR_DELAY_NORMAL);
                }
                startGpsTracking();
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
                stopGpsTracking();
                updateNotification();
                break;

            case ACTION_RESUME:
                if (isPaused) {
                    pausedMs += System.currentTimeMillis() - pauseStartMs;
                    isPaused  = false;
                }
                // Reset last location so distance doesn't jump after pause
                lastGpsLocation = null;
                startGpsTracking();
                updateNotification();
                break;

            case ACTION_STOP:
                isRunning = false;
                sensorManager.unregisterListener(this);
                stopGpsTracking();
                stopForeground(true);
                stopSelf();
                break;
        }
        return START_NOT_STICKY;
    }

    // ── GPS helpers ──────────────────────────────────────────────────────────

    private void setupLocationCallback() {
        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult result) {
                if (result == null || isPaused || !isRunning) return;
                Location location = result.getLastLocation();
                if (location == null) return;

                // Reject fixes with poor accuracy (radius > 30m is too noisy)
                if (location.getAccuracy() > 30f) return;

                if (lastGpsLocation != null) {
                    float dist = lastGpsLocation.distanceTo(location);
                    // Sanity: at 5s interval max realistic speed ~40 km/h ≈ 55m
                    // Reject jumps > 60m to filter GPS glitches
                    if (dist > 0f && dist <= 60f) {
                        gpsDistanceMeters += dist;
                        gpsActive = true;
                    }
                } else {
                    gpsActive = true; // first valid fix acquired
                }
                lastGpsLocation = location;
            }
        };
    }

    private void startGpsTracking() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) return;

        // High accuracy for runner/hiker; balanced power for walker/power_walker
        int priority = (activityType.equals("runner") || activityType.equals("hiker"))
            ? Priority.PRIORITY_HIGH_ACCURACY
            : Priority.PRIORITY_BALANCED_POWER_ACCURACY;

        LocationRequest request = new LocationRequest.Builder(priority, 5000L)
            .setMinUpdateIntervalMillis(3000L)
            .setMinUpdateDistanceMeters(5f)
            .build();

        try {
            fusedLocationClient.requestLocationUpdates(
                request, locationCallback, Looper.getMainLooper());
        } catch (Exception ignored) {}
    }

    private void stopGpsTracking() {
        try {
            if (fusedLocationClient != null && locationCallback != null) {
                fusedLocationClient.removeLocationUpdates(locationCallback);
            }
        } catch (Exception ignored) {}
    }

    // ── Refresh loop & sensor ────────────────────────────────────────────────

    private void startNotificationRefresh() {
        new Thread(() -> {
            while (isRunning) {
                try { Thread.sleep(1000); } catch (InterruptedException e) { break; }
                if (!isRunning) break;
                updateNotification();
                if (!isPaused) broadcastUpdate();
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
        bc.putExtra("steps",           currentSteps);
        bc.putExtra("elapsed",         getElapsedSec());
        bc.putExtra("gps_distance_m",  gpsDistanceMeters);
        bc.putExtra("gps_active",      gpsActive);
        sendBroadcast(bc);
    }

    public int getElapsedSec() {
        if (startTimeMs == 0) return 0;
        long now   = System.currentTimeMillis();
        long total = (isPaused ? pauseStartMs : now) - startTimeMs - pausedMs;
        return (int) (total / 1000);
    }

    public int getCurrentSteps() { return currentSteps; }

    // ── Notification ─────────────────────────────────────────────────────────

    private void updateNotification() {
        try {
            NotificationManager nm =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            nm.notify(NOTIF_ID, buildNotification());
        } catch (Exception ignored) {}
    }

    private Notification buildNotification() {
        int elapsed  = getElapsedSec();
        int min      = elapsed / 60;
        int sec      = elapsed % 60;
        String timeStr = String.format(Locale.getDefault(), "%02d:%02d", min, sec);

        // GPS distance for runner/hiker when GPS active; otherwise steps-based estimate
        boolean useGps = gpsActive && gpsDistanceMeters > 0;
        boolean distancePrimary = activityType.equals("runner") || activityType.equals("hiker");
        double distance = (useGps && distancePrimary)
            ? gpsDistanceMeters / 1000.0
            : currentSteps * 0.0008;

        int    calories = (int)(currentSteps * kcalPerStep(activityType));
        String stepsStr = String.format(Locale.getDefault(), "%,d", currentSteps);
        String distStr  = String.format(Locale.getDefault(), "%.2f", distance);
        String statusLabel = activityLabel(activityType) + (isPaused ? " (정지)" : "중");

        String primaryValue, primaryLabel, compactSecondary, bigSecondaryLine;
        if (distancePrimary) {
            primaryValue = distStr;
            primaryLabel = "km";
            if (activityType.equals("runner")) {
                String pace  = formatPace(distance, elapsed);
                compactSecondary  = pace + "  ·  " + calories + "kcal";
                bigSecondaryLine  = pace;
            } else {
                compactSecondary = stepsStr + "보  ·  " + calories + "kcal";
                bigSecondaryLine = stepsStr + "보";
            }
        } else {
            primaryValue     = stepsStr;
            primaryLabel     = "걸음";
            compactSecondary = distStr + "km  ·  " + calories + "kcal";
            bigSecondaryLine = distStr + "km";
        }

        int themeColor = getThemeColor(theme);

        Bitmap charBitmap = loadCharacterBitmap(characterId);
        if (charBitmap == null) {
            charBitmap = toCircleBitmap(
                BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher));
        }

        int pauseIcon = isPaused ? R.drawable.ic_notif_play : R.drawable.ic_notif_pause;
        Intent pauseIntent = new Intent(this, WorkoutService.class);
        pauseIntent.setAction(isPaused ? ACTION_RESUME : ACTION_PAUSE);
        PendingIntent piPause = PendingIntent.getService(this, 1, pauseIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        RemoteViews compact = new RemoteViews(getPackageName(),
            R.layout.notification_workout_compact);
        compact.setTextViewText(R.id.notif_steps,          primaryValue);
        compact.setTextViewText(R.id.notif_steps_label,    primaryLabel);
        compact.setTextViewText(R.id.notif_time_cal,       timeStr);
        compact.setTextViewText(R.id.notif_dist_kcal,      compactSecondary);
        compact.setTextViewText(R.id.notif_status_compact, statusLabel);
        compact.setImageViewBitmap(R.id.notif_character,   charBitmap);
        compact.setImageViewResource(R.id.notif_pause_btn, pauseIcon);
        compact.setOnClickPendingIntent(R.id.notif_pause_btn, piPause);

        RemoteViews big = new RemoteViews(getPackageName(),
            R.layout.notification_workout_big);
        big.setTextViewText(R.id.notif_steps_big,           primaryValue);
        big.setTextViewText(R.id.notif_steps_label_big,     primaryLabel);
        big.setTextViewText(R.id.notif_time_big,            timeStr);
        big.setTextViewText(R.id.notif_dist_big,            bigSecondaryLine);
        big.setTextViewText(R.id.notif_cal_big,             calories + "kcal");
        big.setTextViewText(R.id.notif_nickname_big,        nickname);
        big.setTextViewText(R.id.notif_activity_big,        statusLabel);
        big.setImageViewBitmap(R.id.notif_character_big,    charBitmap);
        big.setImageViewResource(R.id.notif_pause_btn_big,  pauseIcon);
        big.setOnClickPendingIntent(R.id.notif_pause_btn_big, piPause);

        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
            | Intent.FLAG_ACTIVITY_SINGLE_TOP
            | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent piOpen = PendingIntent.getActivity(this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setColor(themeColor)
            .setColorized(true)
            .setCustomContentView(compact)
            .setCustomBigContentView(big)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(piOpen)
            .build();
    }

    private String formatPace(double distanceKm, int elapsedSec) {
        if (distanceKm < 0.01) return "--'--\"/km";
        double minPerKm = (elapsedSec / 60.0) / distanceKm;
        int m = (int) minPerKm;
        int s = (int) Math.round((minPerKm - m) * 60);
        if (s == 60) { m++; s = 0; }
        return m + "'" + String.format(Locale.getDefault(), "%02d", s) + "\"/km";
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private int getThemeColor(String t) {
        switch (t) {
            case "nature": return Color.parseColor("#2ECC71");
            case "cosmo":  return Color.parseColor("#5B6CF9");
            case "mono":   return Color.parseColor("#0F172A");
            default:       return Color.parseColor("#FF5733"); // energy
        }
    }

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

    private String activityLabel(String t) {
        switch (t) {
            case "runner":       return "러닝";
            case "power_walker": return "파워워킹";
            case "hiker":        return "등산";
            default:             return "산책";
        }
    }

    private double kcalPerStep(String t) {
        switch (t) {
            case "runner":       return 8.0 / 150.0;
            case "power_walker": return 5.0 / 120.0;
            case "hiker":        return 6.0 / 90.0;
            default:             return 3.0 / 100.0;
        }
    }
}
