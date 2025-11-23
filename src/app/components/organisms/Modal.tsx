export type ModalProps = {
  open: boolean;
  submitText: string;
  closeText: string;
  title: string;
  body: string;
  onSubmit: () => void;
  onClose: () => void;
};

export function Modal({ open, onClose, submitText, closeText, onSubmit, title, body }: ModalProps) {
  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
        transition-opacity duration-200
        ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
    >
      <div
        className={`
          bg-white rounded-lg shadow-lg
          max-w-md w-full mx-4
          p-0
          text-center
          transform transition-transform duration-200
          ${open ? "scale-100 translate-y-0" : "scale-95 -translate-y-2"}
        `}
      >
        <div className="mb-3">
          <h3 className="text-lg font-semibold mb-1 bg-gray-100 px-3 py-3 rounded-t-lg">
            {title}
          </h3>
          <p className="text-sm text-gray-600 p-3 py-6">
            {body}
          </p>
        </div>

        <div className="flex flex-row-reverse gap-2 bg-gray-100 px-3 pb-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="mt-2 inline-flex items-center justify-center px-4 py-1 rounded-md bg-gray-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            {submitText}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="mt-2 inline-flex items-center justify-center px-4 py-1 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            {closeText}
          </button>
        </div>
      </div>
    </div>
  );
}
