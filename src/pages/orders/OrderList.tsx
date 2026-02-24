import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosConfig";
import {
    ShoppingCart,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Search,
    Filter,
    User,
    Mail,
    Phone,
    Copy,
    ExternalLink
} from "lucide-react";

interface Order {
    _id: string;
    orderNo: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
        phone?: string;
    };
    items: Array<{
        type: string;
        pricePaid: any;
        courseId?: any;
    }>;
    grandTotal: any;
    payment: {
        provider: string;
        status: string;
        paymentIntent?: string;
    };
    createdAt: string;
}

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [providerFilter, setProviderFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/orders", {
                params: {
                    status: statusFilter || undefined,
                    provider: providerFilter || undefined
                }
            });
            setOrders(response.data.orders);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, providerFilter]);

    const handleApprove = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to approve this order? This will enroll the student.")) return;

        try {
            setApprovingId(orderId);
            await axiosInstance.post(`/orders/${orderId}/approve`);
            alert("Order approved successfully!");
            fetchOrders();
        } catch (error: any) {
            console.error("Approval failed", error);
            alert(error.response?.data?.message || "Approval failed. Check console for details.");
        } finally {
            setApprovingId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
    };

    const filteredOrders = orders.filter(order => {
        const oNo = order.orderNo?.toLowerCase() || "";
        const uName = order.userId?.fullName?.toLowerCase() || "";
        const uEmail = order.userId?.email?.toLowerCase() || "";
        const sTerm = searchTerm.toLowerCase();

        return oNo.includes(sTerm) || uName.includes(sTerm) || uEmail.includes(sTerm);
    });

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="text-brand-500" />
                        Order Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage and verify student payments</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none w-64 text-sm"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                    </select>

                    <select
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="">All Providers</option>
                        <option value="manual">Manual (QR Code)</option>
                        <option value="razorpay">Razorpay</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order / Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount / Provider</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">#{order.orderNo}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                                                {order.userId?.fullName?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{order.userId?.fullName}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail size={12} /> {order.userId?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">₹{order.grandTotal?.$numberDecimal || order.grandTotal || 0}</div>
                                        <div className={`text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full uppercase font-bold ${order.payment.provider === 'manual' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.payment.provider}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.payment.paymentIntent ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                    {order.payment.paymentIntent}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(order.payment.paymentIntent || "")}
                                                    className="text-gray-400 hover:text-brand-500"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">None</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${order.payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            order.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {order.payment.status === 'paid' ? <CheckCircle size={14} /> :
                                                order.payment.status === 'pending' ? <Clock size={14} /> :
                                                    <XCircle size={14} />}
                                            <span className="capitalize">{order.payment.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {order.payment.provider === 'manual' && order.payment.status === 'pending' && (
                                            <button
                                                onClick={() => handleApprove(order._id)}
                                                disabled={approvingId === order._id}
                                                className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {approvingId === order._id ? "Approving..." : "Approve"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && (
                        <div className="py-20 text-center">
                            <ShoppingCart size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderList;
