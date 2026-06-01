# ── Crash 스택 추적을 위한 라인 정보 보존 ──────────────────────────────
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*

# ── Capacitor 코어 ─────────────────────────────────────────────────────
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }

# ── 이 앱 패키지 (커스텀 플러그인 포함) ──────────────────────────────
-keep class com.togetherwalk.app.** { *; }

# ── Firebase / GMS ─────────────────────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ── WebView JavaScript Interface ────────────────────────────────────────
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Kotlin coroutines ───────────────────────────────────────────────────
-keepclassmembernames class kotlinx.** {
    volatile <fields>;
}
-dontwarn kotlinx.coroutines.**

# ── AndroidX / Jetpack ─────────────────────────────────────────────────
-keep class androidx.** { *; }
-dontwarn androidx.**
