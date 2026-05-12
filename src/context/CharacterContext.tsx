/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  avatarCharacters,
  getAvatarCharacterById,
  type AvatarCharacter,
} from "../data/avatarCharacters";
import { storage } from "../utils/storage";
import { useUser } from "./UserContext";

type CharacterContextValue = {
  selectedCharacter: AvatarCharacter | null;
  selectedCharacterId: string | null;
  selectCharacter: (id: string) => Promise<{ error: string | null }>;
};

const defaultCharacter = avatarCharacters[0] ?? null;

const CharacterContext = createContext<CharacterContextValue>({
  selectedCharacter: defaultCharacter,
  selectedCharacterId: defaultCharacter?.id ?? null,
  selectCharacter: async () => ({ error: null }),
});

export function CharacterProvider({ children }: { children: ReactNode }) {
  const { user, userProfile, updateProfile } = useUser();
  const [localCharacterId, setLocalCharacterId] = useState<string | null>(null);

  useEffect(() => {
    const profileCharacter = getAvatarCharacterById(userProfile?.character_id);
    if (!profileCharacter) return;

    storage.set("AVATAR_CHARACTER", profileCharacter.id);
  }, [userProfile?.character_id]);

  const profileCharacterId = getAvatarCharacterById(userProfile?.character_id)?.id;
  const savedCharacterId = getAvatarCharacterById(storage.get("AVATAR_CHARACTER"))?.id;
  const selectedCharacterId =
    localCharacterId ?? profileCharacterId ?? savedCharacterId ?? defaultCharacter?.id ?? null;

  const selectedCharacter = useMemo(
    () => getAvatarCharacterById(selectedCharacterId) ?? defaultCharacter,
    [selectedCharacterId],
  );

  const selectCharacter = async (id: string) => {
    const nextCharacter = getAvatarCharacterById(id);
    if (!nextCharacter) return { error: "존재하지 않는 캐릭터입니다." };

    setLocalCharacterId(nextCharacter.id);
    storage.set("AVATAR_CHARACTER", nextCharacter.id);

    if (!user) return { error: null };

    const result = await updateProfile({ character_id: nextCharacter.id });
    if (result.error) {
      const fallbackId = profileCharacterId ?? defaultCharacter?.id ?? null;
      setLocalCharacterId(fallbackId);
      if (fallbackId) storage.set("AVATAR_CHARACTER", fallbackId);
    }

    return result;
  };

  return (
    <CharacterContext.Provider
      value={{
        selectedCharacter,
        selectedCharacterId,
        selectCharacter,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export const useCharacter = () => useContext(CharacterContext);
