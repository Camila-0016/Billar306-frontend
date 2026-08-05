export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-marfil w-full max-w-[480px] rounded-t-2xl max-h-[85vh] overflow-y-auto pb-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-fieltro text-marfil px-4 py-3.5 flex justify-between items-center font-bold border-b-4 border-dorado sticky top-0 z-10">
          <span>{title}</span>
          <button
            className="bg-transparent border-none text-marfil text-base cursor-pointer hover:opacity-80"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}