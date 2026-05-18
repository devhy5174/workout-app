import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useActivityType } from "../../context/ActivityTypeContext";
import { useCharacter } from "../../context/CharacterContext";
import { activityTypes, type ActivityType } from "../../data/activityTypes";
import {
  NICKNAME_MAX_LENGTH,
  validateNicknameLocally,
} from "../../data/nicknameFilters";
import { checkNicknameDuplicate } from "../../lib/userService";
import CharacterGrid from "../../components/CharacterGrid";
import male from "../../assets/images/basic_m.webp";
import female from "../../assets/images/basic_w.webp";

type Gender = "male" | "female";

// ─── Step 1: 닉네임 ───────────────────────────────────────────────────────────

function StepNickname({
  nickname,
  onChange,
  error,
  isChecking,
}: {
  nickname: string;
  onChange: (v: string) => void;
  error: string | null;
  isChecking: boolean;
}) {
  return (
    <div className="flex flex-col items-center pt-6">
      <div className="text-7xl mb-6">👋</div>
      <h2 className="text-2xl font-black text-gray-800 text-center leading-snug mb-2">
        안녕하세요!
        <br />
        어떻게 불러드릴까요?
      </h2>
      <p className="text-gray-400 text-sm mb-10">
        앱에서 사용할 닉네임을 입력해주세요.
      </p>
      <input
        type="text"
        value={nickname}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`닉네임 (최대 ${NICKNAME_MAX_LENGTH}자)`}
        maxLength={NICKNAME_MAX_LENGTH}
        className="w-full px-5 py-4 rounded-2xl bg-white border-2 text-gray-800 text-base font-semibold placeholder-gray-300 focus:outline-none transition-colors"
        style={{
          borderColor: error
            ? "#ef4444"
            : nickname.trim()
              ? "var(--color-primary)"
              : "#e5e7eb",
        }}
        autoFocus
      />
      <div className="flex justify-between w-full mt-2">
        {error ? (
          <p className="text-xs text-red-500 font-semibold">{error}</p>
        ) : isChecking ? (
          <p className="text-xs text-gray-400">중복 확인 중...</p>
        ) : (
          <p className="text-xs text-gray-300">한글·영문·숫자만 사용 가능</p>
        )}
        <p className="text-xs text-gray-300">
          {nickname.length}/{NICKNAME_MAX_LENGTH}
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: 성별 ─────────────────────────────────────────────────────────────

function StepGender({
  gender,
  setGender,
}: {
  gender: Gender | null;
  setGender: (v: Gender) => void;
}) {
  const options: { value: Gender; image: string; label: string }[] = [
    {
      value: "male",
      image: male,
      label: "남성",
    },
    {
      value: "female",
      image: female,
      label: "여성",
    },
  ];

  return (
    <div className="flex flex-col items-center pt-6">
      <div className="text-7xl mb-6">🏅</div>
      <h2 className="text-2xl font-black text-gray-800 text-center mb-2">
        성별을 알려주세요
      </h2>
      <p className="text-gray-400 text-sm mb-10">맞춤 운동 추천에 활용돼요.</p>
      <div className="flex gap-4 w-full">
        {options.map(({ value, image, label }) => {
          const selected = gender === value;
          return (
            <button
              key={value}
              onClick={() => setGender(value)}
              className="flex-1 flex flex-col items-center gap-3 py-8 rounded-2xl border-2 font-bold text-lg transition-all"
              style={{
                borderColor: selected ? "var(--color-primary)" : "#e5e7eb",
                background: selected
                  ? "var(--color-primary-light, #fff0ec)"
                  : "white",
                color: selected ? "var(--color-primary)" : "#9ca3af",
              }}
            >
              <img
                src={image}
                alt={label}
                className="w-100% h-100% object-contain"
              />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: 신체 정보 ────────────────────────────────────────────────────────

function getBmiInfo(bmi: number) {
  if (bmi < 18.5) return { label: "저체중", color: "#3b82f6" };
  if (bmi < 23) return { label: "정상", color: "#22c55e" };
  if (bmi < 25) return { label: "과체중", color: "#f59e0b" };
  return { label: "비만", color: "#ef4444" };
}

function StepBody({
  age,
  setAge,
  height,
  setHeight,
  weight,
  setWeight,
}: {
  age: string;
  setAge: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
}) {
  const h = parseFloat(height);
  const w = parseFloat(weight);
  const bmi = h > 0 && w > 0 ? w / (h / 100) ** 2 : null;
  const bmiInfo = bmi ? getBmiInfo(bmi) : null;

  return (
    <div className="flex flex-col items-center pt-6">
      <div className="text-7xl mb-6">📏</div>
      <h2 className="text-2xl font-black text-gray-800 text-center mb-2">
        신체 정보를 알려주세요
      </h2>
      <p className="text-gray-400 text-sm mb-8">
        맞춤 운동 목표 설정에 활용돼요.
      </p>

      <div className="flex flex-col gap-4 w-full">
        {/* 나이 입력 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-600 pl-1">나이</label>
          <div className="relative">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="나이를 입력하세요"
              min={1}
              max={120}
              className="w-full px-5 py-4 rounded-2xl bg-white border-2 text-gray-800 text-base font-semibold placeholder-gray-300 focus:outline-none transition-colors pr-14"
              style={{ borderColor: age ? "var(--color-primary)" : "#e5e7eb" }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
              세
            </span>
          </div>
        </div>

        {/* 키 입력 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-600 pl-1">키</label>
          <div className="relative">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="키를 입력하세요"
              min={100}
              max={250}
              className="w-full px-5 py-4 rounded-2xl bg-white border-2 text-gray-800 text-base font-semibold placeholder-gray-300 focus:outline-none transition-colors pr-14"
              style={{
                borderColor: height ? "var(--color-primary)" : "#e5e7eb",
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
              cm
            </span>
          </div>
        </div>

        {/* 몸무게 입력 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-600 pl-1">몸무게</label>
          <div className="relative">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="몸무게를 입력하세요"
              min={20}
              max={300}
              className="w-full px-5 py-4 rounded-2xl bg-white border-2 text-gray-800 text-base font-semibold placeholder-gray-300 focus:outline-none transition-colors pr-12"
              style={{
                borderColor: weight ? "var(--color-primary)" : "#e5e7eb",
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
              kg
            </span>
          </div>
        </div>

        {/* BMI 결과 */}
        {bmi && bmiInfo ? (
          <div
            className="flex items-center justify-between rounded-2xl px-5 py-4 mt-1"
            style={{ background: `${bmiInfo.color}15` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-xs font-semibold text-gray-400">BMI 지수</p>
                <p className="text-xl font-black text-gray-800">
                  {bmi.toFixed(1)}
                </p>
              </div>
            </div>
            <span
              className="text-sm font-black px-4 py-1.5 rounded-full text-white"
              style={{ background: bmiInfo.color }}
            >
              {bmiInfo.label}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl px-5 py-4 mt-1 bg-gray-100">
            <span className="text-2xl">📊</span>
            <p className="text-sm text-gray-400 font-semibold">
              키와 몸무게를 입력하면 BMI가 계산돼요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 4: 활동 유형 ────────────────────────────────────────────────────────

function ActivityTypeCard({
  activityType,
  selected,
  onSelect,
}: {
  activityType: ActivityType;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center rounded-2xl border-2 p-4 transition-all"
      style={{
        borderColor: selected ? "var(--color-primary)" : "#e5e7eb",
        background: selected ? "var(--color-primary-light, #fff0ec)" : "white",
      }}
    >
      <div
        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${activityType.gradient} flex items-center justify-center text-3xl mb-2`}
      >
        {activityType.emoji}
      </div>

      <span
        className="text-sm font-black"
        style={{ color: selected ? "var(--color-primary)" : "#374151" }}
      >
        {activityType.name}
      </span>
      <span className="text-xs text-gray-400 mt-0.5 text-center leading-tight">
        {activityType.style}
      </span>
      <span
        className="text-xs mt-1.5 font-semibold text-gray-400"
      >
        🔥 분당 {activityType.kcalPerMin}kcal 소모
      </span>
    </button>
  );
}

function StepActivityType({
  activityTypeId,
  setActivityTypeId,
}: {
  activityTypeId: number | null;
  setActivityTypeId: (id: number) => void;
}) {
  return (
    <div className="flex flex-col items-center pt-4">
      <h2 className="text-2xl font-black text-gray-800 text-center mb-1">
        나의 운동 스타일은?
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        운동 스타일에 맞는 맞춤 식단을 추천해드려요.
      </p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {activityTypes.map((c) => (
          <ActivityTypeCard
            key={c.id}
            activityType={c}
            selected={activityTypeId === c.id}
            onSelect={() => setActivityTypeId(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Step 5: 캐릭터 ───────────────────────────────────────────────────────────

function StepCharacter({
  characterId,
  setCharacterId,
}: {
  characterId: string | null;
  setCharacterId: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center pt-4">
      <h2 className="text-2xl font-black text-gray-800 text-center mb-1">
        함께할 캐릭터를 골라주세요
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        홈과 마이페이지에 표시되는 나만의 캐릭터예요.
      </p>
      <CharacterGrid selectedId={characterId} onSelect={setCharacterId} />
    </div>
  );
}

// ─── 메인 온보딩 ──────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const { updateProfile } = useUser();
  const { selectActivityType } = useActivityType();
  const { selectCharacter } = useCharacter();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityTypeId, setActivityTypeId] = useState<number | null>(null);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const a = parseInt(age);
  const h = parseFloat(height);
  const w = parseFloat(weight);
  const bmiValue =
    h > 0 && w > 0 ? parseFloat((w / (h / 100) ** 2).toFixed(1)) : null;

  // 닉네임 실시간 중복 체크 (500ms 디바운스)
  useEffect(() => {
    if (step !== 1) return;
    const trimmed = nickname.trim();
    if (!trimmed || validateNicknameLocally(trimmed)) return;

    setIsCheckingDuplicate(true);
    const timer = setTimeout(async () => {
      const { isDuplicate } = await checkNicknameDuplicate(trimmed, "");
      setIsCheckingDuplicate(false);
      if (isDuplicate) setNicknameError("이미 사용 중인 닉네임이에요.");
    }, 500);

    return () => {
      clearTimeout(timer);
      setIsCheckingDuplicate(false);
    };
  }, [nickname, step]);

  const canProceed =
    (step === 1 && nickname.trim().length >= 2 && !nicknameError && !isCheckingDuplicate) ||
    (step === 2 && gender !== null) ||
    (step === 3 &&
      a >= 1 &&
      a <= 120 &&
      h >= 100 &&
      h <= 250 &&
      w >= 20 &&
      w <= 300) ||
    (step === 4 && activityTypeId !== null) ||
    (step === 5 && characterId !== null);

  const handleNext = async () => {
    if (step === 1) {
      const localError = validateNicknameLocally(nickname);
      if (localError) { setNicknameError(localError); return; }
      if (nicknameError) return;
      setNicknameError(null);
      setStep((s) => s + 1);
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    setIsSubmitting(true);
    const { error } = await updateProfile({
      nickname: nickname.trim(),
      gender: gender as string,
      age: a || null,
      height: h || null,
      weight: w || null,
      bmi: bmiValue,
      activity_type_id: activityTypeId,
      character_id: characterId,
    });
    if (error) {
      console.error("온보딩 프로필 저장 실패:", error);
    }
    if (activityTypeId !== null) selectActivityType(activityTypeId);
    if (characterId !== null) await selectCharacter(characterId);
    setIsSubmitting(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-gray-50">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center justify-center gap-2 pt-14 pb-4">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
          const s = i + 1;
          return (
            <div
              key={s}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: s === step ? "28px" : "8px",
                background: s <= step ? "var(--color-primary)" : "#e5e7eb",
              }}
            />
          );
        })}
      </div>

      {/* 뒤로 가기 */}
      {step > 1 && (
        <button
          onClick={() => setStep((s) => s - 1)}
          className="absolute top-5 left-5 text-gray-400 text-sm font-semibold px-2 py-1"
          aria-label="이전 단계"
        >
          ← 이전
        </button>
      )}

      {/* 단계별 컨텐츠 */}
      <div className="flex-1 px-6 overflow-y-auto">
        {step === 1 && (
          <StepNickname
            nickname={nickname}
            onChange={(v) => {
              setNickname(v);
              setNicknameError(v.trim() ? validateNicknameLocally(v) : null);
            }}
            error={nicknameError}
            isChecking={isCheckingDuplicate}
          />
        )}
        {step === 2 && <StepGender gender={gender} setGender={setGender} />}
        {step === 3 && (
          <StepBody
            age={age}
            setAge={setAge}
            height={height}
            setHeight={setHeight}
            weight={weight}
            setWeight={setWeight}
          />
        )}
        {step === 4 && (
          <StepActivityType
            activityTypeId={activityTypeId}
            setActivityTypeId={setActivityTypeId}
          />
        )}
        {step === 5 && (
          <StepCharacter
            characterId={characterId}
            setCharacterId={setCharacterId}
          />
        )}
      </div>

      {/* 다음 버튼 */}
      <div className="p-6 pb-10">
        <button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          aria-label={step === TOTAL_STEPS ? "온보딩 완료" : "다음 단계"}
          className="w-full py-4 rounded-2xl font-black text-white text-base disabled:opacity-40 transition-all"
          style={{ background: "var(--color-primary)" }}
        >
          {step === TOTAL_STEPS
            ? isSubmitting
              ? "저장 중..."
              : "시작하기 🚀"
            : "다음 →"}
        </button>
      </div>
    </div>
  );
}
