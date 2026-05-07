// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type ExerciseTime = "새벽" | "아침" | "저녁" | "주말";

export interface PartyRankingEntry {
  userId: string;       // Supabase auth.uid()
  nickname: string;
  avatarEmoji: string;
  weeklySteps: number;  // 이번 주 누적 걸음 수
  rank: number;
}

export interface Party {
  id: string;           // Supabase 교체 시 uuid
  name: string;
  emoji: string;
  description: string;
  tags: string[];
  memberCount: number;
  maxMembers: number;
  targetDistance: string;   // 예: "5km"
  exerciseTime: ExerciseTime;
  leader: string;           // 파티장 닉네임
  isJoined: boolean;        // 현재 유저 참여 여부
  ranking: PartyRankingEntry[];
  createdAt: string;        // ISO 8601
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

export const parties: Party[] = [
  {
    id: "party-001",
    name: "새벽 러닝 크루",
    emoji: "🏃",
    description: "매일 새벽 5시, 한강변에서 함께 달려요! 초보도 환영합니다.",
    tags: ["러닝", "한강", "유산소"],
    memberCount: 12,
    maxMembers: 20,
    targetDistance: "5km",
    exerciseTime: "새벽",
    leader: "빠른발_준혁",
    isJoined: true,
    ranking: [
      { userId: "user-01", nickname: "빠른발_준혁", avatarEmoji: "🥇", weeklySteps: 18420, rank: 1 },
      { userId: "user-02", nickname: "달리기_수아", avatarEmoji: "🥈", weeklySteps: 16300, rank: 2 },
      { userId: "user-03", nickname: "새벽형_민준", avatarEmoji: "🥉", weeklySteps: 14890, rank: 3 },
      { userId: "user-04", nickname: "조깅러_지훈", avatarEmoji: "4️⃣", weeklySteps: 12200, rank: 4 },
    ],
    createdAt: "2026-04-01T00:00:00+09:00",
  },
  {
    id: "party-002",
    name: "주말 등산 모임",
    emoji: "⛰️",
    description: "매주 토요일 북한산 정상 정복! 함께라면 정상도 가볍습니다.",
    tags: ["등산", "북한산", "자연"],
    memberCount: 8,
    maxMembers: 15,
    targetDistance: "10km",
    exerciseTime: "주말",
    leader: "등산왕_철수",
    isJoined: false,
    ranking: [
      { userId: "user-10", nickname: "등산왕_철수", avatarEmoji: "🥇", weeklySteps: 22100, rank: 1 },
      { userId: "user-11", nickname: "정상러_영희", avatarEmoji: "🥈", weeklySteps: 19500, rank: 2 },
      { userId: "user-12", nickname: "힐링하이커", avatarEmoji: "🥉", weeklySteps: 17200, rank: 3 },
    ],
    createdAt: "2026-04-10T00:00:00+09:00",
  },
  {
    id: "party-003",
    name: "저녁 산책 파티",
    emoji: "🌙",
    description: "퇴근 후 동네 한 바퀴! 스트레스는 걸으면서 날려요 🌙",
    tags: ["산책", "힐링", "초보환영"],
    memberCount: 5,
    maxMembers: 10,
    targetDistance: "3km",
    exerciseTime: "저녁",
    leader: "산책왕_도현",
    isJoined: true,
    ranking: [
      { userId: "user-20", nickname: "산책왕_도현", avatarEmoji: "🥇", weeklySteps: 9800, rank: 1 },
      { userId: "user-21", nickname: "저녁걷기", avatarEmoji: "🥈", weeklySteps: 8400, rank: 2 },
      { userId: "user-22", nickname: "퇴근러너", avatarEmoji: "🥉", weeklySteps: 7600, rank: 3 },
    ],
    createdAt: "2026-04-15T00:00:00+09:00",
  },
  {
    id: "party-004",
    name: "아침 요가 & 걷기",
    emoji: "🧘",
    description: "요가 30분 + 공원 걷기 1시간, 몸과 마음 모두 건강하게!",
    tags: ["요가", "걷기", "힐링"],
    memberCount: 9,
    maxMembers: 12,
    targetDistance: "4km",
    exerciseTime: "아침",
    leader: "요가마스터_소연",
    isJoined: false,
    ranking: [
      { userId: "user-30", nickname: "요가마스터_소연", avatarEmoji: "🥇", weeklySteps: 11200, rank: 1 },
      { userId: "user-31", nickname: "아침형인간", avatarEmoji: "🥈", weeklySteps: 9900, rank: 2 },
      { userId: "user-32", nickname: "공원산책러", avatarEmoji: "🥉", weeklySteps: 8700, rank: 3 },
    ],
    createdAt: "2026-04-20T00:00:00+09:00",
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export const getJoinedParties = (): Party[] =>
  parties.filter((p) => p.isJoined);

export const getPartyById = (id: string): Party | undefined =>
  parties.find((p) => p.id === id);

export const isFull = (party: Party): boolean =>
  party.memberCount >= party.maxMembers;

// ─────────────────────────────────────────────
// Supabase 교체 시 아래 함수들로 대체
// ─────────────────────────────────────────────
//
// async function fetchAllParties(): Promise<Party[]> {
//   const { data } = await supabase
//     .from("parties")
//     .select("*, party_members(count), party_rankings(*)")
//     .order("created_at", { ascending: false });
//   return data ?? [];
// }
//
// async function fetchJoinedParties(userId: string): Promise<Party[]> {
//   const { data } = await supabase
//     .from("party_members")
//     .select("party:parties(*)")
//     .eq("user_id", userId);
//   return data?.map((d) => d.party) ?? [];
// }
//
// async function joinParty(partyId: string, userId: string): Promise<void> {
//   await supabase
//     .from("party_members")
//     .insert({ party_id: partyId, user_id: userId });
// }
