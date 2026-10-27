import { useState, type FormEvent } from "react";

interface ReportProblemModalProps {
  freelancerName: string;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

export default function ReportProblemModal({
  freelancerName,
  onClose,
  onSubmit,
}: ReportProblemModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={submitting ? undefined : onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Report a problem
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Your payment stays on hold, and {freelancerName} will see what you
          write. They get extra time to fix the problem or refund you. If it
          isn't resolved by the new deadline shown on your booking, the
          payment goes to {freelancerName}.
        </p>

        <label className="block mt-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            What went wrong?
          </span>
          <textarea
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1.5 w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </label>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center mt-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending..." : "Report problem"}
        </button>
      </form>
    </div>
  );
}
