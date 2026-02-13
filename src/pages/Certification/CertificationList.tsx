import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch } from "../../hooks/redux";
import { fetchAssignmentSubmissions } from "../../store/slices/assignment";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { fetchCertificates } from "../../store/slices/certificate";

interface Course {
  _id: string;
  title: string;
}

interface Lesson {
  _id: string;
  title: string;
}

interface Assignment {
  _id: string;
  courseId?: Course | null;
  assignmentId?: {
    _id: string;
    title: string;
  };
  lessonId?: Lesson | null;
  sectionId?: string;
  title: string;
  description: string;
  subject?: string;
  language: string;
  score: number;
  maxScore: number;
  duration: number;
  grade?: number;
  passGrade?: number;
  deadline?: string;
  dueDate?: string;
  attempts?: number;
  attachments?: string[];
  attachmentFile?: string;
  documentFile?: string;
  active?: boolean;
  status?: "submitted" | "graded" | "pending";
  remarks?: string;
  dropContent?: boolean;
  forceStudentToPassPreviousParts?: boolean;
  accessDayLimit?: {
    enabled: boolean;
    days: number;
  };
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assignment: Assignment | null;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, assignment, isDeleting }) => {
  if (!isOpen || !assignment) return null;

  const courseName = assignment.courseId?.title || "No Course";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Assignment
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete the assignment{" "}
              <strong className="text-gray-900 dark:text-white">
                "{assignment.assignmentId?.title || assignment.title}"
              </strong>
              {courseName !== "No Course" && (
                <>
                  {" "}
                  for course{" "}
                  <strong className="text-gray-900 dark:text-white">
                    "{courseName}"
                  </strong>
                </>
              )}
              ?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CertificationList = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const dispatch = useAppDispatch();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] =
    useState<Assignment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  // Fetch data when page or search changes
  useEffect(() => {
    fetchData();
  }, [pagination.page, debouncedSearch, searchInput]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "📥 Fetching assignments - Page:",
        pagination.page,
        "Search:",
        debouncedSearch
      );

      const response = await dispatch(
        fetchCertificates({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch.trim(),
        })
      ).unwrap();

      console.log("📥 Fetched assignments:", response);

      // Assuming the API returns data in this format
      if (response && response.templates) {
        setAssignments(response.templates || []);
        setPagination({
          page: pagination.page,
          limit: pagination.limit,
        });
      } else {
        // Fallback if response structure is different
        setAssignments(Array.isArray(response) ? response : []);
      }
    } catch (error: any) {
      console.error("📥 Fetch error:", error);
      setError(error?.message || "Failed to fetch assignments");
      toast.error("Failed to fetch assignments");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 1 &&
      newPage <= pagination.totalPages &&
      newPage !== pagination.page &&
      !loading
    ) {
      console.log("📄 Page change:", newPage);
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSearchReset = () => {
    console.log("🔄 Reset search");
    setSearchInput("");
    setDebouncedSearch("");
  };

  const openDeleteModal = (assignment: Assignment) => {
    console.log("🗑️ Opening delete modal");
    setAssignmentToDelete(assignment);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    console.log("🗑️ Closing delete modal");
    setAssignmentToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    if (assignmentToDelete) {
      setIsDeleting(true);
      try {
        console.log("🗑️ Deleting assignment");
        // TODO: Implement deleteAssignment action
        // await dispatch(deleteAssignment(assignmentToDelete._id)).unwrap();
        toast.success("Assignment deleted successfully");
        fetchData(); // Refresh data after deletion
        closeDeleteModal();
      } catch (error) {
        console.error("🗑️ Delete error:", error);
        toast.error("Failed to delete assignment");
        setIsDeleting(false);
      }
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    const { page: currentPage, totalPages } = pagination;
    const start = Math.max(1, currentPage - Math.floor(maxPages / 2));
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

    return pages;
  };

  const handleEditClick = (assignmentId: string) => {
    console.log("✏️ Edit click:", assignmentId);
    navigate(`/certificates-template/edit/${assignmentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "graded":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div>
      <PageMeta
        title="Certificate List | LMS Admin"
        description="List of all certificates"
      />
      <PageBreadcrumb pageTitle="Certificate List" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Certificate List
          </h1>
          <span className="text-gray-500 text-sm dark:text-gray-400">
            Total: {pagination.total}
          </span>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  console.log("🔍 Search input:", e.target.value);
                  setSearchInput(e.target.value);
                }}
                placeholder="Search by course, title, or subject..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {debouncedSearch !== searchInput && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={handleSearchReset}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 disabled:opacity-50"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
              {!loading &&
                assignments.map((assignment, idx) => (
                  <tr
                    key={assignment._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      <div
                        className="max-w-xs truncate"
                        title={
                          assignment.assignmentId?.title || assignment.title
                        }
                      >
                        {assignment.assignmentId?.title ||
                          assignment.title ||
                          "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="max-w-xs truncate">{assignment.type}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          assignment.status || "pending"
                        )}`}
                      >
                        {assignment.status || "pending"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(assignment._id)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="View Submission"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      {/* <button
                      onClick={() => openDeleteModal(assignment)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Submission"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button> */}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Empty State */}
          {!loading && assignments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {debouncedSearch
                  ? "No assignment submissions found matching your search."
                  : "No assignment submissions available."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && assignments.length > 0 && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing{" "}
              {Math.min(
                (pagination.page - 1) * pagination.limit + 1,
                pagination.total
              )}{" "}
              to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {generatePageNumbers().map((p, idx) =>
                typeof p === "number" ? (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(p)}
                    disabled={loading}
                    className={`px-3 py-1 rounded text-sm ${
                      pagination.page === p
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span
                    key={idx}
                    className="px-2 py-1 text-gray-400 dark:text-gray-500 text-sm"
                  >
                    {p}
                  </span>
                )
              )}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        assignment={assignmentToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CertificationList;
