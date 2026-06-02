// badge_01.webp ~ badge_25.webp 개별 이미지 import
import b01 from "../../assets/images/badges/badge_01.webp";
import b02 from "../../assets/images/badges/badge_02.webp";
import b03 from "../../assets/images/badges/badge_03.webp";
import b04 from "../../assets/images/badges/badge_04.webp";
import b05 from "../../assets/images/badges/badge_05.webp";
import b06 from "../../assets/images/badges/badge_06.webp";
import b07 from "../../assets/images/badges/badge_07.webp";
import b08 from "../../assets/images/badges/badge_08.webp";
import b09 from "../../assets/images/badges/badge_09.webp";
import b10 from "../../assets/images/badges/badge_10.webp";
import b11 from "../../assets/images/badges/badge_11.webp";
import b12 from "../../assets/images/badges/badge_12.webp";
import b13 from "../../assets/images/badges/badge_13.webp";
import b14 from "../../assets/images/badges/badge_14.webp";
import b15 from "../../assets/images/badges/badge_15.webp";
import b16 from "../../assets/images/badges/badge_16.webp";
import b17 from "../../assets/images/badges/badge_17.webp";
import b18 from "../../assets/images/badges/badge_18.webp";
import b19 from "../../assets/images/badges/badge_19.webp";
import b20 from "../../assets/images/badges/badge_20.webp";
import b21 from "../../assets/images/badges/badge_21.webp";
import b22 from "../../assets/images/badges/badge_22.webp";
import b23 from "../../assets/images/badges/badge_23.webp";
import b24 from "../../assets/images/badges/badge_24.webp";
import b25 from "../../assets/images/badges/badge_25.webp";
import { ACHIEVEMENTS_WITH_IMAGES } from "../../data/achievementsWithImages";

const BADGE_IMAGES = [b01,b02,b03,b04,b05,b06,b07,b08,b09,b10,b11,b12,b13,b14,b15,b16,b17,b18,b19,b20,b21,b22,b23,b24,b25];

const SPRITE_BY_ID: Record<string, number> = Object.fromEntries(
  ACHIEVEMENTS_WITH_IMAGES.map((a) => [a.id, a.spriteIndex])
);

interface Props {
  achievementId: string;
  size: number;
  grayscale?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export function BadgeSprite({ achievementId, size, grayscale, className, style, onClick }: Props) {
  const index = SPRITE_BY_ID[achievementId] ?? 0;
  const src = BADGE_IMAGES[index];

  return (
    <img
      src={src}
      alt={achievementId}
      onClick={onClick}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: grayscale ? "grayscale(100%) brightness(0.7)" : "none",
        ...style,
      }}
    />
  );
}
