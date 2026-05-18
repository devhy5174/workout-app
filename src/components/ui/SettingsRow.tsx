type Props = {
  icon: React.ReactNode;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
};

export default function SettingsRow({
  icon,
  label,
  description,
  right,
  onClick,
  danger,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 text-left transition disabled:cursor-default ${
        onClick ? "hover:bg-gray-50 active:bg-gray-100" : ""
      }`}
    >
      <span className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-gray-400">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold ${danger ? "text-red-500" : "text-gray-700"}`}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      {right !== undefined ? (
        right
      ) : onClick ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-300 flex-shrink-0"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      ) : null}
    </button>
  );
}
