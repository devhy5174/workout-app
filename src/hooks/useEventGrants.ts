import { useCallback, useEffect, useState } from "react";
import {
  fetchUserEventGrants,
  type UserEventGrantInfo,
} from "../lib/eventService";

const EMPTY: UserEventGrantInfo = { grantedBubbleIds: [], grantedTitles: [] };

export function useEventGrants(userId: string | null | undefined) {
  const [grants, setGrants] = useState<UserEventGrantInfo>(EMPTY);

  const load = useCallback(async () => {
    if (!userId) return;
    const data = await fetchUserEventGrants(userId);
    setGrants(data);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...grants, refresh: load };
}
