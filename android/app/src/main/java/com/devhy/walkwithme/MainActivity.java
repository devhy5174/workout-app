package com.devhy.walkwithme;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(WorkoutPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
