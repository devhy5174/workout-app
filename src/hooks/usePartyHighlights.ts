import { useState, useEffect } from "react";
import {
  fetchTodayTopParties,
  fetchTrendingParties,
  fetchMyPartyRank,
  fetchMyPartyWeeklyRank,
  fetchWeeklyTopParties,
  fetchWeeklyAvgTopParties,
  type PartyHighlight,
} from "../lib/partyService";
import { getFakePartyHighlights } from "../data/fakeUsers";

type MyRank = { rank: number; partyName: string; partyId: string; steps: number } | null;

/** 실파티 3개 미만이면 페이크 파티로 채워 반환. value 기준 재정렬 */
function fillWithFakeParties(
  real: PartyHighlight[],
  period: "weekly" | "daily",
  now: Date,
): PartyHighlight[] {
  if (real.length >= 3) return real;
  const realIds = new Set(real.map((p) => p.id));
  const fakes = getFakePartyHighlights(period, now).filter(
    (p) => !realIds.has(p.id),
  );
  const needed = 3 - real.length;
  return [...real, ...fakes.slice(0, needed)].sort(
    (a, b) => b.value - a.value,
  );
}

export function usePartyHighlights(userId?: string) {
  const [topParties, setTopParties] = useState<PartyHighlight[]>([]);
  const [trendingParties, setTrendingParties] = useState<PartyHighlight[]>([]);
  const [weeklyTopParties, setWeeklyTopParties] = useState<PartyHighlight[]>([]);
  const [weeklyAvgTopParties, setWeeklyAvgTopParties] = useState<PartyHighlight[]>([]);
  const [myPartyRank, setMyPartyRank] = useState<MyRank>(null);
  const [myPartyWeeklyRank, setMyPartyWeeklyRank] = useState<MyRank>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tasks: Promise<any>[] = [
      fetchTodayTopParties(),
      fetchTrendingParties(),
      fetchWeeklyTopParties(),
      fetchWeeklyAvgTopParties(),
    ];
    if (userId) {
      tasks.push(fetchMyPartyRank(userId));
      tasks.push(fetchMyPartyWeeklyRank(userId));
    }

    const now = new Date();
    Promise.all(tasks).then(([top, trending, weeklyTop, weeklyAvg, myRank, myWeeklyRank]) => {
      setTopParties(fillWithFakeParties(top, "daily", now));
      setTrendingParties(trending);
      setWeeklyTopParties(fillWithFakeParties(weeklyTop, "weekly", now));
      setWeeklyAvgTopParties(weeklyAvg);
      if (myRank !== undefined) setMyPartyRank(myRank);
      if (myWeeklyRank !== undefined) setMyPartyWeeklyRank(myWeeklyRank);
      setIsLoading(false);
    });
  }, [userId]);

  return { topParties, trendingParties, weeklyTopParties, weeklyAvgTopParties, myPartyRank, myPartyWeeklyRank, isLoading };
}
