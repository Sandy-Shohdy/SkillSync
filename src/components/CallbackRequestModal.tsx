import { useState } from "react";
import type { PublicFreelancer } from "../lib/api";

interface CallbackRequestModalProps {
  freelancer: PublicFreelancer;
  initialPhone?: string;
  onClose: () => void;
  onConfirm: (data: { phone: string; notes?: string }) => Promise<void>;
}

export default function CallbackRequestModal({
  freelancer,
  initialPhone,
  onClose,
  onConfirm,
}: CallbackRequestModalProps) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!phone.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm({ phone: phone.trim(), notes: notes.trim() || undefined });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6"
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

        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-xl">
              ✅
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              They'll call you back
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {freelancer.fullName} will call {phone}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-5 py-2 rounded-xl bg-amber-500 text-gray-900 font-semibold text-sm hover:bg-amber-600 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-base font-bold text-gray-900 dark:text-white pr-6">
              Call me back
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {freelancer.fullName} will call you — no need to pick a time.
            </p>

            <label className="block mt-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 070 123 45 67"
                className="mt-1.5 w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block mt-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Note <span className="text-gray-400 font-normal">(optional)</span>
              </span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What do you need?"
                maxLength={200}
                className="mt-1.5 w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center mt-3">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={!phone.trim() || submitting}
              onClick={handleSubmit}
              className="w-full mt-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : "Request Call Back"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
