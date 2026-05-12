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
  tag: string;
  steps: number;
  cheers: number;
  created_at: string;
  nickname: string;
  character_id: string | null;
  activity_type_id: number | null;
};

type ProfileMap = Map<string, { nickname: string; character_id: string | null; activity_type_id: number | null }>;

async function fetchProfileMap(userIds: string[]): Promise<ProfileMap> {
  if (userIds.length === 0) return new Map();
  const { data } = await supabase
    .from("public_profiles")
    .select("id, nickname, character_id, activity_type_id")
    .in("id", userIds);
  const map: ProfileMap = new Map();
  for (const p of data ?? []) {
    map.set(p.id, {
      nickname: p.nickname ?? "익명",
      character_id: p.character_id ?? null,
      activity_type_id: p.activity_type_id ?? null,
    });
  }
  return map;
}

function mergePost(row: any, profileMap: ProfileMap): CommunityPost {
  const profile = profileMap.get(row.user_id);
  return {
    id: row.id,
    user_id: row.user_id,
    text: row.text,
    card_id: row.card_id ?? "night",
    tag: row.tag ?? "",
    steps: row.steps ?? 0,
    cheers: row.cheers ?? 0,
    created_at: row.created_at,
    nickname: profile?.nickname ?? "익명",
    character_id: profile?.character_id ?? null,
    activity_type_id: profile?.activity_type_id ?? null,
  };
}

export async function getPosts(): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data || data.length === 0) return [];
  const userIds = [...new Set(data.map((r: any) => r.user_id))];
  const profileMap = await fetchProfileMap(userIds);
  return data.map((r: any) => mergePost(r, profileMap));
}

export async function getMyPosts(userId: string): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return [];
  const profileMap = await fetchProfileMap([userId]);
  return data.map((r: any) => mergePost(r, profileMap));
}

export async function createPost(
  input: { text: string; card_id: string; tag: string; steps?: number },
  userId: string,
): Promise<{ data: CommunityPost | null; error: string | null }> {
  const { data: row, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: userId,
      text: input.text,
      card_id: input.card_id,
      tag: input.tag,
      steps: input.steps ?? 0,
      cheers: 0,
    })
    .select("*")
    .single();
  if (error || !row) return { data: null, error: error?.message ?? "작성 실패" };
  const profileMap = await fetchProfileMap([userId]);
  return { data: mergePost(row, profileMap), error: null };
}

export async function deletePost(postId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId);
  return { error: error?.message ?? null };
}

export async function addCheer(postId: string): Promise<{ error: string | null }> {
  const { data } = await supabase
    .from("community_posts")
    .select("cheers")
    .eq("id", postId)
    .single();
  const { error } = await supabase
    .from("community_posts")
    .update({ cheers: ((data as any)?.cheers ?? 0) + 1 })
    .eq("id", postId);
  return { error: error?.message ?? null };
}

export async function removeCheer(postId: string): Promise<{ error: string | null }> {
  const { data } = await supabase
    .from("community_posts")
    .select("cheers")
    .eq("id", postId)
    .single();
  const current = (data as any)?.cheers ?? 0;
  const { error } = await supabase
    .from("community_posts")
    .update({ cheers: Math.max(0, current - 1) })
    .eq("id", postId);
  return { error: error?.message ?? null };
}
