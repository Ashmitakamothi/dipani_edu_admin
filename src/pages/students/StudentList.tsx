import React, { useEffect, useState } from "react";
import {
    fetchAllStudents,
    setSearchQuery,
    resetFilters,
    setFilters
} from "../../store/slices/students";
import type { Student, CourseEnrollmentInfo } from "../../store/slices/students";
import {
    Search,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    BookOpen,
    User,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { useNavigate } from "react-router-dom";

// Expandable course row sub-component
const CourseRow: React.FC<{ enrollment: CourseEnrollmentInfo; idx: number }> = ({ enrollment, idx }) => (
    <tr className="bg-blue-50 dark:bg-blue-900/10">
        <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 pl-16">
            {idx + 1}
        </td>
        <td className="px-4 py-2 text-xs font-medium text-gray-800 dark:text-gray-200" colSpan={2}>
            <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                {enrollment.courseName}
            </div>
        </td>
        <td className="px-4 py-2 text-xs text-gray-700 dark:text-gray-300">
            ₹{enrollment.pricePaid?.toLocaleString() ?? 0}
        </td>
        <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
            {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : "-"}
        </td>
        <td className="px-4 py-2 text-xs">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${enrollment.status === "active"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : enrollment.status === "completed"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : enrollment.status === "expired"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                {enrollment.status}
            </span>
        </td>
        <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
            {enrollment.accessExpiry ? new Date(enrollment.accessExpiry).toLocaleDateString() : "Lifetime"}
        </td>
    </tr>
);

const StudentList: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { students, loading, error, pagination, searchQuery, filters } =
        useAppSelector((state: any) => state.students);

    const [searchInput, setSearchInput] = useState(searchQuery);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchQuery) {
                dispatch(setSearchQuery(searchInput));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, searchQuery, dispatch]);

    useEffect(() => {
        dispatch(
            fetchAllStudents({
                page: pagination.page,
                limit: pagination.limit,
                filters: filters,
                searchFields: searchQuery ? { search: searchQuery } : {},
                sort: { createdAt: "desc" },
            })
        );
    }, [dispatch, pagination.page, pagination.limit, searchQuery, filters]);

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            dispatch(
                fetchAllStudents({
                    page: newPage,
                    limit: pagination.limit,
                    filters,
                    searchFields: searchQuery ? { search: searchQuery } : {},
                    sort: { createdAt: "desc" },
                })
            );
        }
    };

    const handleLimitChange = (newLimit: number) => {
        dispatch(
            fetchAllStudents({
                page: 1,
                limit: newLimit,
                filters,
                searchFields: searchQuery ? { search: searchQuery } : {},
                sort: { createdAt: "desc" },
            })
        );
    };

    const handleResetFilters = () => {
        setSearchInput("");
        dispatch(resetFilters());
    };

    const generatePageNumbers = () => {
        const pages: (number | string)[] = [];
        const total = pagination.totalPages;
        const current = pagination.page;
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    return (
        <div>
            <PageMeta title="Student List | Admin" description="List of all students with referral and course info" />
            <PageBreadcrumb pageTitle="Student List" />
            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Students</h1>
                    <span className="text-gray-500 text-sm dark:text-gray-400">
                        Total: {pagination.total}
                    </span>
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
                                placeholder="Search by name, email, phone..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-brand-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm dark:text-gray-300">Show:</span>
                            <select
                                value={pagination.limit}
                                onChange={(e) => handleLimitChange(Number(e.target.value))}
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-brand-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="referredOnly"
                                checked={filters.referredOnly === true}
                                onChange={(e) => {
                                    dispatch(setFilters({
                                        ...filters,
                                        referredOnly: e.target.checked
                                    }));
                                }}
                                className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                            />
                            <label htmlFor="referredOnly" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                Referred Students Only
                            </label>
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

                {/* Error */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Legend */}
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1">
                    <ChevronDown className="w-3.5 h-3.5" /> Click a row to expand purchased courses
                </p>

                {/* Table */}
                <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Referred By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Referral Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Courses</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Joined</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                            {students.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student: Student, idx: number) => {
                                    if (!student) return null;
                                    const isExpanded = expandedRows.has(student._id);
                                    const enrollments = student.enrollments || [];
                                    return (
                                        <React.Fragment key={student._id || idx}>
                                            {/* Main student row */}
                                            <tr
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                                onClick={() => toggleRow(student._id)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {(pagination.page - 1) * pagination.limit + idx + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <img
                                                        src={
                                                            student?.profilePicture || student?.image
                                                                ? `${import.meta.env.VITE_IMAGE_URL}/${student?.profilePicture || student?.image}`
                                                                : `https://placehold.co/40x40?text=${(student?.fullName || student?.name || "S").charAt(0)}`
                                                        }
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).src =
                                                                "https://static.vecteezy.com/system/resources/previews/026/619/142/original/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg";
                                                        }}
                                                        alt={student?.fullName || student?.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {student?.fullName || student?.name || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {student?.email || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {student?.phone || "-"}
                                                </td>
                                                {/* Referred By Partner */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {student?.referredByPartner ? (
                                                        <div>
                                                            <p className="font-medium text-indigo-600 dark:text-indigo-400">
                                                                {student.referredByPartner.fullName}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{student.referredByPartner.email}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                {/* Referral Code */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {student?.referredByPartner?.referralCode ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                            {student.referredByPartner.referralCode}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                {/* Course count */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${enrollments.length > 0
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                                            }`}>
                                                            <BookOpen className="w-3 h-3" />
                                                            {enrollments.length}
                                                        </span>
                                                        {enrollments.length > 0 && (
                                                            isExpanded
                                                                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                                                                : <ChevronDown className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => navigate(`/students/${student._id}`)}
                                                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs font-medium"
                                                    >
                                                        <User className="w-3.5 h-3.5" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expanded course rows */}
                                            {isExpanded && enrollments.length > 0 && (
                                                <>
                                                    <tr className="bg-blue-50 dark:bg-blue-900/10">
                                                        <td colSpan={10} className="px-6 pt-2 pb-1">
                                                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                                                Purchased Courses ({enrollments.length})
                                                            </p>
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-blue-50 dark:bg-blue-900/10">
                                                        <td className="px-4 py-1 text-xs text-gray-400 pl-16">#</td>
                                                        <td className="px-4 py-1 text-xs text-gray-400" colSpan={2}>Course Name</td>
                                                        <td className="px-4 py-1 text-xs text-gray-400">Price Paid</td>
                                                        <td className="px-4 py-1 text-xs text-gray-400">Enrolled On</td>
                                                        <td className="px-4 py-1 text-xs text-gray-400">Status</td>
                                                        <td className="px-4 py-1 text-xs text-gray-400">Access Expiry</td>
                                                        <td colSpan={3}></td>
                                                    </tr>
                                                    {enrollments.map((enrollment, eIdx) => (
                                                        <CourseRow key={eIdx} enrollment={enrollment} idx={eIdx} />
                                                    ))}
                                                </>
                                            )}

                                            {isExpanded && enrollments.length === 0 && (
                                                <tr className="bg-gray-50 dark:bg-gray-800/50">
                                                    <td colSpan={10} className="px-6 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                                                        No courses purchased yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mt-6">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                            {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                            of {pagination.total} results
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            {generatePageNumbers().map((page, idx) =>
                                typeof page === "number" ? (
                                    <button
                                        key={idx}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${pagination.page === page
                                            ? "bg-brand-500 text-white"
                                            : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className="px-2 text-gray-400 dark:text-gray-500">{page}</span>
                                )
                            )}
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentList;
