import { useState, useEffect, useCallback } from "react";
import {
  getParties,
  getMyParties,
  createParty,
  joinParty,
  leaveParty,
  kickMember,
  deleteParty,
  getPartyMembers,
  getAchievedPartiesForUser,
  type Party,
  type CreatePartyInput,
  type AchievedParty,
} from "../lib/partyService";

export function useParty(userId: string | null) {
  const [parties, setParties] = useState<Party[]>([]);
  const [myParties, setMyParties] = useState<Party[]>([]);
  const [achievedParties, setAchievedParties] = useState<AchievedParty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [all, mine, achieved] = await Promise.all([
        getParties(),
        userId ? getMyParties(userId) : Promise.resolve([]),
        userId ? getAchievedPartiesForUser(userId) : Promise.resolve([]),
      ]);
      setParties(all);
      setMyParties(mine);
      setAchievedParties(achieved);
    } catch {
      setError("파티를 불러오는데 실패했어요");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [refresh]);

  const handleCreate = async (input: CreatePartyInput) => {
    if (!userId) return { error: "로그인이 필요합니다." };
    const { error } = await createParty(input, userId);
    if (!error) await refresh();
    return { error };
  };

  const handleJoin = async (partyId: string) => {
    if (!userId) return { error: "로그인이 필요합니다." };
    const { error } = await joinParty(partyId, userId);
    if (!error) await refresh();
    return { error };
  };

  const handleLeave = async (partyId: string) => {
    if (!userId) return { error: "로그인이 필요합니다." };
    const { error } = await leaveParty(partyId, userId);
    if (!error) await refresh();
    return { error };
  };

  const handleKick = async (partyId: string, targetUserId: string) => {
    const { error } = await kickMember(partyId, targetUserId);
    if (!error) await refresh();
    return { error };
  };

  const handleDelete = async (partyId: string) => {
    const { error } = await deleteParty(partyId);
    if (!error) await refresh();
    return { error };
  };

  const isJoined = (partyId: string) => myParties.some((p) => p.id === partyId);
  const isLeader = (party: Party) => userId !== null && party.created_by === userId;

  return {
    parties,
    myParties,
    achievedParties,
    isLoading,
    error,
    isJoined,
    isLeader,
    createParty: handleCreate,
    joinParty: handleJoin,
    leaveParty: handleLeave,
    kickMember: handleKick,
    deleteParty: handleDelete,
    fetchPartyMembers: getPartyMembers,
    refresh,
  };
}
