package com.togetherwalk.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Workout")
public class WorkoutPlugin extends Plugin {

    private BroadcastReceiver updateReceiver;
    private String currentActivityType = "walker";

    @PluginMethod
    public void startWorkout(PluginCall call) {
        String activityType = call.getString("activityType", "walker");
        String nickname     = call.getString("nickname", "");
        String characterId  = call.getString("characterId", "");
        currentActivityType = activityType;

        Intent intent = new Intent(getContext(), WorkoutService.class);
        intent.setAction(WorkoutService.ACTION_START);
        intent.putExtra(WorkoutService.EXTRA_ACTIVITY, activityType);
        intent.putExtra(WorkoutService.EXTRA_NICKNAME, nickname);
        intent.putExtra(WorkoutService.EXTRA_CHARACTER, characterId);

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

    // React에서 실시간 업데이트 수신 등록
    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void addListener(PluginCall call) {
        call.setKeepAlive(true);

        updateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                int steps   = intent.getIntExtra("steps", 0);
                int elapsed = intent.getIntExtra("elapsed", 0);
                double distance = steps * 0.0008;
                int calories = (int)(steps * kcalPerStep(currentActivityType));

                JSObject data = new JSObject();
                data.put("steps",    steps);
                data.put("elapsed",  elapsed);
                data.put("distance", distance);
                data.put("calories", calories);
                call.resolve(data);
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
