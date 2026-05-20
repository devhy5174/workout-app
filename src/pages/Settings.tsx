import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiBell,
  HiGlobeAlt,
  HiPencil,
  HiMail,
  HiInformationCircle,
  HiLockClosed,
  HiDocumentText,
  HiChatAlt2,
  HiShieldCheck,
  HiColorSwatch,
} from "react-icons/hi";
import { RiKakaoTalkFill } from "react-icons/ri";
import AlertModal from "../components/ui/AlertModal";
import { FcGoogle } from "react-icons/fc";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { useSettings } from "../hooks/useSettings";
import Modal from "../components/ui/Modal";
import SettingsRow from "../components/ui/SettingsRow";
import { LanguageSheet } from "../components/settings/LanguageSheet";
import { NicknameSheet } from "../components/settings/NicknameSheet";
import { TextSheet } from "../components/settings/TextSheet";
import { SectionLabel } from "../components/settings/SectionLabel";

type Theme = "energy" | "nature" | "cosmo";

const themes: { value: Theme; label: string; gradient: string }[] = [
  { value: "energy", label: "에너지", gradient: "from-orange-500 to-red-500" },
  { value: "nature", label: "자연", gradient: "from-green-500 to-lime-500" },
  { value: "cosmo", label: "코스모", gradient: "from-blue-500 to-purple-500" },
];

const LANGUAGE_LABELS = { ko: "한국어", en: "English" } as const;

type Sheet = "language" | "nickname" | "privacy" | "terms" | "appinfo" | null;

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { logout, userProfile, user } = useUser();
  const { settings, setLanguage } = useSettings();
  const navigate = useNavigate();

  const [sheet, setSheet] = useState<Sheet>(null);
  const [pendingInquiry, setPendingInquiry] = useState<{ label: string; url: string } | null>(null);
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
      <div className="bg-white rounded-2xl shadow-sm">
        <SettingsRow
          icon={<HiBell size={20} />}
          label="알림 설정"
          description="운동·파티 알림 세부 설정"
          onClick={() => navigate("/settings/notifications")}
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
          label="로그인 계정"
          right={(() => {
            const providers: string[] =
              user?.app_metadata?.providers ??
              (user?.app_metadata?.provider
                ? [user.app_metadata.provider]
                : []);
            const isKakao = providers.includes("kakao");
            const isGoogle = providers.includes("google");
            return (
              <span className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold max-w-[160px]">
                {isKakao && (
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#FEE500" }}
                  >
                    <RiKakaoTalkFill size={10} color="#3C1E1E" />
                  </span>
                )}
                {isGoogle && <FcGoogle className="shrink-0" size={14} />}
                <span className="truncate">{user?.email ?? "—"}</span>
              </span>
            );
          })()}
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
          description="카카오톡 또는 이메일로 문의해주세요"
          right={
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="카카오톡으로 문의하기"
                onClick={() =>
                  setPendingInquiry({ label: "카카오톡 채널", url: "http://pf.kakao.com/_EnhbX/chat" })
                }
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#FEE500" }}
              >
                <RiKakaoTalkFill size={16} color="#3C1E1E" />
              </button>
              <button
                type="button"
                aria-label="이메일로 문의하기"
                onClick={() =>
                  setPendingInquiry({ label: "이메일", url: "mailto:devhy5174@gmail.com" })
                }
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <HiMail size={16} className="text-gray-500" />
              </button>
            </div>
          }
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
      {pendingInquiry && (
        <AlertModal
          icon={HiChatAlt2}
          iconClass="text-primary"
          title="외부 링크로 이동해요"
          message={`${pendingInquiry.label}(으)로 이동합니다. 계속하시겠어요?`}
          confirmLabel="이동하기"
          onConfirm={() => {
            window.open(pendingInquiry.url, "_blank");
            setPendingInquiry(null);
          }}
          onCancel={() => setPendingInquiry(null)}
        />
      )}
    </div>
  );
}
