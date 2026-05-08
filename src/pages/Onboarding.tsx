import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { characters, type Character } from "../data/characters";

type Gender = "male" | "female";

// ─── Step 1: 닉네임 ───────────────────────────────────────────────────────────

function StepNickname({
  nickname,
  setNickname,
}: {
  nickname: string;
  setNickname: (v: string) => void;
}) {
  return (
    <div className="flex flex-col items-center pt-6">
      <div className="text-7xl mb-6">👋</div>
      <h2 className="text-2xl font-black text-gray-800 text-center leading-snug mb-2">
        안녕하세요!<br />어떻게 불러드릴까요?
      </h2>
      <p className="text-gray-400 text-sm mb-10">앱에서 사용할 닉네임을 입력해주세요.</p>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value.slice(0, 10))}
        placeholder="닉네임 (최대 10자)"
        maxLength={10}
        className="w-full px-5 py-4 rounded-2xl bg-white border-2 text-gray-800 text-base font-semibold placeholder-gray-300 focus:outline-none transition-colors"
        style={{
          borderColor: nickname.trim() ? "var(--color-primary)" : "#e5e7eb",
        }}
        autoFocus
      />
      <p className="self-end mt-2 text-xs text-gray-300">{nickname.length}/10</p>
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
  const options: { value: Gender; emoji: string; label: string }[] = [
    { value: "male", emoji: "🙋‍♂️", label: "남성" },
    { value: "female", emoji: "🙋‍♀️", label: "여성" },
  ];

  return (
    <div className="flex flex-col items-center pt-6">
      <div className="text-7xl mb-6">🏅</div>
      <h2 className="text-2xl font-black text-gray-800 text-center mb-2">
        성별을 알려주세요
      </h2>
      <p className="text-gray-400 text-sm mb-10">맞춤 운동 추천에 활용돼요.</p>
      <div className="flex gap-4 w-full">
        {options.map(({ value, emoji, label }) => {
          const selected = gender === value;
          return (
            <button
              key={value}
              onClick={() => setGender(value)}
              className="flex-1 flex flex-col items-center gap-3 py-8 rounded-2xl border-2 font-bold text-lg transition-all"
              style={{
                borderColor: selected ? "var(--color-primary)" : "#e5e7eb",
                background: selected ? "var(--color-primary-light, #fff0ec)" : "white",
                color: selected ? "var(--color-primary)" : "#9ca3af",
              }}
            >
              <span className="text-5xl">{emoji}</span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: 캐릭터 ───────────────────────────────────────────────────────────

function CharacterCard({
  character,
  selected,
  onSelect,
}: {
  character: Character;
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
      {/*
        캐릭터 이미지 교체 포인트:
        character.image_url 이 준비되면 아래 div를 <img> 태그로 교체하세요.
        <img src={character.image_url} alt={character.name} className="w-16 h-16 object-contain" />
      */}
      <div
        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${character.gradient} flex items-center justify-center text-3xl mb-2`}
      >
        {character.emoji}
      </div>

      <span
        className="text-sm font-black"
        style={{ color: selected ? "var(--color-primary)" : "#374151" }}
      >
        {character.name}
      </span>
      <span className="text-xs text-gray-400 mt-0.5 text-center leading-tight">
        {character.style}
      </span>
      <span className="text-xs mt-1.5 font-semibold" style={{ color: "var(--color-primary)" }}>
        {character.bonusIcon} {character.bonus}
      </span>
    </button>
  );
}

function StepCharacter({
  characterId,
  setCharacterId,
}: {
  characterId: number | null;
  setCharacterId: (id: number) => void;
}) {
  return (
    <div className="flex flex-col items-center pt-4">
      <h2 className="text-2xl font-black text-gray-800 text-center mb-1">
        나의 운동 스타일은?
      </h2>
      <p className="text-gray-400 text-sm mb-6">캐릭터마다 다른 보너스를 받아요.</p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {characters.map((c) => (
          <CharacterCard
            key={c.id}
            character={c}
            selected={characterId === c.id}
            onSelect={() => setCharacterId(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── 메인 온보딩 ──────────────────────────────────────────────────────────────

const TOTAL_STEPS = 3;

export default function Onboarding() {
  const { updateProfile } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [characterId, setCharacterId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceed =
    (step === 1 && nickname.trim().length >= 1) ||
    (step === 2 && gender !== null) ||
    (step === 3 && characterId !== null);

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    setIsSubmitting(true);
    await updateProfile({
      nickname: nickname.trim(),
      gender: gender as string,
      character_id: characterId,
    });
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
          <StepNickname nickname={nickname} setNickname={setNickname} />
        )}
        {step === 2 && (
          <StepGender gender={gender} setGender={setGender} />
        )}
        {step === 3 && (
          <StepCharacter characterId={characterId} setCharacterId={setCharacterId} />
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
            ? isSubmitting ? "저장 중..." : "시작하기 🚀"
            : "다음 →"}
        </button>
      </div>
    </div>
  );
}
