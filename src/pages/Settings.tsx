import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiBell,
  HiClipboardList,
  HiGlobeAlt,
  HiPencil,
  HiMail,
  HiInformationCircle,
  HiLockClosed,
  HiDocumentText,
  HiChatAlt2,
  HiShieldCheck,
  HiColorSwatch,
  HiBadgeCheck,
  HiX,
} from "react-icons/hi";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { useSettings, type Language } from "../hooks/useSettings";
import Modal from "../components/ui/Modal";
import SettingsRow from "../components/ui/SettingsRow";
import {
  NICKNAME_CHANGE_COOLDOWN_DAYS,
  NICKNAME_MAX_LENGTH,
  getRemainingCooldownDays,
  validateNicknameLocally,
} from "../data/nicknameFilters";
import { checkNicknameDuplicate } from "../lib/userService";

type Theme = "energy" | "nature" | "cosmo";

const themes: { value: Theme; label: string; gradient: string }[] = [
  { value: "energy", label: "에너지", gradient: "from-orange-500 to-red-500" },
  { value: "nature", label: "자연", gradient: "from-green-500 to-lime-500" },
  { value: "cosmo", label: "코스모", gradient: "from-blue-500 to-purple-500" },
];

const LANGUAGE_LABELS: Record<Language, string> = {
  ko: "한국어",
  en: "English",
};

// ── 토글 스위치 ──────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={on ? "끄기" : "켜기"}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
        on ? "bg-[var(--color-primary)]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── 언어 선택 시트 ───────────────────────────────────────
function LanguageSheet({
  current,
  onSelect,
  onClose,
}: {
  current: Language;
  onSelect: (l: Language) => void;
  onClose: () => void;
}) {
  const languages: {
    value: Language;
    label: string;
    native: string;
    flag: string;
  }[] = [
    { value: "ko", label: "한국어", native: "Korean", flag: "🇰🇷" },
    { value: "en", label: "English", native: "영어", flag: "🇺🇸" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-5 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold text-gray-800">언어 선택</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {languages.map((lang) => {
            const isSelected = current === lang.value;
            return (
              <button
                key={lang.value}
                onClick={() => {
                  onSelect(lang.value);
                  onClose();
                }}
                className={`flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <p
                      className={`font-bold text-sm ${
                        isSelected
                          ? "text-[var(--color-primary)]"
                          : "text-gray-700"
                      }`}
                    >
                      {lang.label}
                    </p>
                    <p className="text-xs text-gray-400">{lang.native}</p>
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-primary)" }}
                  >
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 닉네임 변경 시트 ─────────────────────────────────────
function NicknameSheet({
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

  // 실시간 중복 체크 (500ms 디바운스)
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
    if (result.error) {
      setError(result.error);
    } else {
      setDone(true);
    }
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
        {/* 성공 화면 */}
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
                닉네임이 <span className="font-bold text-gray-600">{value.trim()}</span> 으로 변경됐어요.
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
              /* 쿨타임 중 잠금 UI */
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
              /* 변경 폼 */
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

// ── 텍스트 바텀시트 ──────────────────────────────────────
function TextSheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 pb-10 shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-extrabold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 text-sm text-gray-500 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── 섹션 헤더 ────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-bold text-gray-400 px-1 mt-2 mb-1">{label}</p>
  );
}

// ── Settings 메인 ────────────────────────────────────────
type Sheet = "language" | "nickname" | "privacy" | "terms" | "appinfo" | null;

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { logout, userProfile, user } = useUser();
  const { settings, toggleNotification, setLanguage } = useSettings();
  const navigate = useNavigate();

  const [sheet, setSheet] = useState<Sheet>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="flex flex-col gap-1 p-4 pb-28 bg-bg min-h-full">
      <h2 className="text-xl font-extrabold text-gray-800 px-1 mb-2">설정</h2>

      {/* 테마 */}
      <SectionLabel label="테마" />
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
          <span className="w-6 h-6 flex items-center justify-center text-gray-400">
            <HiColorSwatch size={20} />
          </span>
          <p className="text-sm font-semibold text-gray-700">테마 선택</p>
        </div>
        <div className="p-4 flex gap-2">
          {themes.map((t) => {
            const isActive = theme === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                aria-label={`${t.label} 테마 선택`}
                className={`flex-1 flex flex-col items-center gap-2 rounded-xl py-3 border-2 transition-all ${
                  isActive
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-[1.02]"
                    : "border-transparent bg-gray-50"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.gradient}`}
                />
                <span
                  className={`text-xs font-bold ${
                    isActive ? "text-[var(--color-primary)]" : "text-gray-500"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 알림 */}
      <SectionLabel label="알림" />
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
        <SettingsRow
          icon={<HiBell size={20} />}
          label="운동 알림"
          description="운동 시작·종료 알림"
          right={
            <Toggle
              on={settings.workoutNotification}
              onToggle={() => toggleNotification("workoutNotification")}
            />
          }
        />
        <SettingsRow
          icon={<HiClipboardList size={20} />}
          label="식단 알림"
          description="식사 시간 알림"
          right={
            <Toggle
              on={settings.dietNotification}
              onToggle={() => toggleNotification("dietNotification")}
            />
          }
        />
      </div>

      {/* 언어 */}
      <SectionLabel label="언어" />
      <div className="bg-white rounded-2xl shadow-sm">
        <SettingsRow
          icon={<HiGlobeAlt size={20} />}
          label="언어 설정"
          description={LANGUAGE_LABELS[settings.language]}
          onClick={() => setSheet("language")}
        />
      </div>

      {/* 계정 */}
      <SectionLabel label="계정" />
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
        <SettingsRow
          icon={<HiPencil size={20} />}
          label="닉네임 변경"
          description={userProfile?.nickname ?? "—"}
          onClick={() => setSheet("nickname")}
        />
        <SettingsRow
          icon={<HiMail size={20} />}
          label="이메일"
          right={
            <span className="text-xs text-gray-400 font-semibold max-w-[150px] truncate">
              {user?.email ?? "—"}
            </span>
          }
        />
      </div>

      {/* 정보 */}
      <SectionLabel label="정보" />
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
        <SettingsRow
          icon={<HiInformationCircle size={20} />}
          label="앱 정보"
          description="버전 1.0.0"
          onClick={() => setSheet("appinfo")}
        />
        <SettingsRow
          icon={<HiLockClosed size={20} />}
          label="개인정보 처리방침"
          onClick={() => setSheet("privacy")}
        />
        <SettingsRow
          icon={<HiDocumentText size={20} />}
          label="이용약관"
          onClick={() => setSheet("terms")}
        />
        <SettingsRow
          icon={<HiChatAlt2 size={20} />}
          label="문의하기"
          description="devhy5174@gmail.com"
          right={null}
          onClick={() => {
            window.location.href = "mailto:devhy5174@gmail.com";
          }}
        />
      </div>

      {/* 관리자 */}
      {userProfile?.is_admin && (
        <>
          <SectionLabel label="관리자" />
          <div className="bg-white rounded-2xl shadow-sm">
            <SettingsRow
              icon={<HiShieldCheck size={20} />}
              label="관리자 페이지"
              description="이벤트·유저·통계 관리"
              onClick={() => navigate("/admin")}
            />
          </div>
        </>
      )}

      {/* 로그아웃 */}
      <div className="mt-4">
        <button
          onClick={() => setShowLogoutModal(true)}
          aria-label="로그아웃"
          className="w-full py-4 rounded-2xl font-bold text-sm text-red-500 bg-white shadow-sm hover:bg-red-50 active:scale-[0.98] transition"
        >
          로그아웃
        </button>
      </div>

      {/* 시트/모달 */}
      {sheet === "language" && (
        <LanguageSheet
          current={settings.language}
          onSelect={setLanguage}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === "nickname" && user && (
        <NicknameSheet
          current={userProfile?.nickname ?? ""}
          lastChangedAt={userProfile?.nickname_changed_at ?? null}
          currentUserId={user.id}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === "appinfo" && (
        <TextSheet title="앱 정보" onClose={() => setSheet(null)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 py-2">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                🏃
              </div>
              <div>
                <p className="font-extrabold text-gray-800 text-lg">
                  WorkoutApp
                </p>
                <p className="text-sm text-gray-400">버전 1.0.0</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: "버전", value: "1.0.0" },
                { label: "빌드", value: "2026.05" },
                { label: "개발사", value: "WorkoutApp Team" },
                { label: "지원 OS", value: "iOS 15+ / Android 10+" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                >
                  <span className="text-sm text-gray-500 font-semibold">
                    {label}
                  </span>
                  <span className="text-sm text-gray-800 font-bold">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TextSheet>
      )}

      {sheet === "privacy" && (
        <TextSheet title="개인정보 처리방침" onClose={() => setSheet(null)}>
          <div className="flex flex-col gap-4">
            <p className="font-bold text-gray-700">1. 수집하는 개인정보</p>
            <p>
              이메일, 닉네임, 운동 기록(걸음수·거리·칼로리), 신체
              정보(키·몸무게)를 수집합니다.
            </p>
            <p className="font-bold text-gray-700">2. 이용 목적</p>
            <p>
              서비스 제공, 운동 통계 분석, 개인화된 목표 제공을 위해 사용합니다.
            </p>
            <p className="font-bold text-gray-700">3. 보관 기간</p>
            <p>회원 탈퇴 시까지 보관하며, 탈퇴 후 즉시 파기합니다.</p>
            <p className="font-bold text-gray-700">4. 제3자 제공</p>
            <p>법령에 따른 경우를 제외하고 제3자에게 제공하지 않습니다.</p>
            <p className="font-bold text-gray-700">5. 문의</p>
            <p>개인정보 관련 문의: support@workoutapp.com</p>
          </div>
        </TextSheet>
      )}

      {sheet === "terms" && (
        <TextSheet title="이용약관" onClose={() => setSheet(null)}>
          <div className="flex flex-col gap-4">
            <p className="font-bold text-gray-700">제1조 (목적)</p>
            <p>
              본 약관은 WorkoutApp 서비스 이용에 관한 조건 및 절차를 규정합니다.
            </p>
            <p className="font-bold text-gray-700">제2조 (서비스 이용)</p>
            <p>
              서비스는 개인 운동 기록 관리 및 커뮤니티 기능을 제공합니다.
              타인에게 해가 되는 행위는 금지됩니다.
            </p>
            <p className="font-bold text-gray-700">제3조 (계정 관리)</p>
            <p>
              계정 정보는 본인이 직접 관리해야 하며, 타인에게 양도할 수
              없습니다.
            </p>
            <p className="font-bold text-gray-700">제4조 (서비스 변경·중단)</p>
            <p>
              운영상 불가피한 경우 서비스 내용을 변경하거나 중단할 수 있습니다.
            </p>
            <p className="font-bold text-gray-700">제5조 (문의)</p>
            <p>이용약관 관련 문의: support@workoutapp.com</p>
          </div>
        </TextSheet>
      )}

      <Modal
        isOpen={showLogoutModal}
        title="로그아웃"
        message="정말 로그아웃 하시겠어요?"
        onConfirm={handleLogout}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
