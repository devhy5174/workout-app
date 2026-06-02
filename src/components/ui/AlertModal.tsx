import type { ComponentType, ReactNode } from "react";

interface AlertModalProps {
  icon?: ComponentType<{ className?: string }>;
  iconClass?: string;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  zClass?: string;
}

export default function AlertModal({
  icon: Icon,
  iconClass = "text-primary",
  title,
  message,
  confirmLabel = "확인",
  onConfirm,
  cancelLabel = "취소",
  onCancel,
  zClass = "z-50",
}: AlertModalProps) {
  return (
    <div
      className={`fixed inset-0 bg-black/40 ${zClass} flex items-center justify-center px-6`}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl p-7 flex flex-col items-center gap-4 shadow-xl">
        {Icon && <Icon className={`text-5xl ${iconClass}`} />}
        <p className="font-extrabold text-gray-800 text-lg text-center">
          {title}
        </p>
        <div className="text-sm text-gray-400 text-center leading-relaxed">
          {message}
        </div>
        {onCancel ? (
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-2xl bg-gray-100 text-sm font-bold text-gray-500 active:scale-95 transition"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-extrabold active:scale-95 transition shadow-sm"
            >
              {confirmLabel}
            </button>
          </div>
        ) : (
          <button
            onClick={onConfirm}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-extrabold active:scale-95 transition shadow-sm"
          >
            {confirmLabel}
          </button>
        )}
      </div>
    </div>
  );
}
