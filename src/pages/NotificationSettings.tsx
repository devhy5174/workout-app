import { useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import {
  HiBell,
  HiUserGroup,
  HiFire,
  HiClock,
  HiSpeakerphone,
  HiLightningBolt,
  HiCake,
  HiSparkles,
  HiDeviceMobile,
  HiShieldCheck,
} from "react-icons/hi";
import { type NotificationKey, useSettings } from "../hooks/useSettings";
import { usePushSubscription } from "../hooks/usePushSubscription";
import { useUser } from "../context/UserContext";
import { Toggle } from "../components/settings/NotificationSheet";

type Settings = ReturnType<typeof useSettings>["settings"];

function SubNotificationRow({
  icon,
  label,
  description,
  on,
  onToggle,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 pl-12 ${disabled ? "opacity-40" : ""}`}>
      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-gray-300">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-600">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <Toggle on={on && !disabled} onToggle={disabled ? () => {} : onToggle} />
    </div>
  );
}

function NotificationGroup({
  icon,
  title,
  description,
  masterKey,
  settings,
  toggleNotification,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  masterKey: NotificationKey;
  settings: Settings;
  toggleNotification: (key: NotificationKey) => void;
  children?: React.ReactNode;
}) {
  const isOn = settings[masterKey] as boolean;
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-4">
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
        >
          {icon}
        </span>
        <div className="flex-1">
          <p className="text-sm font-extrabold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <Toggle on={isOn} onToggle={() => toggleNotification(masterKey)} />
      </div>
      {isOn && children && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

function PushPermissionCard({ userId }: { userId: string | null }) {
  const { permission, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushSubscription(userId);

  if (permission === "unsupported") return null;

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      const { error } = await subscribe();
      if (error) alert(error);
    }
  };

  const statusText = () => {
    if (permission === "denied") return "브라우저에서 차단됨";
    if (isSubscribed) return "푸시 알림 수신 중";
    return "탭 닫혀도 알림 받기";
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-4">
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
        >
          <HiDeviceMobile size={16} className="text-white" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-extrabold text-gray-800">기기 푸시 알림</p>
          <p className="text-xs text-gray-400 mt-0.5">{statusText()}</p>
        </div>
        {permission === "denied" ? (
          <div className="flex items-center gap-1 text-xs text-red-400 font-semibold">
            <HiShieldCheck size={13} />
            차단됨
          </div>
        ) : (
          <Toggle on={isSubscribed} onToggle={isLoading ? () => {} : handleToggle} />
        )}
      </div>
      {permission === "denied" && (
        <p className="text-xs text-gray-400 px-4 pb-3 pl-[52px]">
          브라우저 주소창 자물쇠 → 알림 허용으로 변경하세요
        </p>
      )}
    </div>
  );
}

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { settings, toggleNotification } = useSettings();

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 bg-gray-50 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500"
        >
          <HiArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-extrabold text-gray-800">알림 설정</h2>
      </div>

      {/* 콘텐츠 */}
      <div className="flex flex-col gap-3 px-4 pb-28">
        {/* 기기 푸시 */}
        <PushPermissionCard userId={user?.id ?? null} />

        {/* 운동 트래커 필수 안내 */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 flex items-start gap-3">
          <HiLightningBolt size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-amber-700">기기 알림 권한은 꼭 켜두세요</p>
            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
              운동 트래커(잠금화면 실시간 걸음수·칼로리 기록)는 기기 알림 권한이 있어야 작동해요.{" "}
              알림 권한이 꺼지면 트래커가 잠금화면에 표시되지 않아요.
            </p>
            <p className="text-xs text-amber-500 mt-1.5 leading-relaxed">
              주기적 알림만 끄고 싶다면 아래 항목에서 원하는 것만 개별 설정하세요.
            </p>
          </div>
        </div>

        {/* 운동 알림 */}
        <NotificationGroup
          icon={<HiBell size={16} className="text-white" />}
          title="운동 기능 알림"
          description="유산소 운동 목표 및 스트릭 관련 알림 전체"
          masterKey="workoutNotification"
          settings={settings}
          toggleNotification={toggleNotification}
        >
          <SubNotificationRow
            icon={<HiClock size={15} />}
            label="활동 목표 리마인더"
            description="오늘 설정한 유산소 목표 달성을 위한 푸시"
            on={settings.workoutReminderNotification}
            onToggle={() => toggleNotification("workoutReminderNotification")}
          />
          <SubNotificationRow
            icon={<HiFire size={15} />}
            label="스트릭 유지 알림"
            description="오늘 운동 안 했을 때 저녁 버닝 타임 알림"
            on={settings.streakNotification}
            onToggle={() => toggleNotification("streakNotification")}
          />
        </NotificationGroup>

        {/* 파티 알림 */}
        <NotificationGroup
          icon={<HiUserGroup size={16} className="text-white" />}
          title="파티 활동 알림"
          description="함께 걷기·달리기 소셜 인터랙션 알림 전체"
          masterKey="partyNotification"
          settings={settings}
          toggleNotification={toggleNotification}
        >
          <SubNotificationRow
            icon={<HiSpeakerphone size={15} />}
            label="파티 실시간 활동 알림"
            description="방장의 운동 시작 신호 및 파티원들의 실시간 유산소 참여 알림"
            on={settings.partyActivityNotification}
            onToggle={() => toggleNotification("partyActivityNotification")}
          />
        </NotificationGroup>

        {/* 이벤트 알림 */}
        <NotificationGroup
          icon={<HiSparkles size={16} className="text-white" />}
          title="이벤트 알림"
          description="새 이벤트 추가 시 앱 내 알림 전체"
          masterKey="eventNotification"
          settings={settings}
          toggleNotification={toggleNotification}
        />

        {/* 식단 알림 */}
        <NotificationGroup
          icon={<HiCake size={16} className="text-white" />}
          title="식단 가이드 알림"
          description="운동 칼로리 소모 연계 맞춤 식단 알림 전체"
          masterKey="dietNotification"
          settings={settings}
          toggleNotification={toggleNotification}
        >
          <SubNotificationRow
            icon={<HiLightningBolt size={15} />}
            label="식사 후 버닝 리마인더"
            description="점심 식사 후 가벼운 유산소 연계 유도 알림"
            on={settings.dietBurnNotification}
            onToggle={() => toggleNotification("dietBurnNotification")}
          />
          <SubNotificationRow
            icon={<HiSparkles size={15} />}
            label="운동 후 맞춤 보상 식단"
            description="유산소 성공 후 단백질 및 맞춤 섭취량 정산 가이드"
            on={settings.dietRewardNotification}
            onToggle={() => toggleNotification("dietRewardNotification")}
          />
        </NotificationGroup>
      </div>
    </div>
  );
}
