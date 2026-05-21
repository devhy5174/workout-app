import { supabase } from "./supabase";

export type SensoryCard = {
  id: string;
  label: string;
  gradient: string;
};

export const SENSORY_CARDS: SensoryCard[] = [
  { id: "night",   label: "밤거리",  gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" },
  { id: "sunset",  label: "노을",    gradient: "linear-gradient(135deg, #ff9a56 0%, #ff6b35 50%, #c94b4b 100%)" },
  { id: "spring",  label: "봄길",    gradient: "linear-gradient(135deg, #f8c8d4 0%, #e8a4b8 50%, #d4849c 100%)" },
  { id: "forest",  label: "숲속",    gradient: "linear-gradient(135deg, #a8d8a8 0%, #72b872 50%, #4a9e4a 100%)" },
  { id: "rain",    label: "빗속",    gradient: "linear-gradient(135deg, #8fa8c8 0%, #6888a8 50%, #4a6888 100%)" },
  { id: "river",   label: "강변",    gradient: "linear-gradient(135deg, #b8d4e8 0%, #7ab0d4 50%, #4a8cb8 100%)" },
  { id: "dawn",    label: "새벽",    gradient: "linear-gradient(135deg, #2d1b69 0%, #5a2d82 50%, #8b5cf6 100%)" },
  { id: "autumn",  label: "가을길",  gradient: "linear-gradient(135deg, #d4a04a 0%, #c47820 50%, #a05a10 100%)" },
  { id: "commute", label: "퇴근길",  gradient: "linear-gradient(135deg, #3d2b4e 0%, #6b4a7e 50%, #9b6fa8 100%)" },
  { id: "morning", label: "출근길",  gradient: "linear-gradient(135deg, #f0a070 0%, #e07840 50%, #c05820 100%)" },
  { id: "street",  label: "도심",    gradient: "linear-gradient(135deg, #4a4a5a 0%, #6a6a7a 50%, #8a8a9a 100%)" },
];

export const getCardById = (id: string): SensoryCard =>
  SENSORY_CARDS.find((c) => c.id === id) ?? SENSORY_CARDS[0];

export type CommunityPost = {
  id: string;
  user_id: string;
  text: string;
  card_id: string;
  tags: string[];
  steps: number;
  cheers: number;
  created_at: string;
  nickname: string;
  character_id: string | null;
  activity_type_id: number | null;
  profile_title: string | null;
  frame_id: string | null;
};

type ProfileMap = Map<string, { nickname: string; character_id: string | null; activity_type_id: number | null; title: string | null }>;

async function fetchProfileMap(userIds: string[]): Promise<ProfileMap> {
  if (userIds.length === 0) return new Map();
  const { data } = await supabase
    .from("public_profiles")
    .select("id, nickname, character_id, activity_type_id, title")
    .in("id", userIds);
  const map: ProfileMap = new Map();
  for (const p of data ?? []) {
    map.set(p.id, {
      nickname: p.nickname ?? "익명",
      character_id: p.character_id ?? null,
      activity_type_id: p.activity_type_id ?? null,
      title: p.title ?? null,
    });
  }
  return map;
}

// community_cheers 테이블에서 post별 응원 수 집계
async function fetchCheersMap(postIds: string[]): Promise<Record<string, number>> {
  if (postIds.length === 0) return {};
  const { data } = await supabase
    .from("community_cheers")
    .select("post_id")
    .in("post_id", postIds);
  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    map[row.post_id] = (map[row.post_id] ?? 0) + 1;
  }
  return map;
}

function mergePost(row: any, profileMap: ProfileMap, cheersMap: Record<string, number>): CommunityPost {
  const profile = profileMap.get(row.user_id);
  return {
    id: row.id,
    user_id: row.user_id,
    text: row.text,
    card_id: row.card_id ?? "night",
    tags: Array.isArray(row.tags) ? row.tags : [],
    steps: row.steps ?? 0,
    cheers: cheersMap[row.id] ?? 0,
    created_at: row.created_at,
    nickname: profile?.nickname ?? "익명",
    character_id: profile?.character_id ?? null,
    activity_type_id: profile?.activity_type_id ?? null,
    profile_title: profile?.title ?? null,
    frame_id: row.frame_id ?? null,
  };
}

export async function getPosts(
  userId?: string,
): Promise<{ posts: CommunityPost[]; cheeredIds: Set<string> }> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) return { posts: [], cheeredIds: new Set() };

  const postIds = data.map((r: any) => r.id);
  const userIds = [...new Set(data.map((r: any) => r.user_id))];

  const [profileMap, cheersMap, cheeredResult] = await Promise.all([
    fetchProfileMap(userIds),
    fetchCheersMap(postIds),
    userId
      ? supabase.from("community_cheers").select("post_id").eq("user_id", userId)
      : Promise.resolve({ data: [] as { post_id: string }[], error: null }),
  ]);

  return {
    posts: data.map((r: any) => mergePost(r, profileMap, cheersMap)),
    cheeredIds: new Set((cheeredResult.data ?? []).map((r) => r.post_id)),
  };
}

export async function getMyPosts(userId: string): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return [];

  const postIds = data.map((r: any) => r.id);
  const [profileMap, cheersMap] = await Promise.all([
    fetchProfileMap([userId]),
    fetchCheersMap(postIds),
  ]);
  return data.map((r: any) => mergePost(r, profileMap, cheersMap));
}

export async function createPost(
  input: { text: string; tags: string[]; steps?: number; frame_id?: string | null },
  userId: string,
): Promise<{ data: CommunityPost | null; error: string | null }> {
  const { data: row, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: userId,
      text: input.text,
      tags: input.tags,
      steps: input.steps ?? 0,
      cheers: 0,
      frame_id: input.frame_id ?? null,
    })
    .select("*")
    .single();
  if (error || !row) return { data: null, error: error?.message ?? "작성 실패" };
  const profileMap = await fetchProfileMap([userId]);
  return { data: mergePost(row, profileMap, {}), error: null };
}

export async function deletePost(postId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId);
  return { error: error?.message ?? null };
}

export async function addCheer(
  postId: string,
  userId: string,
  postAuthorId: string,
): Promise<{ error: string | null }> {
  if (postAuthorId === userId) return { error: null };
  const { error } = await supabase
    .from("community_cheers")
    .insert({ post_id: postId, user_id: userId });
  return { error: error?.message ?? null };
}

export async function removeCheer(
  postId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("community_cheers")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);
  return { error: error?.message ?? null };
}
