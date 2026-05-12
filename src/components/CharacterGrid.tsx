import { avatarCharacters } from "../data/avatarCharacters";

type CharacterGridProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

export default function CharacterGrid({
  selectedId,
  onSelect,
  disabled = false,
}: CharacterGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {avatarCharacters.map((character) => {
        const selected = selectedId === character.id;
        return (
          <button
            key={character.id}
            type="button"
            onClick={() => onSelect(character.id)}
            disabled={disabled}
            className="relative aspect-square rounded-3xl border-2 bg-white p-2 shadow-sm transition-all active:scale-95 disabled:opacity-60"
            style={{
              borderColor: selected ? "var(--color-primary)" : "transparent",
              background: selected
                ? "var(--color-primary-light, #fff0ec)"
                : "white",
              boxShadow: selected
                ? "0 12px 28px rgba(255, 87, 51, 0.16)"
                : "0 4px 14px rgba(17, 24, 39, 0.06)",
            }}
            aria-label={`${character.id} 선택`}
          >
            <img
              src={character.image}
              alt=""
              className="w-full h-full object-contain rounded-2xl"
              draggable={false}
            />
            {selected && (
              <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-black text-white shadow-md">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
