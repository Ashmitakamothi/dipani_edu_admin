import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import {
  fetchJobs,
  deleteJob,
  selectJobs,
  selectJobLoading,
  selectJobError,
  approveJobByAdmin, // <-- add import
} from "../../store/slices/job";
import type { JobResponse, JobState } from "../../store/slices/job";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import JobProposals from "../../components/jobs/JobProposals";
import PopupAlert from "../../components/popUpAlert";
import { Pencil, Trash2 } from "lucide-react";

const JobList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const jobs = useSelector(selectJobs);
  const loading = useSelector(selectJobLoading);
  const error = useSelector(selectJobError);
  const totalJobs = useSelector(
    (state: { job: JobState }) => state.job.totalJobs
  );
  const totalPages = useSelector(
    (state: { job: JobState }) => state.job.totalPages
  );
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });
  // Remove filteredJobs state, use jobs directly for pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  // Pagination info from API response
  const pagination = {
    total: totalJobs || 0,
    page: page,
    limit: limit || 10,
    totalPages: totalPages || 1,
  };

  // Generate page numbers with ellipsis (like CourseList)
  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    console.log("Total Pages:", totalPages);
    const current = pagination.page;
    console.log("Current Page:", current);
    const maxPages = 5;
    const start = Math.max(1, current - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);
    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);
    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [showProposals, setShowProposals] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [approvingJobId, setApprovingJobId] = useState<string | null>(null);
  const [rejectingJobId, setRejectingJobId] = useState<string | null>(null);

  useEffect(() => {
    const filters: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
    } = { page, limit };
    if (categoryFilter) filters.category = categoryFilter;
    if (searchTerm) filters.search = searchTerm;
    dispatch(fetchJobs(filters));
  }, [dispatch, page, limit, categoryFilter, searchTerm]);

  // Remove client-side filtering for pagination, rely on API response

  // Function to open proposals modal
  const handleViewProposals = (job: JobResponse) => {
    setSelectedJob(job);
    setShowProposals(true);
  };

  // Helper to format budget with LPA logic
  const formatBudget = (budget: { min: number; max: number; currency: string }, mode?: string) => {
    const { min, max, currency } = budget;

    if (mode === "full-time") {
      if (currency === "LPA") return `₹ ${max} LPA`;
      if (currency === "INR" || currency === "₹") {
        if (max >= 100000) {
          const maxL = (max / 100000).toFixed(1).replace(/\.0$/, '');
          return `₹ ${maxL} LPA`;
        }
        return `₹ ${max.toLocaleString('en-IN')}`;
      }
      const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
      return `${symbol} ${max.toLocaleString()}`;
    }

    if (currency === "LPA") {
      if (min === max) {
        return `₹ ${min} LPA`;
      }
      return `₹ ${min} - ${max} LPA`;
    }

    // Auto-convert INR to LPA if > 100,000
    if ((currency === "INR" || currency === "₹") && min >= 100000) {
      const minL = (min / 100000).toFixed(1).replace(/\.0$/, '');
      const maxL = (max / 100000).toFixed(1).replace(/\.0$/, '');

      if (minL === maxL) {
        return `₹ ${minL} LPA`;
      }
      return `₹ ${minL} - ${maxL} LPA`;
    }

    const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";

    if (min === max) {
      return `${currencySymbol} ${min.toLocaleString()}`;
    }
    return `${currencySymbol} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const getStatusColor = (status: boolean) => {
    if (status) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    } else {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
  };

  const getStatusText = (status: boolean) => {
    return status ? "Active" : "Inactive";
  };

  const getExperienceLevelText = (level: string) => {
    switch (level) {
      case "entry":
        return "Entry Level";
      case "junior":
        return "Junior (1-3 years)";
      case "mid":
        return "Mid Level (3-5 years)";
      case "senior":
        return "Senior (5+ years)";
      case "expert":
        return "Expert (10+ years)";
      default:
        return level;
    }
  };

  const handleDelete = async (jobId?: string) => {
    setIsDeleteModalOpen(false);
    if (!jobId) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPopup({
          isVisible: true,
          message: "Authentication required",
          type: "error",
        });
        return;
      }
      await dispatch(deleteJob({ jobId, token })).unwrap();
      setPopup({
        isVisible: true,
        message: "Job deleted successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to delete job:", err);
      setPopup({
        isVisible: true,
        message: "Failed to delete job. Please try again.",
        type: "error",
      });
    }
  };

  // Approve job handler
  const handleApproveJob = async (jobId: string, isAdminApproved: boolean) => {
    if (isAdminApproved) setApprovingJobId(jobId);
    else setRejectingJobId(jobId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPopup({
          isVisible: true,
          message: "Authentication required",
          type: "error",
        });
        setApprovingJobId(null);
        setRejectingJobId(null);
        return;
      }
      await dispatch(
        approveJobByAdmin({ jobId, isAdminApproved, token })
      ).unwrap();
      setPopup({
        isVisible: true,
        message: isAdminApproved
          ? "Job approved successfully!"
          : "Job rejected successfully!",
        type: "success",
      });
    } catch (err) {
      setPopup({
        isVisible: true,
        message: isAdminApproved
          ? "Failed to approve job. Please try again."
          : "Failed to reject job. Please try again.",
        type: "error",
      });
    }
    setApprovingJobId(null);
    setRejectingJobId(null);
  };

  return (
    <>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[999] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/10 bg-opacity-30 backdrop-blur-xs transition-opacity"></div>

            {/* Modal */}
            <div className="relative z-50 mx-auto w-full max-w-sm rounded-lg  bg-white dark:bg-gray-800/10 p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-center text-gray-900 dark:text-white">
                Delete Event
              </h3>
              <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this event? This action cannot
                be undone.
              </p>

              <div className="mt-4 flex justify-center space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={() => handleDelete(selectedJob?._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <PopupAlert
        isVisible={popup.isVisible}
        message={popup.message}
        type={popup.type}
        onClose={() => {
          setPopup({ isVisible: false, message: "", type: "" });
        }}
      />
      <PageMeta
        title="Jobs Management | LMS Admin Panel"
        description="Manage job postings and applications"
      />
      <PageBreadcrumb pageTitle="Jobs" />

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 mb-4 rounded">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Jobs Management
          </h2>
          <Link
            to="/jobs/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add New Job
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search jobs..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="technology">Technology</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="finance">Finance</option>
                <option value="hr">Human Resources</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setCategoryFilter("");
                  setPage(1);
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    #
                  </th>
                  <th className="px-3 py-3  text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Image
                  </th>
                  <th className="px-3 py-3  text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Title
                  </th>
                  <th className="px-3 py-3  text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Description
                  </th>
                  <th className="px-3 py-3  text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Category
                  </th>
                  <th className="px-3 py-3  text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Budget
                  </th>
                  <th className="px-3 py-3  text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Location
                  </th>
                  <th className="px-3 py-3  text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Experience
                  </th>
                  <th className="px-3 py-3  text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Duration
                  </th>
                  <th className="px-3 py-3  text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Skills
                  </th>
                  <th className="px-3 py-3  text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-3 py-3  text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                {jobs.map((job, idx) => (
                  <tr
                    key={job._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {job.thumbnail ? (
                        <img
                          src={job.thumbnail}
                          alt={job.title}
                          className="w-14 h-10 rounded-sm object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "/images/icons/file-image.svg";
                          }}
                        />
                      ) : (
                        <img
                          src="/images/icons/file-image.svg"
                          alt="No image"
                          className="w-14 h-10 rounded-sm object-cover opacity-50"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                      {job.title.length > 20
                        ? job.title.slice(0, 20) + "..."
                        : job.title}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {job.description.length > 15
                        ? job.description.slice(0, 15) + "..."
                        : job.description}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {job.category}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {formatBudget(job.budget, job.mode)}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {job.location.type === "remote"
                        ? "Remote"
                        : typeof job.location.address === "string"
                          ? job.location.address
                          : job.location.address?.street || "On-site"}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {getExperienceLevelText(job.experienceLevel)}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {job.mode === "full-time" ? "-" : `${job.estimatedDuration.value} ${job.estimatedDuration.unit}`}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {job.skillsRequired.length > 0
                        ? job.skillsRequired.slice(0, 3).join(", ")
                        : "-"}
                      {job.skillsRequired.length > 3 && (
                        <span className="text-xs text-gray-400">
                          {" "}
                          +{job.skillsRequired.length - 3} more
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {getStatusText(job.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm flex gap-2">
                      <button
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => handleViewProposals(job)}
                      >
                        Proposals
                        {job.proposals && job.proposals.length > 0 && (
                          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
                            {job.proposals.length}
                          </span>
                        )}
                      </button>
                      <Link
                        to={`/jobs/edit/${job._id}`}
                        className="p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900"
                      >
                        <Pencil className="w-4 h-4 text-indigo-600" />
                      </Link>
                      <button
                        className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900"
                        onClick={() => {
                          setSelectedJob(job);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                      {/* Approve/Reject buttons always visible */}
                      <button
                        className={`p-2 rounded ${job.isAdminApproved
                          ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          : "bg-green-600 text-white hover:bg-green-700"
                          } disabled:opacity-50`}
                        disabled={approvingJobId === job._id}
                        onClick={() => handleApproveJob(job._id, true)}
                      >
                        {approvingJobId === job._id ? "Approving..." : "Approve"}
                      </button>
                      <button
                        className={`p-2 rounded ${job.isAdminApproved === false
                          ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          : "bg-red-600 text-white hover:bg-red-700"
                          } disabled:opacity-50`}
                        disabled={rejectingJobId === job._id}
                        onClick={() => handleApproveJob(job._id, false)}
                      >
                        {rejectingJobId === job._id ? "Rejecting..." : "Reject"}
                      </button>
                      {/* Show current admin approval status */}
                      {job.isAdminApproved === true && (
                        <span className="p-2 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 text-xs">
                          Approved
                        </span>
                      )}
                      {job.isAdminApproved === false && (
                        <span className="p-2 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 text-xs">
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      className="text-center py-8 text-gray-400 dark:text-gray-500"
                    >
                      No jobs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination (CourseList style) */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="font-bold">&#60;</span>
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
            <span className="font-bold">&#62;</span>
          </button>
        </div>

        {/* Limit selector (like CourseList) */}
        <div className="flex items-center gap-2 mt-2 justify-end">
          <span className="text-sm dark:text-gray-300">Show:</span>
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        {jobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m8 0V8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6m8 0H8"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No jobs found
              </h3>
              <p className="text-sm">
                Get started by creating your first job posting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Job Proposals Modal */}
      {selectedJob && (
        <JobProposals
          proposals={selectedJob.proposals || []}
          isOpen={showProposals}
          onClose={() => setShowProposals(false)}
          jobTitle={selectedJob.title}
          jobId={selectedJob._id}
        />
      )}
    </>
  );
};

export default JobList;
