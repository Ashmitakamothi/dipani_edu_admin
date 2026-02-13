import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchQuiz } from "../../store/slices/quiz";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";

import {
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router";

interface Course {
  _id: string;
  title: string;
}

interface Lesson {
  _id: string;
  title: string;
}

interface Quiz {
  _id: string;
  course: Course | null;
  lesson: Lesson;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
    _id: string;
  }[];
  passMark: number;
  status?: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quiz: Quiz | null;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, quiz, isDeleting }) => {
  if (!isOpen || !quiz) return null;

  const courseName = quiz.course?.title || "No Course";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity"
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
                Delete Quiz
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
              Are you sure you want to delete this quiz for course{" "}
              <strong className="text-gray-900 dark:text-white">
                "{courseName}"
              </strong>
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

const QuizList: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    data: quizzes,
    loading,
    error,
  } = useAppSelector((state) => state.quiz);

  const [searchInput, setSearchInput] = useState("");
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(fetchQuiz());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(quizzes?.data)) {
      let filtered = quizzes?.data;
      if (searchInput) {
        filtered = filtered.filter((q: Quiz) => {
          const courseName = q.course?.title || "";
          const lessonName = q.lesson?.title || "";
          const searchTerm = searchInput.toLowerCase();
          return (
            courseName.toLowerCase().includes(searchTerm) ||
            lessonName.toLowerCase().includes(searchTerm)
          );
        });
      }
      setFilteredQuizzes(filtered);
    }
  }, [quizzes, searchInput]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(filteredQuizzes.length / limit)) {
      setPage(newPage);
    }
  };

  const openDeleteModal = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setQuizToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    if (quizToDelete) {
      setIsDeleting(true);
      try {
        // TODO: Dispatch deleteQuiz action here
        // await dispatch(deleteQuiz(quizToDelete._id)).unwrap();
        toast.success("Quiz deleted successfully");
        closeDeleteModal();
        dispatch(fetchQuiz());
      } catch (error) {
        toast.error("Failed to delete quiz");
        setIsDeleting(false);
      }
    }
  };

  const generatePageNumbers = () => {
    const totalPages = Math.ceil(filteredQuizzes.length / limit);
    const pages = [];
    const maxPages = 5;
    const start = Math.max(1, page - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);
    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);
    return pages;
  };

  return (
    <div>
      <PageMeta
        title="Quiz List | LMS Admin"
        description="List of all quizzes"
      />
      <PageBreadcrumb pageTitle="Quiz List" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Quizzes
          </h1>
          <span className="text-gray-500 text-sm dark:text-gray-400">
            Total: {filteredQuizzes.length}
          </span>
        </div>

        <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by course or lesson..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setSearchInput("")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
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

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Lesson
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Questions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Pass Mark
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
              {filteredQuizzes
                .slice((page - 1) * limit, page * limit)
                .map((quiz, idx) => (
                  <tr
                    key={quiz._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {quiz.course?.title || (
                        <span className="text-gray-400 italic">No Course</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {quiz.lesson?.title || (
                        <span className="text-gray-400 italic">No Lesson</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {quiz.questions?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {quiz.passMark}%
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {quiz.status === "active" ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="text-green-500 h-5 w-5" />
                          <span className="text-green-600 dark:text-green-400">
                            Active
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="text-red-500 h-5 w-5" />
                          <span className="text-red-600 dark:text-red-400">
                            Inactive
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
                        title="Edit Quiz"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(quiz)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {filteredQuizzes.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {searchInput
                  ? "No quizzes found matching your search."
                  : "No quizzes available."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredQuizzes.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {Math.min((page - 1) * limit + 1, filteredQuizzes.length)}{" "}
              to {Math.min(page * limit, filteredQuizzes.length)} of{" "}
              {filteredQuizzes.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {generatePageNumbers().map((p, idx) =>
                typeof p === "number" ? (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-1 rounded ${
                      page === p
                        ? "bg-indigo-500 text-white"
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
                disabled={page === Math.ceil(filteredQuizzes.length / limit)}
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
        quiz={quizToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default QuizList;
