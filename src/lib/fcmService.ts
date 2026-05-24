import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "./supabase";

export async function registerFCMToken(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== "granted") {
      console.warn("[FCM] 알림 권한 거부됨");
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener("registration", async (token) => {
      console.log("[FCM] 토큰 등록:", token.value.slice(0, 20) + "...");
      await supabase.from("fcm_tokens").upsert(
        { user_id: userId, token: token.value },
        { onConflict: "token" },
      );
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.error("[FCM] 토큰 등록 실패:", err);
    });

    // 앱 포그라운드 상태에서 푸시 수신 시 처리 (선택적)
    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("[FCM] 포그라운드 알림:", notification.title);
    });

    // 알림 클릭 처리
    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      console.log("[FCM] 알림 클릭:", action.notification.data);
    });
  } catch (e) {
    console.error("[FCM] 초기화 실패:", e);
  }
}

export async function unregisterFCMToken(_userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const reg = await PushNotifications.checkPermissions();
    if (reg.receive !== "granted") return;
    // 현재 기기 토큰 조회 후 삭제
    await PushNotifications.removeAllListeners();
  } catch (e) {
    console.error("[FCM] 토큰 해제 실패:", e);
  }
}
