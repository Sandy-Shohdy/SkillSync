import { useState, type FormEvent } from "react";
import type { PayBookingPayload } from "../lib/api";
import { formatMoney } from "../lib/bookingDisplay";

interface PaymentModalProps {
  amount: number;
  currency: string;
  freelancerName: string;
  onClose: () => void;
  onPay: (payload: PayBookingPayload) => Promise<void>;
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

const inputClass =
  "mt-1.5 w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500";

export default function PaymentModal({
  amount,
  currency,
  freelancerName,
  onClose,
  onPay,
}: PaymentModalProps) {
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paid, setPaid] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onPay({ cardholderName: cardholderName.trim(), cardNumber, expiry, cvc });
      setPaid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={submitting ? undefined : onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {paid ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-2xl">
              🔒
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Payment successful
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              {formatMoney(amount, currency)} is held by SkillSync. It goes to{" "}
              {freelancerName} once you confirm the job is done.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-6 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Pay {freelancerName}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatMoney(amount, currency)}, held until the job is done
                </p>
              </div>
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

            <p className="mt-4 text-xs rounded-lg px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
              Test mode: no real money is charged. Use card 4242 4242 4242
              4242 with any future expiry date and any CVC.
            </p>

            <label className="block mt-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Name on card
              </span>
              <input
                required
                minLength={2}
                autoComplete="cc-name"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block mt-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Card number
              </span>
              <input
                required
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 1234 1234 1234"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className={inputClass}
              />
            </label>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expiry
                </span>
                <input
                  required
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  pattern="(0[1-9]|1[0-2])/\d{2}"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  CVC
                </span>
                <input
                  required
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  pattern="\d{3,4}"
                  value={cvc}
                  onChange={(e) =>
                    setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className={inputClass}
                />
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center mt-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Processing..." : `Pay ${formatMoney(amount, currency)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
