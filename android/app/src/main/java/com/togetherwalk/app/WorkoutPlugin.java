package com.togetherwalk.app;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "Workout",
    permissions = {
        @Permission(
            strings = { Manifest.permission.ACTIVITY_RECOGNITION },
            alias = "activityRecognition"
        ),
        @Permission(
            strings = {
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            },
            alias = "location"
        )
    }
)
public class WorkoutPlugin extends Plugin {

    private BroadcastReceiver updateReceiver;
    private String currentActivityType = "walker";

    @PluginMethod
    public void isBatteryOptimizationExcluded(PluginCall call) {
        PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
        boolean excluded = pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
        JSObject result = new JSObject();
        result.put("excluded", excluded);
        call.resolve(result);
    }

    @PluginMethod
    public void requestBatteryOptimizationExclusion(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        } catch (Exception ignored) {}
        call.resolve();
    }

    // ── Activity recognition permission ──────────────────────────────────────

    @PluginMethod
    public void checkActivityPermission(PluginCall call) {
        boolean granted;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            granted = ContextCompat.checkSelfPermission(getContext(),
                Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
        } else {
            granted = true;
        }
        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    @PluginMethod
    public void requestActivityPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }
        if (ContextCompat.checkSelfPermission(getContext(),
                Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }
        requestPermissionForAlias("activityRecognition", call, "activityPermissionCallback");
    }

    @PermissionCallback
    private void activityPermissionCallback(PluginCall call) {
        boolean granted = getPermissionState("activityRecognition") == PermissionState.GRANTED;
        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    // ── Location permission (for GPS distance tracking) ───────────────────────

    @PluginMethod
    public void checkLocationPermission(PluginCall call) {
        boolean granted = ContextCompat.checkSelfPermission(getContext(),
            Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    @PluginMethod
    public void requestLocationPermission(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(),
                Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }
        requestPermissionForAlias("location", call, "locationPermissionCallback");
    }

    @PermissionCallback
    private void locationPermissionCallback(PluginCall call) {
        boolean granted = getPermissionState("location") == PermissionState.GRANTED;
        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    // ── Workout lifecycle ─────────────────────────────────────────────────────

    @PluginMethod
    public void startWorkout(PluginCall call) {
        String activityType = call.getString("activityType", "walker");
        String nickname     = call.getString("nickname", "");
        String characterId  = call.getString("characterId", "");
        String theme        = call.getString("theme", "energy");
        currentActivityType = activityType;

        Intent intent = new Intent(getContext(), WorkoutService.class);
        intent.setAction(WorkoutService.ACTION_START);
        intent.putExtra(WorkoutService.EXTRA_ACTIVITY, activityType);
        intent.putExtra(WorkoutService.EXTRA_NICKNAME, nickname);
        intent.putExtra(WorkoutService.EXTRA_CHARACTER, characterId);
        intent.putExtra(WorkoutService.EXTRA_THEME, theme);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void pauseWorkout(PluginCall call) {
        sendAction(WorkoutService.ACTION_PAUSE);
        call.resolve();
    }

    @PluginMethod
    public void resumeWorkout(PluginCall call) {
        sendAction(WorkoutService.ACTION_RESUME);
        call.resolve();
    }

    @PluginMethod
    public void stopWorkout(PluginCall call) {
        sendAction(WorkoutService.ACTION_STOP);
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        boolean running = WorkoutService.isServiceRunning();
        JSObject result = new JSObject();
        result.put("isRunning", running);
        if (running) {
            result.put("steps",           WorkoutService.getStaticSteps());
            result.put("elapsed",         WorkoutService.getStaticElapsedSec());
            result.put("activityType",    WorkoutService.getStaticActivityType());
            result.put("isPaused",        WorkoutService.getStaticIsPaused());
            result.put("gpsDistanceKm",   WorkoutService.getStaticGpsDistanceKm());
            result.put("gpsActive",       WorkoutService.getStaticGpsActive());
        }
        call.resolve(result);
    }

    @Override
    public void load() {
        super.load();
        updateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                int    steps          = intent.getIntExtra("steps", 0);
                int    elapsed        = intent.getIntExtra("elapsed", 0);
                double gpsDistanceM   = intent.getDoubleExtra("gps_distance_m", 0.0);
                boolean gpsActive     = intent.getBooleanExtra("gps_active", false);

                double estimatedDistKm = steps * 0.0008;
                int    calories        = (int)(steps * kcalPerStep(currentActivityType));
                boolean hasGps         = gpsActive && gpsDistanceM > 0;

                JSObject data = new JSObject();
                data.put("steps",          steps);
                data.put("elapsed",        elapsed);
                data.put("distance",       estimatedDistKm);  // backward-compat estimated value
                data.put("calories",       calories);
                data.put("gpsDistance",    gpsDistanceM / 1000.0);  // km
                data.put("distanceSource", hasGps ? "gps" : "estimated");
                notifyListeners("workoutUpdate", data);
            }
        };

        IntentFilter filter = new IntentFilter(WorkoutService.BROADCAST_UPDATE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getContext().registerReceiver(updateReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(updateReceiver, filter);
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (updateReceiver != null) {
            try { getContext().unregisterReceiver(updateReceiver); } catch (Exception ignored) {}
            updateReceiver = null;
        }
        super.handleOnDestroy();
    }

    private void sendAction(String action) {
        Intent intent = new Intent(getContext(), WorkoutService.class);
        intent.setAction(action);
        getContext().startService(intent);
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
