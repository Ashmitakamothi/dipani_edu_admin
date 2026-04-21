
import React from "react";

interface ManualPaymentFormProps {
  open: boolean;
  onClose: () => void;
  planId: string;
  onSubmit: (data: { transactionId: string }) => void;
}

// Set your UPI ID here
const UPI_ID = "your-upi-id@bank";

const ManualPaymentForm: React.FC<ManualPaymentFormProps> = ({ open, onClose, planId, onSubmit }) => {
  const [transactionId, setTransactionId] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      onSubmit({ transactionId });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit payment details.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manual Payment</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Scan QR, pay via UPI, then submit transaction ID.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/40">
            <div className="flex flex-col items-center gap-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=Dipani%20Education&cu=INR`)}`}
                alt="Scan QR"
                className="h-40 w-40 rounded-lg border border-gray-200 bg-white p-2 object-contain dark:border-gray-700"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Scan QR To Pay</span>
            </div>
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">UPI ID</div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-brand-600 dark:text-brand-400">{UPI_ID}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID</label>
            <input
              type="text"
              placeholder="Enter UPI transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-brand-900"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Plan ID: {planId || "N/A"}</p>
          </div>

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">{error}</div>}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting || !transactionId.trim()}
            >
              {submitting ? "Submitting..." : "Submit Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualPaymentForm;
