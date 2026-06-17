import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  getPosts,
  getMyPosts,
  createPost,
  updatePostContent,
  deletePost,
  addCheer,
  removeCheer,
  type CommunityPost,
} from "../lib/communityService";
import { fetchTodayStats } from "../lib/workoutService";
import { useUser } from "../context/UserContext";
import { FAKE_COMMUNITY_POSTS } from "../data/fakeUsers";

const FAKE_USER_IDS = new Set(FAKE_COMMUNITY_POSTS.map((p) => p.user_id));

export type { CommunityPost };

function mergeWithFakes(realPosts: CommunityPost[]): CommunityPost[] {
  const realIds = new Set(realPosts.map((p) => p.id));
  const fakesToAdd = FAKE_COMMUNITY_POSTS.filter((p) => !realIds.has(p.id));

  // 날짜별 가짜 게시글 1개만 노출 (하루에 한 명만 올라오는 것처럼)
  // 날짜 해시로 매일 다른 게시글이 선택되도록 함
  const byDate = new Map<string, CommunityPost[]>();
  for (const p of fakesToAdd) {
    const dateKey = p.created_at.slice(0, 10);
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(p);
  }
  const oncePerDay = [...byDate.entries()].map(([dateKey, group]) => {
    // 날짜 문자열을 숫자로 변환해 그날마다 다른 인덱스 선택
    const seed = dateKey.replace(/-/g, "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return group[seed % group.length];
  });

  return [...realPosts, ...oncePerDay].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function useCommunity() {
  const { user } = useUser();
  const [, setRealPosts] = useState<CommunityPost[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cheeredIds, setCheeredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [{ posts: postsData, cheeredIds: fetchedCheeredIds, hasMore: more }, myPostsData] =
          await Promise.all([
            getPosts(user?.id),
            user ? getMyPosts(user.id) : Promise.resolve<CommunityPost[]>([]),
          ]);
        if (!cancelled) {
          setRealPosts(postsData);
          setPosts(mergeWithFakes(postsData));
          setHasMore(more);
          setCursor(postsData.length > 0 ? postsData[postsData.length - 1].created_at : null);
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

  const loadMore = async () => {
    if (!cursor || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const { posts: newPosts, hasMore: more } = await getPosts(user?.id, cursor);
      if (newPosts.length > 0) {
        setRealPosts((prev) => {
          const next = [...prev, ...newPosts];
          setPosts(mergeWithFakes(next));
          return next;
        });
        setCursor(newPosts[newPosts.length - 1].created_at);
        setHasMore(more);
      } else {
        setHasMore(false);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

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

    // 페이크 게시글은 Supabase 호출 없이 로컬 상태만 반영
    if (FAKE_USER_IDS.has(post.user_id)) return;

    const { error } = isAlreadyCheered
      ? await removeCheer(postId, user.id)
      : await addCheer(postId, user.id, post.user_id);

    if (!error) {
      const freshMyPosts = await getMyPosts(user.id);
      setMyPosts(freshMyPosts);
    }
  };

  const todayPost = myPosts.find(
    (p) => !p.source_type && p.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10),
  ) ?? null;

  const submitPost = async (data: { text: string; tags: string[]; frame_id?: string | null }) => {
    if (!user) return { error: "로그인이 필요합니다." };
    const { steps } = await fetchTodayStats(user.id);

    if (todayPost) {
      // 오늘 이미 올린 글이 있으면 수정
      const { data: updated, error } = await updatePostContent(todayPost.id, user.id, {
        text: data.text,
        tags: data.tags,
        steps,
        frame_id: data.frame_id ?? null,
      });
      if (error || !updated) return { error };
      const updater = (prev: CommunityPost[]) =>
        prev.map((p) => (p.id === todayPost.id ? updated : p));
      setPosts(updater);
      setMyPosts(updater);
      return { error: null, updated: true };
    }

    const { data: newPost, error } = await createPost(
      { text: data.text, tags: data.tags, steps, frame_id: data.frame_id ?? null },
      user.id,
    );
    if (error || !newPost) return { error };
    setPosts((prev) => [newPost, ...prev]);
    setMyPosts((prev) => [newPost, ...prev]);
    return { error: null, updated: false };
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
    todayPost,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    cheeredIds,
    toggleCheer,
    submitPost,
    removePost,
    thisWeekCount,
    totalCheersReceived,
  };
}
