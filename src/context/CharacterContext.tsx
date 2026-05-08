import { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../utils/storage";
import { type Character, characters } from "../data/characters";
import { useUser } from "./UserContext";

type CharacterContextValue = {
  selectedId: number | null;
  selectedCharacter: Character | null;
  selectCharacter: (id: number) => void;
};

const CharacterContext = createContext<CharacterContextValue>({
  selectedId: null,
  selectedCharacter: null,
  selectCharacter: () => {},
});

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const { userProfile } = useUser();
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const saved = storage.get("CHARACTER");
    return saved ? Number(saved) : null;
  });

  // userProfile.character_id에서 자동 동기화 (로그인, 다른 기기, 온보딩 직후)
  useEffect(() => {
    if (selectedId === null && userProfile?.character_id) {
      setSelectedId(userProfile.character_id);
      storage.set("CHARACTER", String(userProfile.character_id));
    }
  }, [userProfile?.character_id, selectedId]);

  const selectedCharacter = characters.find((c) => c.id === selectedId) ?? null;

  const selectCharacter = (id: number) => {
    setSelectedId(id);
    storage.set("CHARACTER", String(id));
  };

  return (
    <CharacterContext.Provider
      value={{ selectedId, selectedCharacter, selectCharacter }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export const useCharacter = () => useContext(CharacterContext);
