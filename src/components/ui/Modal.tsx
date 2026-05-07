interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function Modal({ isOpen, title, message, onConfirm, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-xl p-6 mx-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-extrabold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-sm active:scale-95 transition-all"
            aria-label="확인"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
