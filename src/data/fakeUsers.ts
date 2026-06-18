/**
 * 페이크 유저 데이터 관리 파일
 * 홈 마퀴, 파티 미리보기, 커뮤니티 게시글 데이터를 한 곳에서 관리합니다.
 */

import { avatarCharacters } from "./avatarCharacters";
import { BUBBLE_PREVIEWS, DEFAULT_PARTY_BUBBLE, type BubblePreview } from "./bubblePreviews";
import type { CommunityPost } from "../lib/communityService";

const c = avatarCharacters;

// ─────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────

export type ActivityType = "walker" | "power_walker" | "runner" | "hiker";

type TimeSlot = { start: number; end: number };

/** 홈 마퀴 · 세션 전광판용 */
export type FakeUser = {
  nickname: string;
  character_id: string;
  character_image: string;
  steps: number;
  activity: ActivityType;
};

/** 파티 미리보기 멤버 카드용 */
export type FakeMember = {
  id: string;
  nickname: string;
  image: string;
  todaySteps: number;
  isActive: boolean;
  isLeader: boolean;
  inactive7: boolean;
  title: string | null;
  bubble: BubblePreview | null;
};

type FakeUserProfile = {
  id: string;
  nickname: string;
  character_id: string;
  character_image: string;
  activity: ActivityType;
  activity_type_id: number; // 1=walker 2=power_walker 3=runner 4=hiker

  // ── 홈 마퀴 ─────────────────────────────────────────────
  /** 이 시간대에만 "운동 중" 전광판에 등장 (빈 배열이면 마퀴에 안 나옴) */
  activeSlots: TimeSlot[];
  /** 요일별 걸음수 [일,월,화,수,목,금,토] */
  weeklySteps: [number, number, number, number, number, number, number];

  // ── 파티 미리보기 ────────────────────────────────────────
  party: {
    enabled: boolean;       // false면 파티 리스트에 안 나옴
    todaySteps: number;
    isActive: boolean;
    isLeader: boolean;
    inactive7: boolean;
    title: string | null;
    /** null → 기본 말풍선 "운동 중 💪" / 문자열 → BUBBLE_PREVIEWS 키 */
    bubbleId: string | null;
  };
};

// ─────────────────────────────────────────────────────────
// 페이크 유저 프로필 목록 (여기서 데이터를 직접 수정하세요)
// ─────────────────────────────────────────────────────────

const FAKE_USER_PROFILES: FakeUserProfile[] = [

  // ══════════════════════════════════════════════════════════
  // 홈 마퀴 + 파티 활동 중 (6명)
  // ══════════════════════════════════════════════════════════

  {
    id: "fake-user-001",
    nickname: "달리기좋아",
    character_id: c[2].id,
    character_image: c[2].image,
    activity: "runner",
    activity_type_id: 3,
    activeSlots: [{ start: 6, end: 9 }, { start: 19, end: 21 }],
    weeklySteps: [8200, 11800, 12200, 11500, 12100, 10800, 9400],
    party: {
      enabled: true,
      todaySteps: 8200,
      isActive: true,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null, // 운동 중 💪
    },
  },
  {
    id: "fake-user-002",
    nickname: "jjun_run",
    character_id: c[9].id,
    character_image: c[9].image,
    activity: "runner",
    activity_type_id: 3,
    activeSlots: [{ start: 12, end: 14 }, { start: 20, end: 22 }],
    weeklySteps: [12400, 9800, 10200, 9500, 11000, 13200, 14800],
    party: {
      enabled: true,
      todaySteps: 12400,
      isActive: true,
      isLeader: true,
      inactive7: false,
      title: "🏆 러닝왕",
      bubbleId: "fire_bubble", // 불태워 🔥
    },
  },
  {
    id: "fake-user-003",
    nickname: "새벽런너92",
    character_id: c[5].id,
    character_image: c[5].image,
    activity: "runner",
    activity_type_id: 3,
    activeSlots: [{ start: 5, end: 7 }, { start: 22, end: 24 }],
    weeklySteps: [10800, 12200, 11800, 12500, 12100, 11400, 13200],
    party: {
      enabled: true,
      todaySteps: 11000,
      isActive: true,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: "premium_active_bubble", // 운동 중 ✨
    },
  },
  {
    id: "fake-user-004",
    nickname: "요요",
    character_id: c[7].id,
    character_image: c[7].image,
    activity: "runner",
    activity_type_id: 3,
    activeSlots: [{ start: 21, end: 23 }],
    weeklySteps: [9200, 13800, 14200, 13500, 14800, 12900, 10500],
    party: {
      enabled: true,
      todaySteps: 13500,
      isActive: true,
      isLeader: false,
      inactive7: false,
      title: "🌙 야간러너",
      bubbleId: "sweat_bubble", // 땀나는 중 💦
    },
  },
  {
    id: "fake-user-005",
    nickname: "운동하자아",
    character_id: c[17].id,
    character_image: c[17].image,
    activity: "power_walker",
    activity_type_id: 2,
    activeSlots: [{ start: 17, end: 20 }],
    weeklySteps: [9500, 8200, 8800, 8500, 9200, 10500, 11200],
    party: {
      enabled: true,
      todaySteps: 9500,
      isActive: true,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null, // 운동 중 💪
    },
  },
  {
    id: "fake-user-006",
    nickname: "hyejin_w",
    character_id: c[11].id,
    character_image: c[11].image,
    activity: "walker",
    activity_type_id: 1,
    activeSlots: [{ start: 12, end: 13 }, { start: 19, end: 21 }],
    weeklySteps: [5200, 7200, 6800, 7500, 7100, 6900, 5800],
    party: {
      enabled: true,
      todaySteps: 7500,
      isActive: true,
      isLeader: false,
      inactive7: false,
      title: "🌿 꾸준러",
      bubbleId: "walk_bubble", // 산책 중 🌿
    },
  },

  // ══════════════════════════════════════════════════════════
  // 홈 마퀴 + 파티 쉬는 중 (6명)
  // ══════════════════════════════════════════════════════════

  {
    id: "fake-user-007",
    nickname: "walk_everyday",
    character_id: c[23].id,
    character_image: c[23].image,
    activity: "walker",
    activity_type_id: 1,
    activeSlots: [{ start: 18, end: 21 }],
    weeklySteps: [7200, 8400, 8100, 8800, 8200, 8600, 7900],
    party: {
      enabled: true,
      todaySteps: 7900,
      isActive: false,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null,
    },
  },
  {
    id: "fake-user-008",
    nickname: "morning_mira",
    character_id: c[25].id,
    character_image: c[25].image,
    activity: "runner",
    activity_type_id: 3,
    activeSlots: [{ start: 6, end: 8 }],
    weeklySteps: [8500, 11200, 10800, 11500, 10900, 12200, 9800],
    party: {
      enabled: true,
      todaySteps: 10900,
      isActive: false,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null,
    },
  },
  {
    id: "fake-user-009",
    nickname: "hw_powerwalk",
    character_id: c[13].id,
    character_image: c[13].image,
    activity: "power_walker",
    activity_type_id: 2,
    activeSlots: [{ start: 11, end: 13 }, { start: 18, end: 19 }],
    weeklySteps: [7800, 9200, 8900, 9500, 8800, 9100, 8400],
    party: {
      enabled: true,
      todaySteps: 8800,
      isActive: false,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null,
    },
  },
  {
    id: "fake-user-010",
    nickname: "sooah_fit",
    character_id: c[20].id,
    character_image: c[20].image,
    activity: "walker",
    activity_type_id: 1,
    activeSlots: [{ start: 7, end: 9 }],
    weeklySteps: [5800, 6200, 6500, 6100, 6800, 6300, 5900],
    party: {
      enabled: true,
      todaySteps: 6100,
      isActive: false,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null,
    },
  },
  {
    id: "fake-user-011",
    nickname: "산오르는사람",
    character_id: c[14].id,
    character_image: c[14].image,
    activity: "hiker",
    activity_type_id: 4,
    activeSlots: [{ start: 7, end: 11 }],
    weeklySteps: [8500, 5200, 5800, 6200, 5500, 6800, 9200],
    party: {
      enabled: true,
      todaySteps: 5200,
      isActive: false,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null,
    },
  },
  {
    id: "fake-user-012",
    nickname: "등산초보탈출",
    character_id: c[1].id,
    character_image: c[1].image,
    activity: "hiker",
    activity_type_id: 4,
    activeSlots: [{ start: 8, end: 12 }],
    weeklySteps: [5200, 4800, 5200, 5500, 4900, 7200, 11500],
    party: {
      enabled: true,
      todaySteps: 4900,
      isActive: false,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null,
    },
  },

  // ══════════════════════════════════════════════════════════
  // 파티 전용 쉬는 중 (4명) — 홈 마퀴엔 안 나옴
  // ══════════════════════════════════════════════════════════

  {
    id: "fake-user-013",
    nickname: "walk_j9",
    character_id: c[4].id,
    character_image: c[4].image,
    activity: "walker",
    activity_type_id: 1,
    activeSlots: [],
    weeklySteps: [3400, 3800, 4200, 3500, 4000, 5200, 4800],
    party: {
      enabled: true,
      todaySteps: 3400,
      isActive: false,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null,
    },
  },
  {
    id: "fake-user-014",
    nickname: "run_happy",
    character_id: c[6].id,
    character_image: c[6].image,
    activity: "runner",
    activity_type_id: 3,
    activeSlots: [],
    weeklySteps: [5800, 6200, 7100, 5900, 6500, 7800, 8200],
    party: {
      enabled: true,
      todaySteps: 5800,
      isActive: false,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null,
    },
  },
  {
    id: "fake-user-015",
    nickname: "ddukk_92",
    character_id: c[10].id,
    character_image: c[10].image,
    activity: "power_walker",
    activity_type_id: 2,
    activeSlots: [],
    weeklySteps: [6900, 7200, 6800, 7500, 6900, 8100, 7600],
    party: {
      enabled: true,
      todaySteps: 6900,
      isActive: false,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null,
    },
  },
  {
    id: "fake-user-016",
    nickname: "night_kk",
    character_id: c[15].id,
    character_image: c[15].image,
    activity: "runner",
    activity_type_id: 3,
    activeSlots: [],
    weeklySteps: [2200, 3100, 2800, 3400, 2900, 4200, 5100],
    party: {
      enabled: true,
      todaySteps: 2200,
      isActive: false,
      isLeader: false,
      inactive7: false,
      title: null,
      bubbleId: null,
    },
  },

  // ══════════════════════════════════════════════════════════
  // 파티 전용 7일 비활동 (4명) — 홈 마퀴엔 안 나옴
  // ══════════════════════════════════════════════════════════

  {
    id: "fake-user-017",
    nickname: "silent_run",
    character_id: c[3].id,
    character_image: c[3].image,
    activity: "runner",
    activity_type_id: 3,
    activeSlots: [],
    weeklySteps: [0, 0, 0, 0, 0, 0, 0],
    party: {
      enabled: true,
      todaySteps: 0,
      isActive: false,
      isLeader: false,
      inactive7: true,
      title: null,
      bubbleId: null,
    },
  },
  {
    id: "fake-user-018",
    nickname: "lazy_w",
    character_id: c[8].id,
    character_image: c[8].image,
    activity: "walker",
    activity_type_id: 1,
    activeSlots: [],
    weeklySteps: [0, 0, 0, 0, 0, 0, 0],
    party: {
      enabled: true,
      todaySteps: 0,
      isActive: false,
      isLeader: false,
      inactive7: true,
      title: null,
      bubbleId: null,
    },
  },
  {
    id: "fake-user-019",
    nickname: "ghost_hike",
    character_id: c[12].id,
    character_image: c[12].image,
    activity: "hiker",
    activity_type_id: 4,
    activeSlots: [],
    weeklySteps: [0, 0, 0, 0, 0, 0, 0],
    party: {
      enabled: true,
      todaySteps: 0,
      isActive: false,
      isLeader: false,
      inactive7: true,
      title: null,
      bubbleId: null,
    },
  },
  {
    id: "fake-user-020",
    nickname: "lostrunner",
    character_id: c[16].id,
    character_image: c[16].image,
    activity: "runner",
    activity_type_id: 3,
    activeSlots: [],
    weeklySteps: [0, 0, 0, 0, 0, 0, 0],
    party: {
      enabled: true,
      todaySteps: 0,
      isActive: false,
      isLeader: false,
      inactive7: true,
      title: null,
      bubbleId: null,
    },
  },
];

// ─────────────────────────────────────────────────────────
// 홈 마퀴용 파생 함수
// ─────────────────────────────────────────────────────────

function isActiveNow(slots: TimeSlot[], hour: number): boolean {
  return slots.some((s) => hour >= s.start && hour < s.end);
}

/** 현재 시간 기준으로 활동 중인 페이커 유저만 반환 */
export function getLiveFakeUsers(now: Date = new Date()): FakeUser[] {
  const hour = now.getHours();
  const dow = now.getDay();
  return FAKE_USER_PROFILES.filter(
    (u) => u.activeSlots.length > 0 && isActiveNow(u.activeSlots, hour),
  ).map((u) => ({
    nickname: u.nickname,
    character_id: u.character_id,
    character_image: u.character_image,
    activity: u.activity,
    steps: u.weeklySteps[dow],
  }));
}

/** 시간 무관 전체 목록 (오늘 요일 기준 걸음수) */
export function getAllFakeUsersToday(now: Date = new Date()): FakeUser[] {
  const dow = now.getDay();
  return FAKE_USER_PROFILES.filter((u) => u.activeSlots.length > 0).map((u) => ({
    nickname: u.nickname,
    character_id: u.character_id,
    character_image: u.character_image,
    activity: u.activity,
    steps: u.weeklySteps[dow],
  }));
}

// 하위 호환 (FakePartyPreview에서 이미지 참조용)
export const FAKE_ACTIVE_USERS = getAllFakeUsersToday();

// ─────────────────────────────────────────────────────────
// 탑3 랭킹 보완용 — 실유저 3명 미만 시 채우기
// ─────────────────────────────────────────────────────────

/**
 * 이번 주 월요일부터 오늘(dow)까지 누적 걸음수 반환
 * weeklySteps 인덱스: [일=0, 월=1, 화=2, 수=3, 목=4, 금=5, 토=6]
 * 일요일(dow=0)은 한 주의 마지막 날이므로 전체 합산
 */
function weeklyStepsSoFar(
  weeklySteps: [number, number, number, number, number, number, number],
  dow: number,
): number {
  if (dow === 0) return weeklySteps.reduce((a, b) => a + b, 0); // 일요일 = 전체
  let total = 0;
  for (let i = 1; i <= dow; i++) total += weeklySteps[i]; // 월(1) ~ 오늘
  return total;
}

/** 탑3 빈자리를 채울 페이크 유저 후보 (걸음수 내림차순) */
export function getFakeTop3Candidates(
  period: "weekly" | "daily",
  now: Date = new Date(),
): Array<{
  rank: number;
  user_id: string;
  nickname: string;
  steps: number;
  character_id: string | null;
}> {
  const dow = now.getDay();
  return FAKE_USER_PROFILES.filter((u) => u.activeSlots.length > 0)
    .map((u) => ({
      rank: 0,
      user_id: u.id,
      nickname: u.nickname,
      steps:
        period === "weekly"
          ? weeklyStepsSoFar(u.weeklySteps, dow)
          : u.weeklySteps[dow],
      character_id: u.character_id,
    }))
    .sort((a, b) => b.steps - a.steps);
}

// ─────────────────────────────────────────────────────────
// 파티현황 랭킹 보완용 — 실파티 3개 미만 시 채우기
// ─────────────────────────────────────────────────────────

const FAKE_PARTY_DATA = [
  { id: "fake-party-001", name: "저녁 러너스",   emoji: "🌙", weeklyValue: 52400, dailyValue: 7200, leaderNickname: "밤달리기" },
  { id: "fake-party-002", name: "새벽런 클럽",   emoji: "🌅", weeklyValue: 48200, dailyValue: 6800, leaderNickname: "새벽런너92" },
  { id: "fake-party-003", name: "파워워킹단",    emoji: "💪", weeklyValue: 38900, dailyValue: 5400, leaderNickname: "파워워킹장인" },
  { id: "fake-party-004", name: "아침 산책 모임", emoji: "☀️", weeklyValue: 31200, dailyValue: 4300, leaderNickname: "sooah_fit" },
  { id: "fake-party-005", name: "주말 등산 클럽", emoji: "⛰️", weeklyValue: 27500, dailyValue: 3800, leaderNickname: "산오르는사람" },
];

/** 파티현황 빈자리를 채울 페이크 파티 후보 (value 내림차순)
 *  주간 값은 오늘 요일 기준 일할 계산 (월요일 = 1/7, 일요일 = 7/7)
 */
export function getFakePartyHighlights(
  period: "weekly" | "daily",
  now: Date = new Date(),
): Array<{
  id: string;
  name: string;
  emoji: string;
  value: number;
  leaderNickname: string | null;
}> {
  const dow = now.getDay();
  const daysElapsed = dow === 0 ? 7 : dow; // 일=7, 월=1 … 토=6
  return FAKE_PARTY_DATA.map((p) => ({
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    value:
      period === "weekly"
        ? Math.round((p.weeklyValue * daysElapsed) / 7)
        : p.dailyValue,
    leaderNickname: p.leaderNickname,
  })).sort((a, b) => b.value - a.value);
}

// ─────────────────────────────────────────────────────────
// 파티 미리보기용 파생 데이터
// ─────────────────────────────────────────────────────────

export const FAKE_PARTY_MEMBERS: FakeMember[] = FAKE_USER_PROFILES.filter(
  (u) => u.party.enabled,
).map((u, i) => ({
  id: `m${i + 1}`,
  nickname: u.nickname,
  image: u.character_image,
  todaySteps: u.party.todaySteps,
  isActive: u.party.isActive,
  isLeader: u.party.isLeader,
  inactive7: u.party.inactive7,
  title: u.party.title,
  bubble: u.party.isActive
    ? u.party.bubbleId
      ? (BUBBLE_PREVIEWS[u.party.bubbleId] ?? DEFAULT_PARTY_BUBBLE)
      : DEFAULT_PARTY_BUBBLE
    : null,
}));

/** 파티 응원 티커 메시지 */
export const FAKE_PARTY_CHEERS = [
  { id: "c1", nickname: "jjun_run",    text: "오늘도 화이팅!! 💪" },
  { id: "c2", nickname: "hyejin_w",   text: "같이 달려요~🏃" },
  { id: "c3", nickname: "파워워킹장인", text: "목표 달성 가즈아!" },
  { id: "c4", nickname: "새벽런너92",  text: "새벽런 최고 🌅" },
  { id: "c5", nickname: "밤달리기🌙",  text: "야간런도 파이팅!" },
];

// ─────────────────────────────────────────────────────────
// 커뮤니티 게시글용 데이터
// ─────────────────────────────────────────────────────────

function ts(daysAgo: number, hourOfDay: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hourOfDay, 0, 0, 0);
  return d.toISOString();
}

export const FAKE_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "fake-post-001",
    user_id: "fake-user-001",
    nickname: "달리기좋아",
    character_id: c[2].id,
    activity_type_id: 3,
    profile_title: null,
    text: "아침에 공기 너무 좋아서 한 바퀴 더 뛰었어요 ㅋㅋ",
    card_id: "morning",
    tags: ["아침산책", "러너모드"],
    steps: 8200,
    cheers: 12,
    created_at: ts(0, 7),
    frame_id: null,
  },
  {
    id: "fake-post-002",
    user_id: "fake-user-001",
    nickname: "달리기좋아",
    character_id: c[2].id,
    activity_type_id: 3,
    profile_title: null,
    text: "오늘은 좀 힘들었는데 완주! 💪",
    card_id: "sunset",
    tags: ["오늘도성공"],
    steps: 7800,
    cheers: 8,
    created_at: ts(2, 19),
    frame_id: null,
  },
  {
    id: "fake-post-003",
    user_id: "fake-user-002",
    nickname: "jjun_run",
    character_id: c[9].id,
    activity_type_id: 3,
    profile_title: null,
    text: "점심 러닝 성공 🏃 밥 두 그릇 먹을 자격 생겼다",
    card_id: "spring",
    tags: ["러닝시작"],
    steps: 9500,
    cheers: 18,
    created_at: ts(0, 12),
    frame_id: null,
  },
  {
    id: "fake-post-004",
    user_id: "fake-user-002",
    nickname: "jjun_run",
    character_id: c[9].id,
    activity_type_id: 3,
    profile_title: null,
    text: "주말 롱런 15km 완료 다리가 없어요",
    card_id: "forest",
    tags: ["러너모드", "목표달성"],
    steps: 14800,
    cheers: 31,
    created_at: ts(1, 10),
    frame_id: null,
  },
  {
    id: "fake-post-005",
    user_id: "fake-user-011",
    nickname: "산오르는사람",
    character_id: c[14].id,
    activity_type_id: 4,
    profile_title: null,
    text: "북한산 다녀왔어요 뷰 미쳤음",
    card_id: "forest",
    tags: ["등산완료", "오르막도전"],
    steps: 9200,
    cheers: 22,
    created_at: ts(0, 11),
    frame_id: null,
  },
  {
    id: "fake-post-006",
    user_id: "fake-user-011",
    nickname: "산오르는사람",
    character_id: c[14].id,
    activity_type_id: 4,
    profile_title: null,
    text: "이번 주 세 번 산 탔네요 발이 익숙해졌어요",
    card_id: "autumn",
    tags: ["등산완료"],
    steps: 6200,
    cheers: 9,
    created_at: ts(3, 13),
    frame_id: null,
  },
  {
    id: "fake-post-007",
    user_id: "fake-user-007",
    nickname: "walk_everyday",
    character_id: c[23].id,
    activity_type_id: 1,
    profile_title: null,
    text: "저녁 산책 30분 완료 오늘 하루도 수고했어 나",
    card_id: "night",
    tags: ["밤산책", "오늘도성공"],
    steps: 7900,
    cheers: 14,
    created_at: ts(0, 20),
    frame_id: null,
  },
  {
    id: "fake-post-008",
    user_id: "fake-user-007",
    nickname: "walk_everyday",
    character_id: c[23].id,
    activity_type_id: 1,
    profile_title: null,
    text: "비 오는데 우산 쓰고 걸었어요 ☔ 뭔가 운치있음",
    card_id: "rain",
    tags: ["천천히걷기"],
    steps: 6800,
    cheers: 19,
    created_at: ts(1, 19),
    frame_id: null,
  },
  {
    id: "fake-post-009",
    user_id: "fake-user-003",
    nickname: "새벽런너92",
    character_id: c[5].id,
    activity_type_id: 3,
    profile_title: null,
    text: "새벽 5시 기상 성공 오늘도 달렸습니다 💪",
    card_id: "dawn",
    tags: ["러닝시작", "귀찮았지만성공"],
    steps: 12500,
    cheers: 27,
    created_at: ts(0, 6),
    frame_id: null,
  },
  {
    id: "fake-post-010",
    user_id: "fake-user-003",
    nickname: "새벽런너92",
    character_id: c[5].id,
    activity_type_id: 3,
    profile_title: null,
    text: "12km 완료 제 최고기록이에요 🎉",
    card_id: "dawn",
    tags: ["러너모드", "목표달성"],
    steps: 13200,
    cheers: 41,
    created_at: ts(2, 6),
    frame_id: null,
  },
  {
    id: "fake-post-011",
    user_id: "fake-user-006",
    nickname: "hyejin_w",
    character_id: c[11].id,
    activity_type_id: 1,
    profile_title: null,
    text: "점심에 동료랑 걸었어요 대화하다 보니 금방이네요",
    card_id: "morning",
    tags: ["출근길걷기", "같이걷는중"],
    steps: 7500,
    cheers: 7,
    created_at: ts(0, 12),
    frame_id: null,
  },
  {
    id: "fake-post-012",
    user_id: "fake-user-006",
    nickname: "hyejin_w",
    character_id: c[11].id,
    activity_type_id: 1,
    profile_title: null,
    text: "퇴근길에 한 정거장 먼저 내려서 걸어왔어요",
    card_id: "commute",
    tags: ["퇴근후운동"],
    steps: 6900,
    cheers: 11,
    created_at: ts(1, 18),
    frame_id: null,
  },
  {
    id: "fake-post-013",
    user_id: "fake-user-005",
    nickname: "파워워킹장인",
    character_id: c[17].id,
    activity_type_id: 2,
    profile_title: null,
    text: "파워워킹 1시간 팔 흔드는 게 포인트입니다 🚶‍♂️",
    card_id: "river",
    tags: ["파워워킹", "오늘도성공"],
    steps: 9500,
    cheers: 15,
    created_at: ts(0, 18),
    frame_id: null,
  },
  {
    id: "fake-post-014",
    user_id: "fake-user-010",
    nickname: "sooah_fit",
    character_id: c[20].id,
    activity_type_id: 1,
    profile_title: null,
    text: "아침 산책 하고 나면 하루가 달라요 진짜로",
    card_id: "spring",
    tags: ["아침산책", "오늘도성공"],
    steps: 6100,
    cheers: 9,
    created_at: ts(1, 8),
    frame_id: null,
  },
  {
    id: "fake-post-015",
    user_id: "fake-user-004",
    nickname: "밤달리기",
    character_id: c[7].id,
    activity_type_id: 3,
    profile_title: null,
    text: "자기 전 10시 러닝 루틴 벌써 한 달째예요",
    card_id: "night",
    tags: ["밤산책", "러너모드", "운동기록"],
    steps: 13500,
    cheers: 33,
    created_at: ts(0, 22),
    frame_id: null,
  },
  {
    id: "fake-post-016",
    user_id: "fake-user-004",
    nickname: "밤달리기",
    character_id: c[7].id,
    activity_type_id: 3,
    profile_title: null,
    text: "야간 러닝은 사람도 없고 바람도 좋아서 최고임",
    card_id: "night",
    tags: ["밤산책", "러닝시작"],
    steps: 14200,
    cheers: 25,
    created_at: ts(3, 21),
    frame_id: null,
  },
  {
    id: "fake-post-017",
    user_id: "fake-user-012",
    nickname: "등산초보탈출",
    character_id: c[1].id,
    activity_type_id: 4,
    profile_title: null,
    text: "이제 막 등산 시작했는데 재밌어요 근육통만 빼면..",
    card_id: "autumn",
    tags: ["등산완료", "귀찮았지만성공"],
    steps: 5500,
    cheers: 16,
    created_at: ts(1, 14),
    frame_id: null,
  },
  {
    id: "fake-post-018",
    user_id: "fake-user-012",
    nickname: "등산초보탈출",
    character_id: c[1].id,
    activity_type_id: 4,
    profile_title: null,
    text: "오늘은 낮은 산 도전했는데 나름 힘들었어요 ㅋㅋ",
    card_id: "forest",
    tags: ["오르막도전"],
    steps: 4900,
    cheers: 6,
    created_at: ts(2, 11),
    frame_id: null,
  },
  {
    id: "fake-post-019",
    user_id: "fake-user-009",
    nickname: "hw_powerwalk",
    character_id: c[13].id,
    activity_type_id: 2,
    profile_title: null,
    text: "점심시간 파워워킹 30분 사무실 주변 뺑뺑이 돌기",
    card_id: "street",
    tags: ["파워워킹", "출근길걷기"],
    steps: 9500,
    cheers: 8,
    created_at: ts(0, 13),
    frame_id: null,
  },
  {
    id: "fake-post-020",
    user_id: "fake-user-008",
    nickname: "morning_mira",
    character_id: c[25].id,
    activity_type_id: 3,
    profile_title: null,
    text: "6시 알람 맞추고 달렸어요 내일도 할 수 있을까 ㅋ",
    card_id: "morning",
    tags: ["아침산책", "러닝시작"],
    steps: 10900,
    cheers: 13,
    created_at: ts(1, 6),
    frame_id: null,
  },
];
