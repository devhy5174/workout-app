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
        const [postsData, myPostsData] = await Promise.all([
          getPosts(),
          user ? getMyPosts(user.id) : Promise.resolve<CommunityPost[]>([]),
        ]);
        if (!cancelled) {
          setPosts(postsData);
          if (user) setMyPosts(myPostsData);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  // 내 게시글 cheers 실시간 반영
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`community-my-posts-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "community_posts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setMyPosts((prev) =>
            prev.map((p) =>
              p.id === updated.id ? { ...p, cheers: updated.cheers } : p,
            ),
          );
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const toggleCheer = async (postId: string) => {
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

    if (isAlreadyCheered) {
      await removeCheer(postId);
    } else {
      await addCheer(postId);
    }
  };

  const submitPost = async (data: { text: string; tags: string[] }) => {
    if (!user) return { error: "로그인이 필요합니다." };
    const { data: newPost, error } = await createPost(
      { text: data.text, tags: data.tags, steps: 0 },
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
