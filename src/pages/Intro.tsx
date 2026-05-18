import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdDirectionsRun } from "react-icons/md";
import { useTheme } from "../context/ThemeContext";

const THEME_GRADIENTS = {
  energy: "linear-gradient(160deg, #1a0500 0%, #7c1a08 30%, #d4461a 60%, #ff7433 85%, #ffac60 100%)",
  nature: "linear-gradient(160deg, #002210 0%, #0a5c28 30%, #1a9950 60%, #2ecc71 85%, #a8e063 100%)",
  cosmo:  "linear-gradient(160deg, #050018 0%, #1a1060 30%, #3040c0 60%, #5b6cf9 85%, #818cf8 100%)",
};

const THEME_GLOW = {
  energy: "radial-gradient(ellipse 60% 50% at 50% 52%, rgba(255,180,100,0.18) 0%, transparent 70%)",
  nature: "radial-gradient(ellipse 60% 50% at 50% 52%, rgba(168,224,99,0.18) 0%, transparent 70%)",
  cosmo:  "radial-gradient(ellipse 60% 50% at 50% 52%, rgba(129,140,248,0.18) 0%, transparent 70%)",
};

export default function Intro() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 2400);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="h-screen w-full flex flex-col items-center justify-center relative"
      style={{ background: THEME_GRADIENTS[theme] }}
    >
      {/* 배경 방사형 글로우 */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ background: THEME_GLOW[theme] }}
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
        {/* 러닝 아이콘 */}
        <div
          className="mb-4"
          style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.3))" }}
        >
          <MdDirectionsRun className="text-white" style={{ fontSize: "6rem" }} />
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
