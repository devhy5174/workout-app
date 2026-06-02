import bedgesImg from "../../assets/images/bedges.png";
import { ACHIEVEMENTS_WITH_IMAGES } from "../../data/achievementsWithImages";

const SPRITE_BY_ID: Record<string, number> = Object.fromEntries(
  ACHIEVEMENTS_WITH_IMAGES.map((a) => [a.id, a.spriteIndex])
);

const SHEET_W = 1254;
const CELL_W = 250;
const STRIDE = 251;

interface Props {
  achievementId: string;
  size: number;
  grayscale?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export function BadgeSprite({ achievementId, size, grayscale, className, style, onClick }: Props) {
  const spriteIndex = SPRITE_BY_ID[achievementId] ?? 0;
  const col = spriteIndex % 5;
  const row = Math.floor(spriteIndex / 5);
  const scale = size / CELL_W;

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${bedgesImg})`,
        backgroundSize: `${Math.round(SHEET_W * scale)}px ${Math.round(SHEET_W * scale)}px`,
        backgroundPosition: `-${Math.round(col * STRIDE * scale)}px -${Math.round(row * STRIDE * scale)}px`,
        backgroundRepeat: "no-repeat",
        filter: grayscale ? "grayscale(100%) brightness(0.7)" : "none",
        ...style,
      }}
    />
  );
}
