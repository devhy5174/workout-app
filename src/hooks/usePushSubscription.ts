import { useCallback, useEffect, useState } from "react";
import { savePushSubscription, deletePushSubscription } from "../lib/notificationService";

// base64url → Uint8Array<ArrayBuffer> (VAPID public key 변환)
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function checkIsSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export function usePushSubscription(userId: string | null) {
  const isSupported = checkIsSupported();

  const [permission, setPermission] = useState<PushPermission>(() => {
    if (!checkIsSupported()) return "unsupported";
    return Notification.permission as PushPermission;
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 기존 구독 여부 확인
  useEffect(() => {
    if (!isSupported || Notification.permission !== "granted") return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    });
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<{ error: string | null }> => {
    if (!userId) return { error: "로그인이 필요합니다." };
    if (!isSupported) return { error: "이 브라우저는 푸시 알림을 지원하지 않아요." };
    if (!VAPID_PUBLIC_KEY) return { error: "VAPID 키가 설정되지 않았습니다." };

    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const result = await Notification.requestPermission();
      setPermission(result as PushPermission);
      if (result !== "granted") {
        return { error: "알림 권한이 거부됐어요. 브라우저 설정에서 허용해주세요." };
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const { error } = await savePushSubscription(userId, sub);
      if (error) {
        await sub.unsubscribe();
        return { error };
      }

      setIsSubscribed(true);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "구독 실패" };
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSupported]);

  const unsubscribe = useCallback(async (): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await deletePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "구독 취소 실패" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe };
}
