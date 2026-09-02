interface FreelancerBookingBlockedModalProps {
  onClose: () => void;
}

export default function FreelancerBookingBlockedModal({
  onClose,
}: FreelancerBookingBlockedModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
        >
          &times;
        </button>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
          Freelancer accounts can't book services
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Booking is only available for customer accounts. Sign in with a
          customer account to book a service.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
