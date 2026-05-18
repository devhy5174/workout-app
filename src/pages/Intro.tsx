import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      style={{
        background:
          "linear-gradient(160deg, #1a0500 0%, #7c1a08 30%, #d4461a 60%, #ff7433 85%, #ffac60 100%)",
      }}
    >
      {/* 배경 방사형 글로우 */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 52%, rgba(255,180,100,0.18) 0%, transparent 70%)",
        }}
      />

      {/* 상단 서클 장식 */}
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
        className="flex flex-col items-center gap-5"
        style={{
          animation: "introFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        {/* 발자국 아이콘 */}
        <div
          className="text-5xl mb-1 select-none"
          style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.25))" }}
        >
          👣
        </div>

        {/* 메인 텍스트 */}
        <h1
          className="text-white font-black tracking-[0.18em] select-none"
          style={{
            fontSize: "2.6rem",
            fontFamily: "'Nunito', 'NanumRoundGothic', sans-serif",
            textShadow: "0 2px 24px rgba(0,0,0,0.35)",
            lineHeight: 1.1,
          }}
        >
          함께 걸어요
        </h1>

        {/* 구분선 */}
        <div
          className="rounded-full"
          style={{
            width: "3rem",
            height: "2px",
            background: "rgba(255,255,255,0.45)",
            marginTop: "2px",
          }}
        />
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
