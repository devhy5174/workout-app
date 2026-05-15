import { useState, useEffect } from "react";
import {
  fetchTodayTopParties,
  fetchTrendingParties,
  type PartyHighlight,
} from "../lib/partyService";

export function usePartyHighlights() {
  const [topParties, setTopParties] = useState<PartyHighlight[]>([]);
  const [trendingParties, setTrendingParties] = useState<PartyHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTodayTopParties(), fetchTrendingParties()]).then(
      ([top, trending]) => {
        setTopParties(top);
        setTrendingParties(trending);
        setIsLoading(false);
      },
    );
  }, []);

  return { topParties, trendingParties, isLoading };
}
