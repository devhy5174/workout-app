import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import AppRouter from "./router/router";
import { supabase } from "./lib/supabase";

export default function App() {
  useEffect(() => {
    const kakaoKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
    if (!kakaoKey) {
      console.warn("VITE_KAKAO_JAVASCRIPT_KEY 가 설정되지 않았습니다.");
      return;
    }
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey);
    }
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 카카오/구글 OAuth 완료 후 com.togetherwalk.app://login-callback?code=... 로 돌아올 때 처리
    const listener = CapApp.addListener("appUrlOpen", async ({ url }) => {
      if (!url.startsWith("com.togetherwalk.app://login-callback")) return;
      await Browser.close();
      const code = new URL(url).searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  return <AppRouter />;
}
