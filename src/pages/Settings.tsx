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
          <div className="flex flex-col gap-5 text-gray-600">
            <p className="text-xs text-gray-400">시행일: 2026년 5월 20일</p>

            <p className="text-xs leading-relaxed">
              함께걸어요(이하 "서비스")는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」을 준수합니다.
              본 방침은 서비스가 수집하는 개인정보의 항목, 이용 목적, 보유 기간 및 이용자 권리를 안내합니다.
            </p>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-2">제1조. 수집하는 개인정보 항목</p>
              <p className="text-xs font-semibold text-gray-500 mb-1">① 회원가입 및 프로필</p>
              <p className="text-xs leading-relaxed mb-2">이메일 주소, 닉네임, 성별, 나이, 신장(cm), 체중(kg), BMI, 활동 유형(산책·파워워킹·러닝·등산), 캐릭터 선택, 앱 테마·언어 설정</p>
              <p className="text-xs font-semibold text-gray-500 mb-1">② 소셜 로그인</p>
              <p className="text-xs leading-relaxed mb-2">카카오 또는 구글 계정으로 가입 시 해당 플랫폼으로부터 이메일 주소를 제공받습니다.</p>
              <p className="text-xs font-semibold text-gray-500 mb-1">③ 운동 기록</p>
              <p className="text-xs leading-relaxed mb-2">운동 날짜, 걸음수, 이동거리(km), 소모 칼로리, 운동 시간(분), 운동 유형, 목표 달성 여부, 획득 포인트</p>
              <p className="text-xs font-semibold text-gray-500 mb-1">④ 파티·커뮤니티 활동</p>
              <p className="text-xs leading-relaxed mb-2">파티 참가 기록, 작성한 커뮤니티 게시물 및 응원, 파티 내 공지·응원 메시지</p>
              <p className="text-xs font-semibold text-gray-500 mb-1">⑤ 알림 및 기기 정보</p>
              <p className="text-xs leading-relaxed">웹 푸시 알림 동의 시 기기 엔드포인트(endpoint), 암호화 키(p256dh, auth)가 수집됩니다. 알림 수신 여부와 설정 정보는 기기 로컬 저장소(localStorage)에 저장됩니다.</p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-2">제2조. 개인정보 수집 및 이용 목적</p>
              <ul className="text-xs leading-relaxed list-disc list-inside space-y-1">
                <li>회원 식별 및 서비스 제공</li>
                <li>운동 기록 저장·분석 및 맞춤 목표·식단 가이드 제공</li>
                <li>포인트·칭호 이벤트 보상 관리</li>
                <li>파티·커뮤니티 소셜 기능 운영</li>
                <li>운동 스트릭, 목표 달성 알림 발송</li>
                <li>부정 이용 방지 및 서비스 품질 개선</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-2">제3조. 개인정보 보유 및 이용 기간</p>
              <p className="text-xs leading-relaxed">
                회원 탈퇴 시까지 보유하며, 탈퇴 후 지체 없이 파기합니다.
                단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 별도 보관합니다.
              </p>
              <ul className="text-xs leading-relaxed list-disc list-inside space-y-1 mt-1">
                <li>전자상거래 관련 기록: 5년 (전자상거래법)</li>
                <li>소비자 불만·분쟁 기록: 3년 (전자상거래법)</li>
                <li>접속 로그: 3개월 (통신비밀보호법)</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-2">제4조. 개인정보 처리 위탁</p>
              <p className="text-xs leading-relaxed mb-2">서비스는 원활한 운영을 위해 아래 업체에 개인정보 처리를 위탁합니다.</p>
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                {[
                  { company: "Supabase Inc. (미국)", task: "데이터베이스·인증·실시간 동기화 서버 운영" },
                  { company: "Kakao Corp. (한국)", task: "카카오 소셜 로그인 인증" },
                  { company: "Google LLC (미국)", task: "구글 소셜 로그인 인증" },
                ].map(({ company, task }) => (
                  <div key={company}>
                    <p className="text-xs font-bold text-gray-700">{company}</p>
                    <p className="text-xs text-gray-500">{task}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">위탁 업체는 위탁받은 업무 범위 내에서만 개인정보를 처리합니다.</p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-2">제5조. 제3자 제공</p>
              <p className="text-xs leading-relaxed">
                법령에 따른 경우(수사기관 요청 등)를 제외하고, 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
                커뮤니티·파티 기능에서 이용자가 직접 공개한 닉네임, 게시물, 걸음수 등은 다른 이용자에게 노출될 수 있습니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-2">제6조. 이용자의 권리</p>
              <p className="text-xs leading-relaxed mb-1">이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
              <ul className="text-xs leading-relaxed list-disc list-inside space-y-1">
                <li>개인정보 열람 요청</li>
                <li>오류 정정 요청 (닉네임·신체 정보 등 앱 내에서 직접 수정 가능)</li>
                <li>처리 정지 및 삭제 요청 (아래 문의처로 연락)</li>
                <li>회원 탈퇴 (아래 문의처로 연락)</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-2">제7조. 개인정보의 안전성 확보 조치</p>
              <ul className="text-xs leading-relaxed list-disc list-inside space-y-1">
                <li>HTTPS(TLS) 암호화 통신 적용</li>
                <li>Supabase Row Level Security(RLS)를 통한 데이터 접근 제어</li>
                <li>비밀번호는 bcrypt 해시 처리되어 저장</li>
                <li>관리자 계정 별도 권한 관리</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-2">제8조. 자동 수집 정보</p>
              <p className="text-xs leading-relaxed">
                서비스는 편의 기능을 위해 브라우저 localStorage에 앱 설정, 운동 기록 캐시, 알림 설정 등을 저장합니다.
                이는 이용자 기기에만 저장되며, 서버로 별도 전송되지 않습니다. 브라우저 데이터 삭제 시 함께 삭제됩니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-2">제9조. 개인정보 보호책임자 및 문의</p>
              <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
                <p><span className="font-semibold text-gray-700">서비스명:</span> 함께걸어요</p>
                <p><span className="font-semibold text-gray-700">문의 이메일:</span> devhy5174@gmail.com</p>
                <p><span className="font-semibold text-gray-700">카카오톡 채널:</span> 설정 &gt; 문의하기</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                개인정보 침해 관련 신고는 개인정보보호위원회(privacy.go.kr) 또는 한국인터넷진흥원(118)에 문의하실 수 있습니다.
              </p>
            </div>

            <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
              본 방침은 법령·서비스 변경에 따라 개정될 수 있으며, 변경 시 앱 내 공지를 통해 안내합니다.
            </p>
          </div>
        </TextSheet>
      )}

      {sheet === "terms" && (
        <TextSheet title="이용약관" onClose={() => setSheet(null)}>
          <div className="flex flex-col gap-5 text-gray-600">
            <p className="text-xs text-gray-400">시행일: 2026년 5월 20일</p>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제1조 (목적)</p>
              <p className="text-xs leading-relaxed">
                본 약관은 함께걸어요(이하 "서비스")가 제공하는 운동 기록·파티·커뮤니티 서비스의 이용 조건 및 절차, 운영자와 회원 간의 권리·의무를 규정합니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제2조 (약관의 효력 및 변경)</p>
              <p className="text-xs leading-relaxed">
                본 약관은 회원가입 시 동의함으로써 효력이 발생합니다. 운영자는 필요 시 약관을 변경할 수 있으며, 변경 내용은 앱 내 공지 또는 알림을 통해 시행 7일 전 안내합니다. 변경 후에도 서비스를 계속 이용하면 변경된 약관에 동의한 것으로 간주합니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제3조 (회원 가입 및 자격)</p>
              <p className="text-xs leading-relaxed mb-1">
                만 14세 이상이면 누구나 가입할 수 있습니다. 가입 시 정확한 정보를 입력해야 하며, 허위 정보 입력으로 인한 불이익은 회원 본인이 부담합니다.
              </p>
              <p className="text-xs leading-relaxed">
                운영자는 다음에 해당하는 경우 가입을 거부하거나 이용을 제한할 수 있습니다: 타인 명의 도용, 이전에 이용 자격을 박탈당한 경우, 기타 운영 정책 위반.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제4조 (회원 탈퇴)</p>
              <p className="text-xs leading-relaxed">
                회원은 언제든지 탈퇴를 요청할 수 있으며, 운영자에게 이메일(devhy5174@gmail.com)로 요청하면 처리됩니다. 탈퇴 시 칭호·이벤트 보상 등 서비스 내 혜택은 즉시 소멸되며 복구되지 않습니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제5조 (서비스 제공)</p>
              <p className="text-xs leading-relaxed mb-1">서비스는 다음 기능을 제공합니다.</p>
              <ul className="text-xs leading-relaxed list-disc list-inside space-y-1">
                <li>걸음수·운동 기록 저장 및 통계</li>
                <li>파티 생성·참가 및 함께 걷기</li>
                <li>커뮤니티 게시물 작성 및 응원</li>
                <li>칭호·말풍선 등 이벤트 보상</li>
                <li>맞춤 식단 가이드 및 운동 알림</li>
                <li>프리미엄 구독 기능 (향후 제공 예정)</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제6조 (이벤트 보상)</p>
              <p className="text-xs leading-relaxed">
                칭호, 말풍선, 인증카드 프레임 등 이벤트 보상은 서비스 이용 편의를 위한 가상 혜택이며, 현금·상품권으로 교환하거나 타인에게 양도·판매할 수 없습니다.
                보상은 운영 정책에 따라 조정될 수 있으며, 회원 탈퇴 또는 서비스 종료 시 소멸됩니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제7조 (유료 서비스)</p>
              <p className="text-xs leading-relaxed">
                프리미엄 구독 등 유료 서비스 이용 시 별도 안내되는 결제 조건이 적용됩니다.
                구독 결제는 이용 기간 만료 전 자동 갱신될 수 있으며, 환불은 앱스토어(Google Play, App Store) 환불 정책에 따릅니다.
                콘텐츠 이용 후 단순 변심에 의한 환불은 제한될 수 있습니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제8조 (회원 의무 및 금지 행위)</p>
              <p className="text-xs leading-relaxed mb-1">회원은 다음 행위를 해서는 안 됩니다.</p>
              <ul className="text-xs leading-relaxed list-disc list-inside space-y-1">
                <li>타인의 개인정보 도용 또는 허위 정보 등록</li>
                <li>다른 회원에 대한 욕설·비방·혐오 표현 게시</li>
                <li>서비스 운영을 방해하는 행위 (서버 과부하, 크롤링 등)</li>
                <li>걸음수·운동 기록 조작 등 허위 데이터 입력</li>
                <li>광고·스팸성 게시물 반복 작성</li>
                <li>법령 또는 공서양속에 반하는 행위</li>
              </ul>
              <p className="text-xs text-gray-400 mt-1">위반 시 운영자는 사전 통보 없이 이용을 제한하거나 계정을 삭제할 수 있습니다.</p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제9조 (게시물 및 콘텐츠)</p>
              <p className="text-xs leading-relaxed">
                회원이 작성한 게시물의 저작권은 해당 회원에게 귀속됩니다.
                단, 운영자는 서비스 운영·홍보 목적으로 게시물을 활용할 수 있으며, 법령 위반·타인 권리 침해에 해당하는 게시물은 사전 통보 없이 삭제할 수 있습니다.
                회원 탈퇴 후 공개된 게시물은 서비스 운영상 일정 기간 유지될 수 있습니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제10조 (서비스 변경 및 중단)</p>
              <p className="text-xs leading-relaxed">
                운영자는 서비스 내용을 추가·변경·종료할 수 있으며, 중요한 변경은 사전에 공지합니다.
                천재지변, 서버 장애, 기술적 문제 등 불가항력적 사유로 인한 서비스 중단에 대해 운영자는 책임을 지지 않습니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제11조 (면책 조항)</p>
              <p className="text-xs leading-relaxed">
                서비스는 운동 기록 및 건강 정보를 참고용으로 제공합니다. 식단·운동 정보는 의료적 조언이 아니며, 건강 관련 결정은 전문가와 상담하시기 바랍니다.
                회원 간 파티·커뮤니티 활동에서 발생한 분쟁은 당사자 간에 해결해야 하며, 운영자는 이에 대한 책임을 지지 않습니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제12조 (준거법 및 분쟁 해결)</p>
              <p className="text-xs leading-relaxed">
                본 약관은 대한민국 법률에 따라 해석됩니다. 분쟁은 우선 협의로 해결하며, 합의가 이루어지지 않을 경우 민사소송법상 관할 법원을 제1심 법원으로 합니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">제13조 (문의)</p>
              <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
                <p><span className="font-semibold text-gray-700">이메일:</span> devhy5174@gmail.com</p>
                <p><span className="font-semibold text-gray-700">카카오톡:</span> 설정 &gt; 문의하기</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
              본 약관은 2026년 5월 20일부터 시행됩니다.
            </p>
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
