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

type MyRank = { rank: number; partyName: string; partyId: string; steps: number } | null;

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

    Promise.all(tasks).then(([top, trending, weeklyTop, weeklyAvg, myRank, myWeeklyRank]) => {
      setTopParties(top);
      setTrendingParties(trending);
      setWeeklyTopParties(weeklyTop);
      setWeeklyAvgTopParties(weeklyAvg);
      if (myRank !== undefined) setMyPartyRank(myRank);
      if (myWeeklyRank !== undefined) setMyPartyWeeklyRank(myWeeklyRank);
      setIsLoading(false);
    });
  }, [userId]);

  return { topParties, trendingParties, weeklyTopParties, weeklyAvgTopParties, myPartyRank, myPartyWeeklyRank, isLoading };
}
