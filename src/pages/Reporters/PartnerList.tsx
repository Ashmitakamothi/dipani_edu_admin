import React, { useEffect, useState } from "react";
import {
    fetchAllPartners,
    setSearchQuery,
    setFilters,
    resetFilters,
    deletePartner,
} from "../../store/slices/partners";
import {
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Search,
    RotateCcw,
    X,
    AlertTriangle,
    User,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PopupAlert from "../../components/popUpAlert";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { useNavigate } from "react-router-dom";

interface Partner {
    _id: string;
    name?: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
    isActive: boolean;
    profilePicture?: string;
    image?: string;
    referralCode?: string;
    referredBy?: string | {
        _id: string;
        fullName: string;
        email: string;
        referralCode: string;
    };
    referredByPartner?: {
        _id: string;
        fullName: string;
        email: string;
        referralCode: string;
    } | null;
    createdAt: string;
    updatedAt: string;
    isDeleted?: boolean;
}

// Delete Confirmation Modal Component
const DeleteModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    partner: Partner | null;
    isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, partner, isDeleting }) => {
    if (!isOpen || !partner) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                    {/* Header */}
                    <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Delete Partner
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Are you sure you want to delete the partner{" "}
                            <strong className="text-gray-900 dark:text-white">
                                "{partner.fullName || partner.name}"
                            </strong>
                            ?
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            This action cannot be undone.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
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

const PartnerList: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    // Ensure the state logic matches your store. Currently state.partners.
    // If you named the reducer 'partners' in store/index.ts, strict typing might require (state: RootState)
    const { partners, loading, error, pagination, searchQuery, filters } =
        useAppSelector((state: any) => state.partners);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [searchInput, setSearchInput] = useState(searchQuery);
    const [localFilters, setLocalFilters] =
        useState<Record<string, any>>(filters);

    const [popup, setPopup] = useState<{
        message: string;
        type: "success" | "error";
        isVisible: boolean;
    }>({
        message: "",
        type: "success",
        isVisible: false,
    });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchQuery) {
                dispatch(setSearchQuery(searchInput));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, searchQuery, dispatch]);

    // Fetch partners
    useEffect(() => {
        // Build filters object for API query
        const activeFilters: Record<string, any> = {};

        if (localFilters.status === "active") {
            activeFilters.isActive = true;
        } else if (localFilters.status === "inactive") {
            activeFilters.isActive = false;
        }

        if (typeof localFilters.isActive === "boolean") {
            activeFilters.isActive = localFilters.isActive;
        }

        dispatch(
            fetchAllPartners({
                page: pagination.page,
                limit: pagination.limit,
                filters: activeFilters,
                searchFields: searchQuery ? { search: searchQuery } : {},
                sort: { createdAt: "desc" },
            })
        );
    }, [dispatch, pagination.page, pagination.limit, searchQuery, localFilters]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            // Just trigger re-fetch basically by updating page in dependency or dispatching action
            // But fetchAllPartners takes current page from args
            // Actually fetchAllPartners handles api call. 
            // We need to update state page. 
            // But wait, the slice has setCurrentPage but fetchAllPartners sets it on fulfilled.
            // It's cleaner to dispatch api call with new page directly.
            // Or update pagination state first.
            // Let's use the pattern from StudentList: direct dispatch
            dispatch(
                fetchAllPartners({
                    page: newPage,
                    limit: pagination.limit,
                    filters: {
                        ...(localFilters.status ? { status: localFilters.status } : {}),
                    },
                    searchFields: searchQuery
                        ? { search: searchQuery }
                        : {},
                    sort: { createdAt: "desc" },
                })
            );
        }
    };

    const handleLimitChange = (newLimit: number) => {
        dispatch(
            fetchAllPartners({
                page: 1,
                limit: newLimit,
                filters: {
                    ...(localFilters.status ? { status: localFilters.status } : {}),
                },
                searchFields: searchQuery
                    ? { search: searchQuery }
                    : {},
                sort: { createdAt: "desc" },
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

    const openDeleteModal = (partner: Partner) => {
        setPartnerToDelete(partner);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setPartnerToDelete(null);
        setDeleteModalOpen(false);
        setIsDeleting(false);
    };

    const handleDeleteConfirm = async () => {
        if (partnerToDelete) {
            setIsDeleting(true);
            try {
                await dispatch(deletePartner(partnerToDelete._id)).unwrap();

                setPopup({
                    message: `Partner "${partnerToDelete.fullName || partnerToDelete.name
                        }" deleted successfully`,
                    type: "success",
                    isVisible: true,
                });

                closeDeleteModal();

                // Refresh list
                dispatch(
                    fetchAllPartners({
                        page: pagination.page,
                        limit: pagination.limit,
                        filters: {},
                        searchFields: searchQuery ? { search: searchQuery } : {},
                        sort: { createdAt: "desc" },
                    })
                );
            } catch (error) {
                console.error("Failed to delete partner:", error);
                setPopup({
                    message: "Failed to delete partner. Please try again.",
                    type: "error",
                    isVisible: true,
                });
                setIsDeleting(false);
            }
        }
    };

    const generatePageNumbers = () => {
        // Simple pagination logic
        const pages = [];
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
            <PageMeta
                title="Partner List | TailAdmin"
                description="List of all partners"
            />
            <PageBreadcrumb pageTitle="Partner List" />
            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                        Partners
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm dark:text-gray-400">
                            Total: {pagination.total}
                        </span>
                        <button
                            onClick={() => navigate("/partners/add")}
                            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2 rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            + Add Partner
                        </button>
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
                                placeholder="Search by name, email, referral code..."
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
                        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
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
                                    Image
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                    Referral Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                    Referred By
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                            {partners.length === 0 && !loading ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No partners found.
                                    </td>
                                </tr>
                            ) : (
                                partners.map((partner: Partner, idx: number) => {
                                    if (!partner) return null;
                                    return (
                                        <tr
                                            key={partner._id || idx}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {(pagination.page - 1) * pagination.limit + idx + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <img
                                                    src={
                                                        partner?.profilePicture || partner?.image
                                                            ? `${import.meta.env.VITE_IMAGE_URL}/${partner?.profilePicture || partner?.image
                                                            }`
                                                            : `https://placehold.co/40x40?text=${(
                                                                partner?.fullName ||
                                                                partner?.name ||
                                                                "P"
                                                            ).charAt(0)}`
                                                    }
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).src =
                                                            "https://static.vecteezy.com/system/resources/previews/026/619/142/original/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg";
                                                    }}
                                                    alt={partner?.fullName || partner?.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {partner?.fullName || partner?.name || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {partner?.email || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {partner?.referralCode || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {partner?.referredByPartner ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                                            {partner.referredByPartner.fullName}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Code: {partner.referredByPartner.referralCode}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {partner?.is_verify ? (
                                                    <span className="inline-flex items-center text-green-600">
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-yellow-600">
                                                        <AlertTriangle className="w-4 h-4 mr-1" /> Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {partner?.createdAt
                                                    ? new Date(partner.createdAt).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/partners/edit/${partner._id}`)}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(partner)}
                                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
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
                                    <span
                                        key={idx}
                                        className="px-2 text-gray-400 dark:text-gray-500"
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
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <PopupAlert
                message={popup.message}
                type={popup.type}
                isVisible={popup.isVisible}
                onClose={() => setPopup({ ...popup, isVisible: false })}
            />

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteConfirm}
                partner={partnerToDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default PartnerList;
