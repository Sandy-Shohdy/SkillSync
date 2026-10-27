import { useState } from "react";
import type { PublicFreelancer } from "../lib/api";
import { formatMoney } from "../lib/bookingDisplay";

interface BookingCardProps {
  freelancer: PublicFreelancer;
  onClose: () => void;
  onConfirm: (booking: {
    date: string;
    time: string;
    hours: number;
    notes: string;
  }) => Promise<void>;
}

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const HOUR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function BookingCard({
  freelancer,
  onClose,
  onConfirm,
}: BookingCardProps) {
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState<string | null>(null);
  const [hours, setHours] = useState(1);
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const rate = freelancer.pricePerHour;
  const total = rate != null ? rate * hours * 100 : null;

  const handleConfirm = async () => {
    if (!time || total == null) return;
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm({ date, time, hours, notes: notes.trim() });
      setConfirmed(true);
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
        className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmed ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-2xl">
              ✅
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Booking requested
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              {freelancer.fullName} on {date} at {time} for {hours} h
            </p>
            {total != null && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                You'll pay {formatMoney(total)} once {freelancer.fullName}{" "}
                accepts. The money is held safely until you confirm the job is
                done.
              </p>
            )}
            {notes && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 italic">
                "{notes}"
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-6 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Book {freelancer.fullName}
                </h2>
                {freelancer.pricePerHour != null && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    SEK {freelancer.pricePerHour} per hour
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <label className="block mt-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date
              </span>
              <input
                type="date"
                value={date}
                min={todayISO()}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTime(null);
                }}
                className="mt-1.5 w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Time
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`py-2 rounded-lg text-sm font-medium border transition ${
                      time === slot
                        ? "bg-amber-500 border-amber-500 text-gray-900"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-700"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <label className="block mt-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hours
              </span>
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="mt-1.5 w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h} {h === 1 ? "hour" : "hours"}
                  </option>
                ))}
              </select>
            </label>

            <label className="block mt-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Details <span className="text-gray-400 font-normal">(optional)</span>
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the freelancer should know — e.g. what needs fixing, access instructions..."
                rows={3}
                maxLength={1000}
                className="mt-1.5 w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            {total != null ? (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You pay through SkillSync after the freelancer accepts. The
                  money is held until you confirm the job is done, and you're
                  refunded if you cancel before then.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                This freelancer hasn't set an hourly rate yet, so they can't be
                booked online. Request a call back instead.
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center mt-4">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={!time || total == null || submitting}
              onClick={handleConfirm}
              className="w-full mt-6 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Booking..." : "Confirm booking"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
