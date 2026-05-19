import { useEffect } from "react";
import AppRouter from "./router/router";

export default function App() {
  useEffect(() => {
    // 1단계에서 타입을 선언했기 때문에 window.Kakao를 바로 써도 에러 안남
    if (window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
      window.Kakao.init(kakaoKey);
      console.log("카카오 SDK 초기화 상태:", window.Kakao.isInitialized());
    }
  }, []);
  return <AppRouter />;
}
