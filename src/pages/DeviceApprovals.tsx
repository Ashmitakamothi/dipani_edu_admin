import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDeviceApprovals,
  updateDeviceApproval,
} from "../store/slices/deviceApprovals";
import {
   CheckCircle,
   XCircle,
   RotateCcw,
   Smartphone,
   User2,
   KeyRound,
  AlertCircle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Types for better type safety
interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface DeviceInfo {
  deviceName?: string;
  platform?: string;
  ipAddress?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
}

interface DeviceRequest {
  _id: string;
  userId?: User;
  user?: User;
  deviceId: string;
  deviceInfo: DeviceInfo;
  status: "pending" | "approved" | "rejected";
  isFirstDevice: boolean;
  isActive: boolean;
  requestedAt: string;
  rejectionReason?: string;
  approvedBy?: string;
  rejectedBy?: string;
  processedAt?: string;
}

interface DeviceApprovalsState {
  requests: DeviceRequest[];
  loading: boolean;
  error: string | null;
}

export default function DeviceApprovals() {
  const dispatch = useDispatch();
  const { requests, loading, error, pagination } = useSelector(
    (state: any) => state.deviceApprovals
  ) as DeviceApprovalsState & { pagination: any };

  // Modal state for rejection
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error state for individual actions
  const [actionErrors, setActionErrors] = useState<{ [id: string]: string }>({});

  // Success notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  // Add status filter state
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Add per-row loading state
  const [rowLoading, setRowLoading] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    dispatch(fetchDeviceApprovals({ page, limit, status: statusFilter || undefined }) as any);
  }, [dispatch, page, limit, statusFilter]);

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const clearActionError = useCallback((id: string) => {
    setActionErrors(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    if (status === "rejected") {
      setRejectId(id);
      setRejectReason("");
      setShowRejectModal(true);
      return;
    }

    try {
      clearActionError(id);
      setRowLoading(prev => ({ ...prev, [id]: true }));
      
      // Dispatch the action and wait for it to complete
      const result = await dispatch(updateDeviceApproval({ id, status }) as any);
      
      // Check if the action was successful
      if (result.type.endsWith('/fulfilled')) {
        setSuccessMessage("Device request approved successfully!");
        // Refresh the data to get the latest state
        dispatch(fetchDeviceApprovals({ page, limit }) as any);
      } else if (result.type.endsWith('/rejected')) {
        throw new Error(result.payload || "Failed to approve device request");
      }
      
    } catch (err: any) {
      setActionErrors(prev => ({
        ...prev,
        [id]: err.message || "Failed to approve device request"
      }));
    } finally {
      setRowLoading(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rejectId || !rejectReason.trim()) return;

    setIsSubmitting(true);
    setRowLoading(prev => ({ ...prev, [rejectId!]: true }));

    try {
      clearActionError(rejectId!);
      
      // Dispatch the action and wait for it to complete
      const result = await dispatch(
        updateDeviceApproval({
          id: rejectId!,
          status: "rejected",
          rejectionReason: rejectReason.trim()
        }) as any
      );
      
      // Check if the action was successful
      if (result.type.endsWith('/fulfilled')) {
        setSuccessMessage("Device request rejected successfully!");
        setShowRejectModal(false);
        setRejectId(null);
        setRejectReason("");
        // Refresh the data to get the latest state
        dispatch(fetchDeviceApprovals({ page, limit }) as any);
      } else if (result.type.endsWith('/rejected')) {
        throw new Error(result.payload || "Failed to reject device request");
      }
      
    } catch (err: any) {
      setActionErrors(prev => ({
        ...prev,
        [rejectId!]: err.message || "Failed to reject device request"
      }));
    } finally {
      setIsSubmitting(false);
      setRowLoading(prev => {
        const { [rejectId!]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleRejectCancel = () => {
    if (isSubmitting) return;
    
    setShowRejectModal(false);
    setRejectId(null);
    setRejectReason("");
  };

  const handleRefresh = async () => {
    setActionErrors({});
    setSuccessMessage(null);
    setStatusFilter(""); // Reset filter on refresh
    dispatch(fetchDeviceApprovals({ page, limit }) as any);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Add reset filters function
  const handleResetFilters = () => {
    setStatusFilter("");
    setPage(1);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination?.totalPages || 1;
    const current = page;
    const maxPages = 5;
    const start = Math.max(1, current - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);
    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);
    return pages;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && !isSubmitting && handleRejectCancel()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
            <h2 
              id="reject-modal-title"
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center"
            >
              <XCircle className="w-5 h-5 mr-2 text-red-500" />
              Reject Device Request
            </h2>
            
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="reject-reason"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Reason for rejection *
                </label>
                <textarea
                  id="reject-reason"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  required
                  autoFocus
                  disabled={isSubmitting}
                  placeholder="Please provide a clear reason for rejection..."
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {rejectReason.length}/500 characters
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRejectCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={!rejectReason.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Reject Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Device Approval Requests
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage device access requests from users
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm dark:text-gray-300">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm dark:text-gray-300">Show:</span>
            <select
              value={limit}
              onChange={e => handleLimitChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading device requests...</p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No device requests found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Device approval requests will appear here when users request access.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Device Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Network
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Device ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Flags
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Requested
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                {requests.map((req: DeviceRequest, idx: number) => {
                  const user = req.userId || req.user;
                  const deviceInfo = req.deviceInfo || {};
                  const hasActionError = actionErrors[req._id];

                  return (
                    <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {(pagination?.page - 1) * (pagination?.limit || 10) + idx + 1}
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <User2 className="w-8 h-8 p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user?.fullName || 'Unknown User'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                            <Smartphone className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {deviceInfo.deviceName || ' - '}
                            </span>
                          </div>
                          {deviceInfo.platform && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {deviceInfo.platform}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-xs text-gray-700 dark:text-gray-300">
                        <div className="space-y-1">
                          <div>{deviceInfo.ipAddress || 'Unknown IP'}</div>
                          {deviceInfo.browser && (
                            <div className="text-gray-500 dark:text-gray-400">
                              {deviceInfo.browser}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-xs">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono">
                            {req.deviceId ? req.deviceId.substring(0, 8) + '...' : 'N/A'}
                          </code>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          {req.isFirstDevice && (
                            <span className="inline-block px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              First Device
                            </span>
                          )}
                          {req.isActive && (
                            <span className="inline-block px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        {getStatusBadge(req.status)}
                        {req.rejectionReason && req.status === "rejected" && (
                          <div className="mt-1 text-xs text-red-600 dark:text-red-400" title={req.rejectionReason}>
                            Reason: {req.rejectionReason.length > 30
                              ? `${req.rejectionReason.substring(0, 30)}...`
                              : req.rejectionReason
                            }
                          </div>
                        )}
                      </td>
                      
                      <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(req.requestedAt)}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-right">
                        {hasActionError && (
                          <div className="mb-2 text-xs text-red-600 dark:text-red-400">
                            {hasActionError}
                          </div>
                        )}
                        
                        {req.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              className="px-3 py-1.5 text-xs rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                              onClick={() => handleAction(req._id, "approved")}
                              disabled={!!rowLoading[req._id]}
                            >
                              {rowLoading[req._id] ? (
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              Approve
                            </button>
                            <button
                              className="px-3 py-1.5 text-xs rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                              onClick={() => handleAction(req._id, "rejected")}
                              disabled={!!rowLoading[req._id]}
                            >
                              {rowLoading[req._id] ? (
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Pagination */}
            {pagination?.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                  of {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {generatePageNumbers().map((p, idx) =>
                    typeof p === "number" ? (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(p)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          page === p
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span
                        key={idx}
                        className="px-2 text-gray-400 dark:text-gray-500"
                      >
                        {p}
                      </span>
                    )
                  )}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === (pagination?.totalPages || 1)}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}