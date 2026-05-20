import { useState, useEffect } from "react";
import { HiBadgeCheck, HiLockClosed, HiX } from "react-icons/hi";
import { useUser } from "../../context/UserContext";
import {
  NICKNAME_CHANGE_COOLDOWN_DAYS,
  NICKNAME_MAX_LENGTH,
  getRemainingCooldownDays,
  validateNicknameLocally,
} from "../../data/nicknameFilters";
import { checkNicknameDuplicate } from "../../lib/userService";

export function NicknameSheet({
  current,
  lastChangedAt,
  currentUserId,
  onClose,
}: {
  current: string;
  lastChangedAt: string | null;
  currentUserId: string;
  onClose: () => void;
}) {
  const { updateProfile } = useUser();
  const [value, setValue] = useState(current);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const remainingDays = getRemainingCooldownDays(lastChangedAt);
  const isLocked = remainingDays > 0;

  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === current || validateNicknameLocally(trimmed)) return;

    setIsCheckingDuplicate(true);
    const timer = setTimeout(async () => {
      const { isDuplicate } = await checkNicknameDuplicate(trimmed, currentUserId);
      setIsCheckingDuplicate(false);
      if (isDuplicate) setError("이미 사용 중인 닉네임이에요.");
    }, 500);

    return () => {
      clearTimeout(timer);
      setIsCheckingDuplicate(false);
    };
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    setError(next.trim() ? validateNicknameLocally(next) : null);
  }

  async function handleSave() {
    const trimmed = value.trim();
    const localError = validateNicknameLocally(trimmed);
    if (localError) { setError(localError); return; }
    if (error) return;

    setIsSaving(true);
    const result = await updateProfile({
      nickname: trimmed,
      nickname_changed_at: new Date().toISOString(),
    });
    setIsSaving(false);
    if (result.error) setError(result.error);
    else setDone(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={done ? undefined : onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
            >
              <HiBadgeCheck size={36} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-gray-800">변경 완료!</p>
              <p className="text-sm text-gray-400 mt-1">
                닉네임이{" "}
                <span className="font-bold text-gray-600">{value.trim()}</span>
                {" "}으로 변경됐어요.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition shadow-md"
              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-gray-800">닉네임 변경</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                aria-label="닫기"
              >
                <HiX size={16} />
              </button>
            </div>

            {isLocked ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <HiLockClosed size={28} className="text-gray-400" />
                </div>
                <p className="text-sm font-bold text-gray-700 text-center">
                  닉네임은 {NICKNAME_CHANGE_COOLDOWN_DAYS}일에 한 번 변경할 수 있어요.
                </p>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 text-center w-full">
                  <p className="text-xs text-gray-400 mb-0.5">다음 변경 가능일까지</p>
                  <p className="text-xl font-extrabold text-[var(--color-primary)]">
                    {remainingDays}일 남음
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 w-full py-4 rounded-2xl font-bold text-sm bg-gray-100 text-gray-500"
                >
                  확인
                </button>
              </div>
            ) : (
              <>
                <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 mb-2 ${error ? "bg-red-50" : "bg-gray-50"}`}>
                  <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={`닉네임 입력 (2~${NICKNAME_MAX_LENGTH}자)`}
                    maxLength={NICKNAME_MAX_LENGTH}
                    className="flex-1 bg-transparent text-base font-bold text-gray-800 outline-none placeholder:text-gray-300"
                    autoFocus
                  />
                  <span className="text-xs text-gray-400">{value.length}/{NICKNAME_MAX_LENGTH}</span>
                </div>
                <p className="text-xs text-gray-400 px-1 mb-1">
                  한글·영문·숫자만 사용 가능 · 공백·특수문자 불가
                </p>
                {error && <p className="text-xs text-red-500 mb-1 px-1">{error}</p>}
                {!error && isCheckingDuplicate && (
                  <p className="text-xs text-gray-400 mb-1 px-1">중복 확인 중...</p>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !value.trim() || value.trim() === current || !!error || isCheckingDuplicate}
                  className="mt-3 w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition shadow-md disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                >
                  {isSaving ? "저장 중..." : "저장하기"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
