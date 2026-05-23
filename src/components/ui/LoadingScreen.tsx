import loadingLogo from "../../assets/images/loadingLogo.png";

export default function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-bg gap-4">
      {/* 말풍선 */}
      <div
        className="relative mb-3 mr-2"
        style={{
          filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.12))",
          animation: "bubble-fade 2.8s ease-in-out infinite",
        }}
      >
        <div className="bg-white rounded-2xl px-5 py-2.5">
          <span className="text-sm font-bold text-gray-700">
            운동 준비 중...
          </span>
        </div>
        {/* 꼬리 (아래 방향) */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: -9,
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "10px solid white",
          }}
        />
      </div>

      {/* 로고 아이콘 — 흰색 PNG를 마스크로 써서 테마색으로 채움 */}
      <div
        className="animate-bounce"
        style={{
          width: 150,
          height: 150,
          backgroundColor: "var(--color-primary)",
          maskImage: `url(${loadingLogo})`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskImage: `url(${loadingLogo})`,
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
        }}
      />

      {/* 점 3개 */}
      <div className="flex gap-2 items-center mt-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-3 h-3 rounded-full"
            style={{
              backgroundColor: "#2ecc71",
              animation: `dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
