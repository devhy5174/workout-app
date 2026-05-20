// 이벤트 카테고리
export type EventCategory = 'personal' | 'party' | 'streak';

// 조건 타입
export type EventConditionType =
  | 'period_goal'       // 개인: 기간 내 총 걸음수
  | 'avg_steps'         // 개인: 하루 평균 걸음수
  | 'total_steps'       // 파티: 파티원 합산 걸음수
  | 'consecutive_days'; // 연속: 연속 운동일 수

// 보상 타입
export type EventRewardType = 'bubble' | 'title' | 'both';

export interface EventReward {
  type: EventRewardType;
  bubbleId?: string;   // BUBBLE_PREVIEWS key
  titleText?: string;  // 칭호 텍스트
}

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  conditionType: EventConditionType;
  conditionValue: number;
  reward: EventReward;
  isActive: boolean;
  isFixed: boolean;
  createdAt: string;
}

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  personal: {
    label: '개인 이벤트',
    emoji: '🏃',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  party: {
    label: '파티 이벤트',
    emoji: '🤝',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  streak: {
    label: '연속 챌린지',
    emoji: '🔥',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

export const CONDITION_META: Record<
  EventConditionType,
  { label: string; unit: string; placeholder: string }
> = {
  period_goal: { label: '기간 총 걸음수 달성', unit: '보', placeholder: '250000' },
  avg_steps: { label: '하루 평균 걸음수 달성', unit: '보/일', placeholder: '8000' },
  total_steps: { label: '파티원 합산 걸음수', unit: '보', placeholder: '1000000' },
  consecutive_days: { label: '연속 운동일 달성', unit: '일', placeholder: '30' },
};

// 카테고리별 사용 가능한 조건 타입
export const CATEGORY_CONDITIONS: Record<EventCategory, EventConditionType[]> = {
  personal: ['period_goal', 'avg_steps'],
  party: ['total_steps'],
  streak: ['consecutive_days'],
};

export const REWARD_TYPE_META: Record<EventRewardType, { label: string; emoji: string }> = {
  bubble: { label: '파티 말풍선', emoji: '💬' },
  title: { label: '칭호', emoji: '🏅' },
  both: { label: '말풍선 + 칭호', emoji: '🎁' },
};

export const INITIAL_EVENTS: AppEvent[] = [
  {
    id: '1',
    title: '5월 걷기 챌린지',
    description: '5월 한 달간 하루 평균 8,000보를 달성하면 특별 말풍선을 드려요!',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    category: 'personal',
    conditionType: 'avg_steps',
    conditionValue: 8000,
    reward: { type: 'bubble', bubbleId: 'fire_bubble' },
    isActive: true,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: '30일 연속 운동 챌린지',
    description: '30일 연속으로 운동을 달성하면 특별 칭호가 해금돼요!',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    category: 'streak',
    conditionType: 'consecutive_days',
    conditionValue: 30,
    reward: { type: 'title', titleText: '🔥 30일 완주자' },
    isActive: true,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: '3',
    title: '파티 100만보 챌린지',
    description: '파티원이 함께 총 100만보를 달성하면 전용 말풍선을 지급해요!',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    category: 'party',
    conditionType: 'total_steps',
    conditionValue: 1000000,
    reward: { type: 'bubble', bubbleId: 'health_bubble' },
    isActive: true,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
];
