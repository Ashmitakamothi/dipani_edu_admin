import React, { useEffect, useState } from "react";
import ManualPaymentForm from "../components/ManualPaymentForm";
// Simple modal component for payment options
const PaymentOptionModal: React.FC<{ open: boolean; onClose: () => void; onSelect: (method: string) => void; }> = ({ open, onClose, onSelect }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
        <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>
        <div className="flex flex-col gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => onSelect('manual')}>Manual Payment</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => onSelect('cashfree')}>Cashfree</button>
        </div>
        <button className="mt-4 text-gray-500 hover:text-gray-700" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};
import axiosInstance from "../services/axiosConfig";

interface SubscriptionPlan {
  _id?: string;
  name: string;
  duration: number;
  durationType: string;
  price: number;
  status: string;
}

interface PartnerMyPlan {
  subscription?: {
    planId?: string;
    transactionId?: string;
    amount?: number;
    method?: string;
    status?: string;
    paidAt?: string | null;
  };
  plan?: {
    _id?: string;
    title?: string;
    amount?: number;
    month?: number;
    day?: number;
    year?: number;
    createdAt?: string;
  };
  isValid?: boolean;
  remainingDays?: number;
}

const API_URL = "/subscription-plans";

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SubscriptionPlan>({
    name: "",
    duration: 1,
    durationType: "month",
    price: 0,
    status: "active",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);


  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(API_URL);
      // Ensure plans is always an array
      let plansData = res.data;
      if (!Array.isArray(plansData)) {
        // Try to extract array from common API response shapes
        if (plansData && Array.isArray(plansData.data)) {
          plansData = plansData.data;
        } else if (plansData && Array.isArray(plansData.plans)) {
          plansData = plansData.plans;
        } else {
          plansData = [];
        }
      }
      // Normalize plans to expected format for card display
      const normalized = plansData.map((plan: any) => {
        if (typeof plan === 'object' && plan !== null) {
          // If legacy format (title/amount/month/year/day)
          if (plan.title && plan.amount !== undefined) {
            let duration = plan.month || plan.year || plan.day || 0;
            let durationType = plan.month ? 'month' : plan.year ? 'year' : plan.day ? 'day' : 'month';
            return {
              _id: plan._id,
              name: plan.title,
              price: plan.amount,
              duration,
              durationType,
              status: plan.status || 'active',
            };
          }
          // If new format (name/price/duration/durationType)
          return {
            _id: plan._id,
            name: plan.name || plan.title || '',
            price: plan.price !== undefined ? plan.price : plan.amount || 0,
            duration: plan.duration !== undefined ? plan.duration : plan.month || plan.year || plan.day || 0,
            durationType: plan.durationType || (plan.month ? 'month' : plan.year ? 'year' : plan.day ? 'day' : 'month'),
            status: plan.status || 'active',
          };
        }
        return plan;
      });
      setPlans(normalized);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await axiosInstance.put(`${API_URL}/${editingId}`, form);
      } else {
        await axiosInstance.post(API_URL, form);
      }
      setShowForm(false);
      setForm({ name: "", duration: 1, durationType: "month", price: 0, status: "active" });
      setEditingId(null);
      fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setForm(plan);
    setEditingId(plan._id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`${API_URL}/${id}`);
      fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get user role from localStorage
  let userRole = null;
  try {
    userRole = localStorage.getItem("role");
    if (!userRole) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        userRole = parsed?.role;
      }
    }
    userRole = userRole ? String(userRole).trim().toLowerCase() : null;
  } catch {}

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [cashfreeLoading, setCashfreeLoading] = useState(false);
  const [cashfreeError, setCashfreeError] = useState<string | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [myPlan, setMyPlan] = useState<PartnerMyPlan | null>(null);
  const [myPlanLoading, setMyPlanLoading] = useState(false);
  const [myPlanError, setMyPlanError] = useState<string | null>(null);

  const fetchMyPlan = async () => {
    setMyPlanLoading(true);
    setMyPlanError(null);
    try {
      const res = await axiosInstance.get("/subscription-purchase/my-plan");
      const payload = res.data?.data || null;
      setMyPlan(payload);
    } catch (err: any) {
      setMyPlanError(err.response?.data?.message || err.message || "Failed to load plan details");
      setMyPlan(null);
    } finally {
      setMyPlanLoading(false);
    }
  };

  const handleCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSelect = (method: string) => {
    setShowPaymentModal(false);
    if (method === 'manual') {
      setShowManualForm(true);
    } else if (method === 'cashfree') {
      if (!selectedPlan?._id) {
        alert('No plan selected for payment');
        return;
      }
      void handleCashfree(selectedPlan._id);
    }
  };

  const handleCashfree = async (planId: string) => {
    setCashfreeLoading(true);
    setCashfreeError(null);
    try {
      const url = '/subscription-purchase/cashfree';
      const payload = { planId };
      const res = await axiosInstance.post(url, payload);
      const data = res.data || {};

      // Try common response shapes for a redirect/payment url
      const possibleUrls = [
        data.paymentLink,
        data.payment_url,
        data.paymentUrl,
        data.redirectUrl,
        data.redirect_url,
        data.data?.paymentLink,
        data.data?.payment_url,
        data.data?.paymentUrl,
        data.data?.redirectUrl,
        data.data?.redirect_url,
      ];
      const found = possibleUrls.find((v) => typeof v === 'string' && v);
      if (found) {
        window.open(found as string, '_blank');
        // Instantly refresh my plan after initiating payment
        if (userRole === 'partner') fetchMyPlan();
        return;
      }

      // If backend returns an order or checkout object, open generic checkout path if present
      if (data.data && typeof data.data === 'object') {
        const obj = data.data;
        if (obj.url) window.open(obj.url, '_blank');
        else if (obj.checkoutUrl) window.open(obj.checkoutUrl, '_blank');
        else alert('Cashfree initiated. Please follow instructions.');
        if (userRole === 'partner') fetchMyPlan();
        return;
      }

      // Fallback: notify success
      alert('Cashfree initiated. Check your account or notifications for next steps.');
      if (userRole === 'partner') fetchMyPlan();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Cashfree initiation failed';
      setCashfreeError(msg);
      alert(msg);
    } finally {
      setCashfreeLoading(false);
    }
  };

  // Manual payment submit handler
  const handleManualPayment = async ({ transactionId }: { transactionId: string }) => {
    setManualLoading(true);
    setManualError(null);
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const url = "/subscription-purchase/manual";
      const payload = {
        planId: selectedPlan?._id,
        transactionId,
      };
      await axiosInstance.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setShowManualForm(false);
      alert("Manual payment request submitted!");
      if (userRole === "partner") {
        fetchMyPlan();
      }
    } catch (err: any) {
      setManualError(err.response?.data?.message || err.message);
    } finally {
      setManualLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "partner") {
      fetchMyPlan();
    }
  }, [userRole]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>

      {userRole === "partner" && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">My Subscription</p>
              <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {myPlanLoading ? "Loading your plan..." : myPlan?.plan?.title || "No active plan"}
              </h3>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                myPlan?.isValid
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {myPlan?.subscription?.status || "inactive"}
            </span>
          </div>

          {myPlanError && <p className="mt-3 text-sm text-red-600">{myPlanError}</p>}

          {!myPlanLoading && !myPlanError && myPlan && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/40">
                <p className="text-xs text-gray-500">Amount Paid</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">₹{myPlan.subscription?.amount ?? myPlan.plan?.amount ?? 0}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/40">
                <p className="text-xs text-gray-500">Validity</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {myPlan.isValid ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/40">
                <p className="text-xs text-gray-500">Remaining Days</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {myPlan.remainingDays ?? 0}
                </p>
              </div>
            </div>
          )}

          {!myPlanLoading && !myPlanError && myPlan?.subscription?.transactionId && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
              Transaction ID: <span className="font-semibold">{myPlan.subscription.transactionId}</span>
            </div>
          )}
        </div>
      )}

      {/* Only show Add button and form for non-partner roles */}
      {userRole !== 'partner' && (
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            setShowForm(true);
            setForm({ name: "", duration: 1, durationType: "month", price: 0, status: "active" });
            setEditingId(null);
          }}
        >
          Add New Plan
        </button>
      )}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {/* Only show form for non-partner roles */}
      {showForm && userRole !== 'partner' && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded shadow">
          {/* ...existing form fields... */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Plan Name"
              className="border rounded px-2 py-2"
              required
            />
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleInputChange}
              placeholder="Price"
              className="border rounded px-2 py-2"
              required
            />
            <input
              name="duration"
              type="number"
              value={form.duration}
              onChange={handleInputChange}
              placeholder="Duration"
              className="border rounded px-2 py-2"
              required
            />
            <select
              name="durationType"
              value={form.durationType}
              onChange={handleInputChange}
              className="border rounded px-2 py-2"
              required
            >
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="day">Day</option>
            </select>
            <select
              name="status"
              value={form.status}
              onChange={handleInputChange}
              className="border rounded px-2 py-2"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={loading}
            >
              {editingId ? "Update" : "Create"} Plan
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {/* Pricing Cards Layout */}
      <div className="flex flex-col gap-4 mt-8">
        {plans.length === 0 && !loading && (
          <div className="text-center text-gray-500">No subscription plans found.</div>
        )}
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`flex items-center justify-between bg-white border rounded-lg shadow-sm px-6 py-4 ${plan.status !== 'active' ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-6">
              <div className="text-lg font-semibold text-gray-800 min-w-[120px]">{plan.name}</div>
              <div className="text-xl font-bold text-blue-700 min-w-[80px]">₹{plan.price}</div>
              <div className="text-gray-600 min-w-[100px]">{plan.duration} {plan.durationType}{plan.duration > 1 ? 's' : ''}</div>
              <span className={`text-xs px-2 py-1 rounded ${plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{plan.status}</span>
            </div>
            <div className="flex gap-2">
              {/* For partners, show only checkout button. For others, show edit/delete */}
              {userRole === 'partner' ? (
                <button
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  onClick={() => handleCheckout(plan)}
                >
                  Checkout
                </button>
              ) : (
                <>
                  <button
                    className="px-4 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-sm"
                    onClick={() => handleEdit(plan)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    onClick={() => plan._id && handleDelete(plan._id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Payment Option Modal for partners */}
      <PaymentOptionModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelect={handlePaymentSelect}
      />
      {/* Manual Payment Form Modal */}
      <ManualPaymentForm
        open={showManualForm}
        onClose={() => setShowManualForm(false)}
        planId={selectedPlan?._id || ""}
        onSubmit={handleManualPayment}
      />
      {manualLoading && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"><div className="bg-white p-6 rounded shadow">Submitting manual payment...</div></div>}
      {manualError && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"><div className="bg-white p-6 rounded shadow text-red-600">{manualError}</div></div>}
    </div>
  );
};

export default SubscriptionPlans;
