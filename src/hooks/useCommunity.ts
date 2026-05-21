import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  getPosts,
  getMyPosts,
  createPost,
  deletePost,
  addCheer,
  removeCheer,
  type CommunityPost,
} from "../lib/communityService";
import { fetchTodayStats } from "../lib/workoutService";
import { useUser } from "../context/UserContext";

export type { CommunityPost };

export function useCommunity() {
  const { user } = useUser();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cheeredIds, setCheeredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [{ posts: postsData, cheeredIds: fetchedCheeredIds }, myPostsData] =
          await Promise.all([
            getPosts(user?.id),
            user ? getMyPosts(user.id) : Promise.resolve<CommunityPost[]>([]),
          ]);
        if (!cancelled) {
          setPosts(postsData);
          setCheeredIds(fetchedCheeredIds);
          if (user) setMyPosts(myPostsData);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  // 내 게시글 cheers 실시간 반영 (community_cheers INSERT/DELETE 감지)
  useEffect(() => {
    if (!user) return;

    const applyDelta = (postId: string, delta: 1 | -1) => {
      setMyPosts((prev) => {
        const matched = prev.some((p) => p.id === postId);
        if (!matched) return prev;
        return prev.map((p) =>
          p.id === postId
            ? { ...p, cheers: Math.max(0, p.cheers + delta) }
            : p,
        );
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, cheers: Math.max(0, p.cheers + delta) }
            : p,
        ),
      );
    };

    const channel = supabase
      .channel(`community-cheers-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_cheers" },
        (payload) => applyDelta((payload.new as any).post_id, 1),
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "community_cheers" },
        (payload) => applyDelta((payload.old as any).post_id, -1),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const toggleCheer = async (postId: string) => {
    if (!user) return;

    const post = [...posts, ...myPosts].find((p) => p.id === postId);
    if (!post || post.user_id === user.id) return;

    const isAlreadyCheered = cheeredIds.has(postId);
    const delta = isAlreadyCheered ? -1 : 1;

    const updater = (prev: CommunityPost[]) =>
      prev.map((p) =>
        p.id === postId ? { ...p, cheers: Math.max(0, p.cheers + delta) } : p,
      );
    setPosts(updater);
    setMyPosts(updater);

    setCheeredIds((prev) => {
      const next = new Set(prev);
      if (isAlreadyCheered) next.delete(postId);
      else next.add(postId);
      return next;
    });

    const { error } = isAlreadyCheered
      ? await removeCheer(postId, user.id)
      : await addCheer(postId, user.id, post.user_id);

    if (!error) {
      const freshMyPosts = await getMyPosts(user.id);
      setMyPosts(freshMyPosts);
    }
  };

  const submitPost = async (data: { text: string; tags: string[]; frame_id?: string | null }) => {
    if (!user) return { error: "로그인이 필요합니다." };
    const { steps } = await fetchTodayStats(user.id);
    const { data: newPost, error } = await createPost(
      { text: data.text, tags: data.tags, steps, frame_id: data.frame_id ?? null },
      user.id,
    );
    if (error || !newPost) return { error };
    setPosts((prev) => [newPost, ...prev]);
    setMyPosts((prev) => [newPost, ...prev]);
    return { error: null };
  };

  const removePost = async (postId: string) => {
    const { error } = await deletePost(postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    }
    return { error };
  };

  // 이번 주 월~일 기준
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekCount = myPosts.filter(
    (p) => new Date(p.created_at) >= startOfWeek,
  ).length;
  const totalCheersReceived = myPosts.reduce((sum, p) => sum + p.cheers, 0);

  return {
    posts,
    myPosts,
    isLoading,
    cheeredIds,
    toggleCheer,
    submitPost,
    removePost,
    thisWeekCount,
    totalCheersReceived,
  };
}
