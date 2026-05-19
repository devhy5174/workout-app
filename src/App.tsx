import { useEffect } from "react";
import AppRouter from "./router/router";

export default function App() {
  useEffect(() => {
    // 1단계에서 타입을 선언했기 때문에 window.Kakao를 바로 써도 에러 안남
    const kakaoKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
    if (!kakaoKey) {
      console.warn("VITE_KAKAO_JAVASCRIPT_KEY 가 설정되지 않았습니다. 카카오 로그인을 사용하려면 .env에 추가하세요.");
      return;
    }
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey);
      console.log("카카오 SDK 초기화 상태:", window.Kakao.isInitialized());
    }
  }, []);
  return <AppRouter />;
}
