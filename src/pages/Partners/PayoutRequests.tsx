import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    CheckCircle, 
    XCircle, 
    MoreHorizontal, 
    Search, 
    Filter,
    Calendar,
    User,
    Banknote,
    ExternalLink,
    AlertCircle,
    Info
} from 'lucide-react';
import { fetchPayoutRequests, updatePayoutStatus } from '../../store/slices/partners';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import toast from 'react-hot-toast';

const PayoutRequests = () => {
    const dispatch = useDispatch();
    const { payoutRequests, loading } = useSelector((state: any) => state.partners);
    const [statusFilter, setStatusFilter] = useState('pending');
    
    // Modal states
    const [selectedPayout, setSelectedPayout] = useState<any>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        dispatch(fetchPayoutRequests(statusFilter === 'all' ? undefined : statusFilter));
    }, [dispatch, statusFilter]);

    const handleApprove = async () => {
        if (!transactionId) {
            toast.error('Transaction ID is required');
            return;
        }
        try {
            await dispatch(updatePayoutStatus({
                id: selectedPayout._id,
                status: 'completed',
                transactionId,
                adminNotes
            })).unwrap();
            toast.success('Payout approved successfully');
            setShowApproveModal(false);
            setTransactionId('');
            setAdminNotes('');
        } catch (err: any) {
            toast.error(err || 'Failed to approve payout');
        }
    };

    const handleReject = async () => {
        if (!adminNotes) {
            toast.error('Reason for rejection is required');
            return;
        }
        try {
            await dispatch(updatePayoutStatus({
                id: selectedPayout._id,
                status: 'rejected',
                adminNotes
            })).unwrap();
            toast.success('Payout rejected');
            setShowRejectModal(false);
            setAdminNotes('');
        } catch (err: any) {
            toast.error(err || 'Failed to reject payout');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full flex items-center gap-1 w-fit"><CheckCircle size={12}/> Completed</span>;
            case 'pending': return <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full flex items-center gap-1 w-fit"><AlertCircle size={12}/> Pending</span>;
            case 'rejected': return <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full flex items-center gap-1 w-fit"><XCircle size={12}/> Rejected</span>;
            default: return null;
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <PageBreadcrumb pageTitle="Partner Payout Requests" />

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['pending', 'completed', 'rejected', 'all'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${statusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Partner</th>
                                <th className="px-6 py-4">Request Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Bank Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading payout requests...</td>
                                </tr>
                            ) : payoutRequests?.length > 0 ? (
                                payoutRequests.map((payout: any) => (
                                    <tr key={payout._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {payout.partnerId?.fullName?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{payout.partnerId?.fullName}</p>
                                                    <p className="text-xs text-gray-500">{payout.partnerId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar size={14} />
                                                {new Date(payout.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 text-base">
                                            ₹{payout.amount?.$numberDecimal || payout.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs space-y-1">
                                                <p><span className="text-gray-400">Bank:</span> {payout.bankDetails?.bankName}</p>
                                                <p><span className="text-gray-400">A/C:</span> {payout.bankDetails?.accountNumber}</p>
                                                <p><span className="text-gray-400">IFSC:</span> {payout.bankDetails?.ifscCode}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(payout.status)}
                                            {payout.transactionId && (
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase">UTR: {payout.transactionId}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payout.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => { setSelectedPayout(payout); setShowApproveModal(true); }}
                                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => { setSelectedPayout(payout); setShowRejectModal(true); }}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-300">
                                            <Banknote size={48} />
                                            <p>No payout requests found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Approve Payout</h3>
                                    <p className="text-sm text-gray-500 mt-1">Manual payment to partner's bank account.</p>
                                </div>
                                <button onClick={() => setShowApproveModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><XCircle size={24}/></button>
                            </div>
                            
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Recipient Details</p>
                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                    <span className="text-gray-500">Holder:</span> <span className="text-gray-900 font-medium">{selectedPayout?.bankDetails?.accountHolderName}</span>
                                    <span className="text-gray-500">Bank:</span> <span className="text-gray-900 font-medium">{selectedPayout?.bankDetails?.bankName}</span>
                                    <span className="text-gray-500">A/C:</span> <span className="text-gray-900 font-medium">{selectedPayout?.bankDetails?.accountNumber}</span>
                                    <span className="text-gray-500">Amount:</span> <span className="text-blue-700 font-bold text-lg">₹{selectedPayout?.amount?.$numberDecimal || selectedPayout?.amount}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Transaction ID / UTR Number</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="e.g. 123456789012"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Note (Optional)</label>
                                    <textarea 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none placeholder:text-gray-300"
                                        placeholder="Note for the partner..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex gap-3">
                            <button onClick={() => setShowApproveModal(false)} className="flex-1 px-4 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
                            <button onClick={handleApprove} className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Mark as Paid</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
                        <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">Reject Request</h3>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason for Rejection</label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all h-32 resize-none"
                                    placeholder="Explain why the payout is rejected..."
                                    required
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                />
                                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><Info size={12}/> This note will be visible to the partner.</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex gap-3">
                            <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl">Back</button>
                            <button onClick={handleReject} className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200">Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayoutRequests;
