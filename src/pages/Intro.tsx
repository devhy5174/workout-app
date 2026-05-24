import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import loadingLogo from "../assets/images/loadingLogo.png";

const BG = "linear-gradient(150deg, #ffac60 0%, #ff7433 40%, #ff5733 75%, #e8401a 100%)";
const GLOW = "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,255,255,0.18) 0%, transparent 65%)";

export default function Intro() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 2400);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="h-screen w-full flex flex-col items-center justify-center relative"
      style={{ background: BG }}
    >
      {/* 배경 방사형 글로우 */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ background: GLOW }}
      />

      {/* 서클 장식 */}
      <div
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />

      {/* 메인 콘텐츠 */}
      <div
        className="flex flex-col items-center text-center mb-10"
        style={{
          animation: "introFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        {/* 앱 로고 */}
        <div
          style={{
            filter: "brightness(0) invert(1) drop-shadow(0 4px 24px rgba(0,0,0,0.25))",
            marginBottom: "-23px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <img
            src={loadingLogo}
            alt="함께걸어요 로고"
            style={{ width: "200px", height: "200px", objectFit: "contain" }}
          />
        </div>

        {/* 메인 텍스트 */}
        <h1
          className="text-3xl font-black text-white tracking-tight select-none"
          style={{
            fontFamily: "'Nunito', 'NanumRoundGothic', sans-serif",
            textShadow: "0 2px 24px rgba(0,0,0,0.35)",
          }}
        >
          함께 걸어요
        </h1>

        {/* 서브타이틀 */}
        <p
          className="text-sm mt-2 select-none"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          걷기 · 러닝 습관 형성 커뮤니티
        </p>
      </div>

      {/* 하단 로딩 점 */}
      <div className="absolute bottom-14 flex gap-2 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block rounded-full"
            style={{
              width: "6px",
              height: "6px",
              background: "rgba(255,255,255,0.5)",
              animation: `dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes introFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
