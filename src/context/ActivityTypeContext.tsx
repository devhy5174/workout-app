import { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../utils/storage";
import { type ActivityType, activityTypes } from "../data/activityTypes";
import { useUser } from "./UserContext";

type ActivityTypeContextValue = {
  selectedId: number | null;
  selectedActivityType: ActivityType | null;
  selectActivityType: (id: number) => void;
};

const ActivityTypeContext = createContext<ActivityTypeContextValue>({
  selectedId: null,
  selectedActivityType: null,
  selectActivityType: () => {},
});

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const { userProfile } = useUser();
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const saved = storage.get("CHARACTER");
    return saved ? Number(saved) : null;
  });

  // userProfile.activity_type_id에서 자동 동기화 (로그인, 다른 기기, 온보딩 직후)
  useEffect(() => {
    if (selectedId === null && userProfile?.activity_type_id) {
      setSelectedId(userProfile.activity_type_id);
      storage.set("CHARACTER", String(userProfile.activity_type_id));
    }
  }, [userProfile?.activity_type_id, selectedId]);

  const selectedActivityType = activityTypes.find((c) => c.id === selectedId) ?? null;

  const selectActivityType = (id: number) => {
    setSelectedId(id);
    storage.set("CHARACTER", String(id));
  };

  return (
    <ActivityTypeContext.Provider
      value={{ selectedId, selectedActivityType, selectActivityType }}
    >
      {children}
    </ActivityTypeContext.Provider>
  );
}

export const useCharacter = () => useContext(ActivityTypeContext);
