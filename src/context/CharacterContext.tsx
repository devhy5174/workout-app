import { createContext, useContext, useState } from "react";
import { storage } from "../utils/storage";
import { type Character, characters } from "../data/characters";

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
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    // TODO: Supabase - user_profiles 테이블에서 character_id 조회로 교체
    const saved = storage.get("CHARACTER");
    return saved ? Number(saved) : null;
  });

  const selectedCharacter = characters.find((c) => c.id === selectedId) ?? null;

  const selectCharacter = (id: number) => {
    setSelectedId(id);
    // TODO: Supabase - user_profiles 테이블 upsert({ character_id: id })로 교체
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
