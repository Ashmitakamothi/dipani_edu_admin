import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchForumThreads, updateForumThreadStatus, setPage, setLimit, setStatusFilter, updateForumThreadOpenSource, deleteForumThread } from "../../store/slices/forumSlice";
import { RootState } from "../../store";
import { ChevronLeft, ChevronRight, Search, Filter, RotateCcw, Pencil, CheckCircle, XCircle, Loader2, Eye, Trash2, Plus } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useNavigate } from "react-router-dom";

const ForumThreadList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { threads, loading, error, pagination, statusFilter } = useAppSelector((state: RootState) => state.forum);
  const token = useAppSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [modalStatus, setModalStatus] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [openSourceLoading, setOpenSourceLoading] = useState<string | null>(null);
  const [openSourceError, setOpenSourceError] = useState<string | null>(null);

  // Fetch threads on page/limit/status change
  useEffect(() => {
    if (token) {
      dispatch(fetchForumThreads({ page: pagination.page, limit: pagination.limit, token, status: statusFilter }) as any);
    }
  }, [dispatch, token, pagination.page, pagination.limit, statusFilter]);

  // Filter threads by search
  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(searchInput.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Pagination handler
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(setPage(newPage));
    }
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(setLimit(newLimit));
  };

  const handleStatusFilterChange = (value: string) => {
    dispatch(setStatusFilter(value));
  };

  // Remove modal logic and replace with toggle handler
  const handleToggleApproved = async (thread: any) => {
    if (!token) return;
    setModalLoading(true);
    setModalError(null);
    try {
      await dispatch(
        updateForumThreadStatus({
          threadId: thread._id,
          status: thread.isApproved ? "rejected" : "approved",
          token,
        }) as any
      ).unwrap();
    } catch (err: any) {
      setModalError(err?.message || "Failed to update status");
    } finally {
      setModalLoading(false);
    }
  };

  // Open Source toggle handler
  const handleToggleOpenSource = async (thread: any) => {
    if (!token) return;
    setOpenSourceLoading(thread._id);
    setOpenSourceError(null);
    try {
      await dispatch(
        updateForumThreadOpenSource({
          threadId: thread._id,
          Is_openSource: !thread.Is_openSource,
          token,
        }) as any
      ).unwrap();
    } catch (err: any) {
      setOpenSourceError(err?.message || "Failed to update open source status");
    } finally {
      setOpenSourceLoading(null);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!token || !window.confirm("Are you sure you want to delete this thread?")) return;
    try {
      await dispatch(deleteForumThread({ threadId, token }) as any).unwrap();
    } catch (err: any) {
      alert(err?.message || "Failed to delete thread");
    }
  };

  // Status badge
  const getStatusBadge = (isApproved: boolean | string | undefined) => {
    let status: string;
    if (typeof isApproved === "boolean") {
      status = isApproved ? "approved" : "rejected";
    } else if (typeof isApproved === "string") {
      status = isApproved.toLowerCase();
      if (status === "true") status = "approved";
      else if (status === "false") status = "rejected";
    } else {
      status = "approved";
    }
    const config: Record<string, { bg: string; text: string; label: string }> = {
      approved: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
    };
    const c = config[status] || config.approved;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  // Page numbers
  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.page;
    const maxPages = 5;
    const start = Math.max(1, current - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);
    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);
    return pages;
  };

  return (
    <div>
      <PageMeta title="Forum Threads | LMS Admin" description="List of forum threads with replies" />
      <PageBreadcrumb pageTitle="Forum Threads" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Forum Threads</h1>
            <button
              onClick={() => navigate("/forum/create")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Thread</span>
            </button>
          </div>
          <span className="text-gray-500 text-sm dark:text-gray-400">Total: {pagination.total}</span>
        </div>
        <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title or content..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter || ""}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Status</option>

                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm dark:text-gray-300">Show:</span>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <button
              onClick={() => { setSearchInput(""); dispatch(setStatusFilter("")); dispatch(setPage(1)); }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Replies</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                {filteredThreads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No threads found.
                    </td>
                  </tr>
                ) : (
                  filteredThreads.map((thread, idx) => (
                    <tr
                      key={thread._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigate(`/forum/edit/${thread._id}`)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{thread.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{thread.createdBy?.fullName}</td>
                      <td className="px-6 py-4 text-sm text-blue-600">{thread.replies?.length || 0}</td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(thread.isApproved)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(thread.createdAt).toLocaleString()}</td>
                      <td
                        className="px-6 py-4 text-right text-sm font-medium flex gap-3"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                          onClick={() => navigate(`/forum/${thread._id}`)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
                          onClick={() => navigate(`/forum/edit/${thread._id}`)}
                          title="Edit Thread"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition"
                          onClick={() => handleDeleteThread(thread._id)}
                          title="Delete Thread"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          className={`p-2 rounded-md transition ${thread.Is_openSource
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            } disabled:opacity-50`}
                          onClick={() => handleToggleOpenSource(thread)}
                          disabled={openSourceLoading === thread._id}
                          title={thread.Is_openSource ? "Set as Not Open Source" : "Set as Open Source"}
                        >
                          {openSourceLoading === thread._id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : thread.Is_openSource ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition ${thread.isApproved
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                            } disabled:opacity-50`}
                          onClick={() => handleToggleApproved(thread)}
                          disabled={modalLoading}
                        >
                          {modalLoading && selectedThread?._id === thread._id ? (
                            "..."
                          ) : thread.isApproved ? (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {openSourceError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mt-4">
                <p className="text-red-800 dark:text-red-200">{openSourceError}</p>
              </div>
            )}
          </div>
        )}
        {/* Pagination */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {generatePageNumbers().map((pageNum, idx) =>
            typeof pageNum === "number" ? (
              <button
                key={idx}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded ${pagination.page === pageNum
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                {pageNum}
              </button>
            ) : (
              <span key={idx} className="px-2 text-gray-400 dark:text-gray-500">
                {pageNum}
              </span>
            )
          )}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForumThreadList;
