import { useState } from "react";
import { MBTI_QUIZ_QUESTIONS } from "../../data/mbtiQuizData";
import { WORKOUT_MBTI_DICTIONARY } from "../../data/premiumReportData";
import { HiLockClosed, HiInformationCircle } from "react-icons/hi";
import { MdSportsScore } from "react-icons/md";
import MbtiInfoModal from "../ui/MbtiInfoModal";
import AlertModal from "../ui/AlertModal";
import PremiumModal from "../ui/PremiumModal";

const STORAGE_KEY = "self_mbti_code";
const DRILL_STYLE_KEY = "drill_style";

type DrillStyle = "adult" | "mz";
type Detail = "self" | "premium" | null;

interface Props {
  isPremium: boolean;
  premiumMbtiCode: string | null;
}

export default function WorkoutMbtiCard({ isPremium, premiumMbtiCode }: Props) {
  const [selfCode, setSelfCode] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );
  const drillStyle: DrillStyle =
    (localStorage.getItem(DRILL_STYLE_KEY) as DrillStyle) ?? "adult";
  const [quizOpen, setQuizOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [resultCode, setResultCode] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showDetail, setShowDetail] = useState<Detail>(null);

  const selfEntry = selfCode
    ? WORKOUT_MBTI_DICTIONARY[selfCode as keyof typeof WORKOUT_MBTI_DICTIONARY]
    : null;
  const premiumEntry = premiumMbtiCode
    ? WORKOUT_MBTI_DICTIONARY[premiumMbtiCode as keyof typeof WORKOUT_MBTI_DICTIONARY]
    : null;

  function handleSelect(value: string) {
    const next = [...answers, value];
    if (next.length < MBTI_QUIZ_QUESTIONS.length) {
      setAnswers(next);
      setStep((s) => s + 1);
    } else {
      const code = next.join("");
      localStorage.setItem(STORAGE_KEY, code);
      setSelfCode(code);
      setResultCode(code);
      setAnswers([]);
    }
  }

  function closeResult() {
    setResultCode(null);
    setQuizOpen(false);
    setStep(0);
  }

  function resetQuiz() {
    localStorage.removeItem(STORAGE_KEY);
    setSelfCode(null);
    setResultCode(null);
    setStep(0);
    setAnswers([]);
  }

  const q = MBTI_QUIZ_QUESTIONS[step];

  // AlertModal message 콘텐츠
  function MbtiResultMessage({ code, entry }: { code: string; entry: { title: string; description: string; emoji: string } | undefined }) {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <span
          className="text-white font-black text-xl px-4 py-1 rounded-xl"
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
        >
          {code}
        </span>
        <p className="font-extrabold text-gray-800 text-base">{entry?.title}</p>
        <p className="text-sm text-gray-400 leading-relaxed text-center">{entry?.description}</p>
      </div>
    );
  }

  return (
    <>
      {/* 카드 */}
      <div
        className="mx-4 mt-3 rounded-2xl"
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
      >
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <p className="text-white/60 text-[10px] font-bold tracking-wide">
              유산소 MBTI
            </p>
            <button onClick={() => setShowInfo(true)} aria-label="유산소 MBTI 안내">
              <HiInformationCircle className="text-white/50 text-sm" />
            </button>
          </div>
          {selfCode && (
            <button onClick={resetQuiz} className="text-white/50 text-[10px] font-semibold">
              다시하기
            </button>
          )}
        </div>

        {selfCode ? (
          <div className="flex divide-x divide-white/20 px-1 pb-3">
            {/* 내 선택 */}
            <button
              className="flex-1 px-3 py-2 text-left active:opacity-70 transition"
              onClick={() => setShowDetail("self")}
            >
              <p className="text-white/60 text-[9px] font-bold mb-1">내 선택</p>
              <p className="text-white font-black text-lg leading-none">{selfCode}</p>
              <p className="text-white/80 text-[11px] font-semibold mt-0.5 leading-tight">
                {selfEntry?.[drillStyle].title ?? ""} {selfEntry?.[drillStyle].emoji ?? ""}
              </p>
            </button>

            {/* 실제 기록 */}
            <button
              className="flex-1 px-3 py-2 text-left active:opacity-70 transition"
              onClick={() => setShowDetail("premium")}
            >
              <p className="text-white/60 text-[9px] font-bold mb-1">실제 기록</p>
              {isPremium && premiumMbtiCode ? (
                <>
                  <p className="text-white font-black text-lg leading-none">{premiumMbtiCode}</p>
                  <p className="text-white/80 text-[11px] font-semibold mt-0.5 leading-tight">
                    {premiumEntry?.[drillStyle].title ?? ""} {premiumEntry?.[drillStyle].emoji ?? ""}
                  </p>
                </>
              ) : (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  <div className="flex items-center gap-1">
                    <HiLockClosed className="text-white/50 text-[10px]" />
                    <span className="text-white/70 text-[10px] font-bold">프리미엄 전용</span>
                  </div>
                  <span className="text-white/50 text-[9px]">탭해서 확인 →</span>
                </div>
              )}
            </button>
          </div>
        ) : (
          <div className="px-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-white font-extrabold text-sm leading-tight">나의 유산소 MBTI는?</p>
              <p className="text-white/60 text-[11px] mt-0.5">4가지 질문으로 내 유형 알아보기</p>
            </div>
            <button
              onClick={() => setQuizOpen(true)}
              className="bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition flex-shrink-0"
            >
              시작하기 →
            </button>
          </div>
        )}
      </div>

      {/* 내 선택 결과 팝업 */}
      {showDetail === "self" && selfCode && (
        <AlertModal
          icon={MdSportsScore}
          iconClass="text-primary text-5xl"
          title="나의 유산소 MBTI 결과"
          message={<MbtiResultMessage code={selfCode} entry={selfEntry?.[drillStyle]} />}
          confirmLabel="확인"
          onConfirm={() => setShowDetail(null)}
        />
      )}

      {/* 실제 기록 팝업 */}
      {showDetail === "premium" && (
        isPremium && premiumMbtiCode ? (
          <AlertModal
            icon={MdSportsScore}
            iconClass="text-primary text-5xl"
            title="실제 기록 기반 MBTI"
            message={<MbtiResultMessage code={premiumMbtiCode} entry={premiumEntry?.[drillStyle]} />}
            confirmLabel="확인"
            onConfirm={() => setShowDetail(null)}
          />
        ) : (
          <PremiumModal
            onClose={() => setShowDetail(null)}
            title="프리미엄 전용 기능"
            description="실제 운동 기록을 분석한 나만의 MBTI는 프리미엄 구독 후 확인할 수 있어요 👀"
          />
        )
      )}

      {showInfo && <MbtiInfoModal onClose={() => setShowInfo(false)} />}

      {/* 퀴즈 모달 */}
      {quizOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => { if (!resultCode) { setQuizOpen(false); setStep(0); setAnswers([]); } }}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {resultCode ? (
              <div className="flex flex-col items-center text-center">
                <p className="text-xs font-bold text-gray-400 mb-3 tracking-widest uppercase">
                  나의 유산소 MBTI 결과
                </p>
                <p
                  className="text-white font-black text-2xl mb-1 px-4 py-1.5 rounded-xl"
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                >
                  {resultCode}
                </p>
                {(() => {
                  const entry = WORKOUT_MBTI_DICTIONARY[resultCode as keyof typeof WORKOUT_MBTI_DICTIONARY];
                  return (
                    <>
                      <p className="font-extrabold text-gray-800 text-lg mt-3">{entry?.[drillStyle].title ?? ""}</p>
                      <p className="text-sm text-gray-500 mt-2 leading-relaxed px-2">{entry?.[drillStyle].description ?? ""}</p>
                    </>
                  );
                })()}
                <button
                  onClick={closeResult}
                  className="mt-6 w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition"
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                >
                  확인
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-1.5 mb-5">
                  {MBTI_QUIZ_QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full"
                      style={{ background: i <= step ? "var(--color-primary)" : "#e5e7eb" }}
                    />
                  ))}
                </div>
                <p className="text-2xl mb-1">{q.emoji}</p>
                <p className="font-extrabold text-gray-800 text-base mb-1">{step + 1}/4</p>
                <p className="font-extrabold text-gray-800 text-lg mb-5">{q.question}</p>
                <div className="flex flex-col gap-3">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className="w-full flex flex-col items-start p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 active:scale-95 transition text-left"
                    >
                      <span className="font-extrabold text-gray-800 text-sm">{opt.label}</span>
                      <span className="text-xs text-gray-400 mt-0.5">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
