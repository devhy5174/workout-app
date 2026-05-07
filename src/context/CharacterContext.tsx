import { createContext, useContext, useState } from "react";
import { storage } from "../utils/storage";

export type Character = {
  id: number;
  emoji: string;
  name: string;
  style: string;
  bonus: string;
  bonusIcon: string;
  color: string;
  bg: string;
  border: string;
};

export const CHARACTERS: Character[] = [
  {
    id: 1,
    emoji: "🚶",
    name: "워커",
    style: "매일 꾸준한 산책",
    bonus: "연속 운동 포인트 2배",
    bonusIcon: "🔥",
    color: "from-green-400 to-teal-400",
    bg: "bg-green-50",
    border: "border-green-400",
  },
  {
    id: 2,
    emoji: "🏃",
    name: "스프린터",
    style: "단거리 질주 특화",
    bonus: "목표 달성 포인트 2배",
    bonusIcon: "⚡",
    color: "from-orange-400 to-red-400",
    bg: "bg-orange-50",
    border: "border-orange-400",
  },
  {
    id: 3,
    emoji: "🧘",
    name: "요가마스터",
    style: "꾸준함과 마음의 균형",
    bonus: "7일 연속 달성 보너스",
    bonusIcon: "✨",
    color: "from-purple-400 to-pink-400",
    bg: "bg-purple-50",
    border: "border-purple-400",
  },
  {
    id: 4,
    emoji: "🏋️",
    name: "파워리프터",
    style: "집중 고강도 운동",
    bonus: "주간 목표 달성 보너스",
    bonusIcon: "💪",
    color: "from-red-500 to-rose-400",
    bg: "bg-red-50",
    border: "border-red-400",
  },
  {
    id: 5,
    emoji: "🌊",
    name: "스위머",
    style: "물 속에서 온몸 단련",
    bonus: "포인트 1.5배 적립",
    bonusIcon: "💎",
    color: "from-blue-400 to-cyan-400",
    bg: "bg-blue-50",
    border: "border-blue-400",
  },
  {
    id: 6,
    emoji: "🚵",
    name: "어드벤처러",
    style: "야외 등산 & 탐험",
    bonus: "파티 참여 보너스",
    bonusIcon: "🗺️",
    color: "from-yellow-400 to-orange-400",
    bg: "bg-yellow-50",
    border: "border-yellow-400",
  },
];

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

  const selectedCharacter = CHARACTERS.find((c) => c.id === selectedId) ?? null;

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
