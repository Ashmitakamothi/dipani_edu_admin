import React, { useEffect, useState } from "react";
import {
  fetchDeleteRequests,
  setSearchQuery,
  setFilters,
  resetFilters,
  updateDeleteRequestStatus,
} from "../../store/slices/deleteRequests";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Mail,
  FileText,
  Eye,
  X,
  Hash,
  UserCheck,
  Check,
  Ban,
  Edit,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { Link } from "react-router";

interface DeleteRequest {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: {
    _id: string;
    fullName: string;
  };
  additionalNotes?: string;
}

const DeleteRequestsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, loading, error, pagination, searchQuery, filters } =
    useAppSelector((state) => state.deleteRequests);

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(filters);
  const [selectedRequest, setSelectedRequest] = useState<DeleteRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionRequestId, setActionRequestId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        dispatch(setSearchQuery(searchInput));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, dispatch]);

  // Fetch delete requests when dependencies change
  useEffect(() => {
    const activeFilters: Record<string, any> = {};

    // Apply status filter
    if (localFilters.status) {
      activeFilters.status = localFilters.status;
    }

    // Apply date range filter
    if (localFilters.dateFrom) {
      activeFilters.dateFrom = localFilters.dateFrom;
    }
    if (localFilters.dateTo) {
      activeFilters.dateTo = localFilters.dateTo;
    }

    dispatch(
      fetchDeleteRequests({
        page: pagination.page,
        limit: pagination.limit,
        filters: activeFilters,
        searchFields: searchQuery ? { search: searchQuery } : {},
        sort: { requestedAt: "desc" },
      })
    );
  }, [dispatch, pagination.page, pagination.limit, searchQuery, localFilters]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      const activeFilters: Record<string, any> = {};
      if (localFilters.status) activeFilters.status = localFilters.status;
      if (localFilters.dateFrom) activeFilters.dateFrom = localFilters.dateFrom;
      if (localFilters.dateTo) activeFilters.dateTo = localFilters.dateTo;

      dispatch(
        fetchDeleteRequests({
          page: newPage,
          limit: pagination.limit,
          filters: activeFilters,
          searchFields: searchQuery ? { search: searchQuery } : {},
          sort: { requestedAt: "desc" },
        })
      );
    }
  };

  const handleLimitChange = (newLimit: number) => {
    const activeFilters: Record<string, any> = {};
    if (localFilters.status) activeFilters.status = localFilters.status;
    if (localFilters.dateFrom) activeFilters.dateFrom = localFilters.dateFrom;
    if (localFilters.dateTo) activeFilters.dateTo = localFilters.dateTo;

    dispatch(
      fetchDeleteRequests({
        page: 1,
        limit: newLimit,
        filters: activeFilters,
        searchFields: searchQuery ? { search: searchQuery } : {},
        sort: { requestedAt: "desc" },
      })
    );
  };

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    dispatch(setFilters(updated));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setLocalFilters({});
    dispatch(resetFilters());
  };

  const handleViewDetails = (request: DeleteRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const handleStatusAction = (requestId: string) => {
    setActionRequestId(requestId);
    setActionType('approve'); // Default to approve, user can change in modal
    setAdditionalNotes("");
    setShowConfirmDialog(true);
  };

  const confirmStatusAction = async () => {
    if (!actionRequestId || !actionType) return;

    setProcessingAction(actionRequestId);
    
    try {
      const status = actionType === 'approve' ? 'approved' : 'rejected';
      await dispatch(updateDeleteRequestStatus({
        id: actionRequestId,
        status,
        notes: additionalNotes.trim() || undefined
      })).unwrap();

      // Success - close dialog and reset state
      setShowConfirmDialog(false);
      setActionRequestId(null);
      setActionType(null);
      setAdditionalNotes("");
      
      // Optional: Show success message
      // You can add a toast notification here
      
    } catch (error) {
      console.error('Failed to update status:', error);
      // Error handling is managed by Redux slice
    } finally {
      setProcessingAction(null);
    }
  };

  const cancelStatusAction = () => {
    setShowConfirmDialog(false);
    setActionRequestId(null);
    setActionType(null);
    setAdditionalNotes("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 dark:text-green-400';
      case 'rejected':
        return 'text-red-700 dark:text-red-400';
      default:
        return 'text-yellow-700 dark:text-yellow-400';
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.page;
    const maxPages = 5;

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, current - Math.floor(maxPages / 2));
      const end = Math.min(totalPages, start + maxPages - 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div>
      <PageMeta
        title="Delete Account Requests | TailAdmin"
        description="View delete account requests in TailAdmin"
      />
      <PageBreadcrumb pageTitle="Delete Account Requests" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Delete Account Requests
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm dark:text-gray-400">
              Total: {pagination.total}
            </span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email, or reason..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={localFilters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Limit */}
            <div className="flex items-center gap-2">
              <span className="text-sm dark:text-gray-300">Show:</span>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
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
              Reset
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Requested At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
              {requests.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No delete requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request, idx) => {
                  if (!request) return null;
                  return (
                    <tr
                      key={request._id || idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {(pagination.page - 1) * pagination.limit + idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {request.user?.fullName || "-"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {request.user?.email || "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                        <div className="flex items-start">
                          <div className="truncate" title={request.reason}>
                            {request.reason || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          {getStatusIcon(request.status)}
                          <span className={`ml-2 capitalize ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          {request.requestedAt ? new Date(request.requestedAt).toLocaleString() : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {/* <button
                            onClick={() => handleViewDetails(request)}
                            className="text-blue-500 hover:text-blue-700 transition-colors p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button> */}
                          
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleStatusAction(request._id)}
                              disabled={processingAction === request._id}
                              className="text-indigo-500 hover:text-indigo-700 transition-colors p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit Status"
                            >
                              {processingAction === request._id ? (
                                <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-500 rounded-full animate-spin"></div>
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {generatePageNumbers().map((page, idx) =>
                typeof page === "number" ? (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      pagination.page === page
                        ? "bg-indigo-500 text-white"
                        : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span
                    key={idx}
                    className="px-2 py-2 text-gray-400 dark:text-gray-500"
                  >
                    {page}
                  </span>
                )
              )}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Edit Dialog */}
{showConfirmDialog && (
  <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[100000010]">
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Update Request Status
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Status
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="approved"
              checked={actionType === 'approve'}
              onChange={() => setActionType('approve')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Approve</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="rejected"
              checked={actionType === 'reject'}
              onChange={() => setActionType('reject')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Reject</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={cancelStatusAction}
          disabled={processingAction !== null}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={confirmStatusAction}
          disabled={processingAction !== null}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
        >
          {processingAction ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Updating...
            </div>
          ) : (
            'Update Status'
          )}
        </button>
      </div>
    </div>
  </div>
)}



      {/* View Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Delete Request Details
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    User Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedRequest.user?.fullName || "-"}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedRequest.user?.email || "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason for Deletion
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedRequest.reason || "-"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <div className="mt-1 flex items-center">
                    {getStatusIcon(selectedRequest.status)}
                    <span className={`ml-2 capitalize text-sm ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requested At
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedRequest.requestedAt ? new Date(selectedRequest.requestedAt).toLocaleString() : "-"}
                  </p>
                </div>
              </div>

              {selectedRequest.processedAt && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Processed At
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(selectedRequest.processedAt).toLocaleString()}
                    </p>
                  </div>
                  
                  {selectedRequest.processedBy && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Processed By
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedRequest.processedBy.fullName}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedRequest.additionalNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Additional Notes
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedRequest.additionalNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteRequestsList;