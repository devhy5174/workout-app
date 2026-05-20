package com.devhy.walkwithme;

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

    @PluginMethod
    public void startWorkout(PluginCall call) {
        String activityType = call.getString("activityType", "walker");
        String nickname     = call.getString("nickname", "");

        Intent intent = new Intent(getContext(), WorkoutService.class);
        intent.setAction(WorkoutService.ACTION_START);
        intent.putExtra(WorkoutService.EXTRA_ACTIVITY, activityType);
        intent.putExtra(WorkoutService.EXTRA_NICKNAME, nickname);

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
                // kcal 계산 (기본 walker 기준, 추후 확장 가능)
                int calories = (int)(4.0 * elapsed / 60.0);

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
}
