// 섹션 헤더 라벨

export function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-bold text-gray-400 px-1 mt-2 mb-1">{label}</p>
  );
}
