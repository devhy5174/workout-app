import { useState } from "react";

export type EquippedBadge = {
  id: string;
  x: number; // 0~1 컨테이너 너비 비율
  y: number; // 0~1 컨테이너 높이 비율
};

const MAX_BADGES = 8;

export function useEquippedBadges(userId: string | undefined) {
  const key = `equipped_badges_${userId ?? "guest"}`;

  const [equipped, setEquipped] = useState<EquippedBadge[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "[]");
    } catch {
      return [];
    }
  });

  const save = (next: EquippedBadge[]) => {
    setEquipped(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const place = (id: string, x: number, y: number) => {
    const filtered = equipped.filter((b) => b.id !== id);
    if (filtered.length >= MAX_BADGES) filtered.shift();
    save([...filtered, { id, x, y }]);
  };

  const remove = (id: string) => {
    save(equipped.filter((b) => b.id !== id));
  };

  return { equipped, place, remove };
}
