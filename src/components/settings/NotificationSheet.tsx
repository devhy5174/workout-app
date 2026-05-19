import {
  HiBell,
  HiX,
  HiUserGroup,
  HiFire,
  HiClock,
  HiSpeakerphone,
  HiLightningBolt,
  HiCake,
  HiSparkles,
} from "react-icons/hi";
import { type NotificationKey, useSettings } from "../../hooks/useSettings";

type Settings = ReturnType<typeof useSettings>["settings"];

// ── 토글 스위치 ──────────────────────────────────────────
export function Toggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
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

// ── 서브 알림 행 ──────────────────────────────────────────
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
    <div
      className={`flex items-center gap-3 px-4 py-3.5 pl-12 transition-all ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-gray-300">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-600">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <Toggle on={on && !disabled} onToggle={disabled ? () => {} : onToggle} />
    </div>
  );
}

// ── 알림 그룹 카드 ────────────────────────────────────────
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
    <div className="bg-gray-50 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-4">
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          }}
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

// ── 알림 상세 설정 시트 ──────────────────────────────────
export function NotificationSheet({
  settings,
  toggleNotification,
  onClose,
}: {
  settings: Settings;
  toggleNotification: (key: NotificationKey) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 고정 헤더 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-100">
          <h3 className="text-lg font-extrabold text-gray-800">알림 설정</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
            aria-label="닫기"
          >
            <HiX size={16} />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex flex-col gap-3 px-4 py-4 pb-12 overflow-y-auto flex-1 min-h-0">
          {/* 운동 알림 */}
          <NotificationGroup
            icon={<HiBell size={16} className="text-white" />}
            title="운동 기능 알림"
            description="유산소 운동 자극 및 트래커 알림 전체"
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
    </div>
  );
}
