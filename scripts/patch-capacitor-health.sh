#!/usr/bin/env bash
# @capgo/capacitor-health 플러그인을 Kotlin 2.0.21로 패치.
# npm install 후 node_modules가 덮어씌워지므로 postinstall에서 자동 실행.
# 이유: 플러그인이 Kotlin 1.9.25로 컴파일되면 SpillingKt NoClassDefFoundError 크래시 발생.
#       androidx.activity:1.11.0이 런타임에 kotlin-stdlib:2.0.21을 당기므로 버전 불일치.
#       플러그인을 Kotlin 2.0.21로 재컴파일하면 K2 컴파일러가 SpillingKt를 생성하지 않음.

PLUGIN_GRADLE="node_modules/@capgo/capacitor-health/android/build.gradle"

if [ ! -f "$PLUGIN_GRADLE" ]; then
  echo "[patch] $PLUGIN_GRADLE not found, skipping."
  exit 0
fi

sed -i.bak \
  -e "s/def kotlinVersion = '1.9.25'/def kotlinVersion = '2.0.21'/" \
  -e "s/kotlin-gradle-plugin:1.9.25/kotlin-gradle-plugin:2.0.21/" \
  "$PLUGIN_GRADLE"

echo "[patch] @capgo/capacitor-health patched to Kotlin 2.0.21"
