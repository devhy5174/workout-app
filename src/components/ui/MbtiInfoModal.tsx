import { HiX } from "react-icons/hi";

interface Props {
  onClose: () => void;
}

export default function MbtiInfoModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-gray-800">
            📊 유산소 MBTI란?
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          운동 패턴을{" "}
          <span className="font-bold text-gray-800">
            [빈도(E/W) · 속도(R/W) · 목적(F/D) · 시간(M/N)]
          </span>
          의 앞 글자를 조합해 만든 유니크한 운동 성향 지표예요!
        </p>

        <div className="space-y-2">
          {[
            { code: "E / W", desc: "꾸준 운동형(Everyday) vs 주말 몰빵형(Weekend)" },
            { code: "R / W", desc: "러너형(Runner) vs 산책형(Walker)" },
            { code: "F / D", desc: "칼로리 소각형(Fatburn) vs 거리 정복형(Distance)" },
            { code: "M / N", desc: "아침형(Morning) vs 야행성형(Night)" },
          ].map(({ code, desc }) => (
            <div
              key={code}
              className="flex items-start gap-3 bg-gray-50 rounded-2xl px-4 py-3"
            >
              <span
                className="font-black text-sm w-14 shrink-0"
                style={{ color: "var(--color-primary)" }}
              >
                {code}
              </span>
              <span className="text-sm text-gray-600">{desc}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-gray-900 text-white py-3.5 rounded-2xl font-bold text-sm"
        >
          확인
        </button>
      </div>
    </div>
  );
}
