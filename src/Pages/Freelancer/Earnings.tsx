import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import AccessNotice from "../../components/AccessNotice";
import { useAuth } from "../../context/AuthContext";
import { getEarnings, type Earnings as EarningsData } from "../../lib/api";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
  formatBookingDate,
  formatMoney,
} from "../../lib/bookingDisplay";

export default function Earnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "freelancer") return;
    let cancelled = false;
    getEarnings(user.token)
      .then((data) => {
        if (!cancelled) setEarnings(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load earnings",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <AccessNotice
        title="Sign in to view your earnings"
        message="You need a freelancer account to access this page."
        action="auth"
      />
    );
  }

  if (user.role !== "freelancer") {
    return (
      <AccessNotice
        title="This page is for freelancers"
        message="Your account is set up as a customer."
        action="profile"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
      <SideRail />
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Earnings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Customers pay through SkillSync. Each payment is held until the
          customer confirms the job is done.
          {earnings &&
            ` A ${earnings.feePercent}% platform fee is deducted from each payment.`}
        </p>

        {error ? (
          <p className="text-center text-red-600 dark:text-red-400 py-16">
            {error}
          </p>
        ) : earnings === null ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">
            Loading earnings...
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Paid out
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatMoney(earnings.released, earnings.currency)}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Held until jobs are done
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatMoney(earnings.held, earnings.currency)}
                </p>
              </div>
            </div>

            {earnings.payments.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-16">
                No payments yet.
              </p>
            ) : (
              <div className="space-y-3">
                {earnings.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-gray-900 dark:text-white font-semibold">
                          {payment.customerName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PAYMENT_STATUS_STYLES[payment.status]}`}
                        >
                          {PAYMENT_STATUS_LABELS[payment.status]}
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {[
                          formatBookingDate(payment.bookingDate),
                          payment.bookingTime,
                          payment.hours != null ? `${payment.hours} h` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {formatMoney(payment.freelancerAmount, payment.currency)}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs">
                        {formatMoney(payment.amount, payment.currency)} −{" "}
                        {formatMoney(payment.platformFee, payment.currency)} fee
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
