import { useState } from "react";
import type { PublicFreelancer } from "../lib/api";

interface BookingCardProps {
  freelancer: PublicFreelancer;
  onClose: () => void;
  onConfirm: (booking: { date: string; time: string }) => void;
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
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!time) return;
    onConfirm({ date, time });
    setConfirmed(true);
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
              {freelancer.fullName} on {date} at {time}
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

            <button
              type="button"
              disabled={!time}
              onClick={handleConfirm}
              className="w-full mt-6 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm booking
            </button>
          </>
        )}
      </div>
    </div>
  );
}
