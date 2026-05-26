import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "./supabase";

let isRegistered = false;

export async function registerFCMToken(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (isRegistered) return; // 중복 등록 방지
  isRegistered = true;

  try {
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== "granted") {
      console.warn("[FCM] 알림 권한 거부됨");
      isRegistered = false;
      return;
    }

    // 리스너를 register() 호출 전에 등록 (캐싱된 토큰 즉시 수신 대비)
    await PushNotifications.removeAllListeners();

    PushNotifications.addListener("registration", async (token) => {
      console.log("[FCM] 토큰 등록 성공:", token.value.slice(0, 20) + "...");
      const { error } = await supabase.from("fcm_tokens").upsert(
        { user_id: userId, token: token.value },
        { onConflict: "token" },
      );
      if (error) {
        console.error("[FCM] 토큰 Supabase 저장 실패:", error.message, error.code);
      } else {
        console.log("[FCM] 토큰 Supabase 저장 완료");
      }
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.error("[FCM] 토큰 등록 실패:", JSON.stringify(err));
      isRegistered = false;
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("[FCM] 포그라운드 알림 수신:", notification.title);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      console.log("[FCM] 알림 클릭:", action.notification.data);
    });

    await PushNotifications.register();
  } catch (e) {
    console.error("[FCM] 초기화 실패:", e);
    isRegistered = false;
  }
}

export async function unregisterFCMToken(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await PushNotifications.removeAllListeners();
    await supabase.from("fcm_tokens").delete().eq("user_id", userId);
    isRegistered = false;
  } catch (e) {
    console.error("[FCM] 토큰 해제 실패:", e);
  }
}
