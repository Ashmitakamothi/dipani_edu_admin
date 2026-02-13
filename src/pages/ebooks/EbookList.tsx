import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchEbooks, deleteEbook } from "../../store/slices/ebook";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Eye,
    Star,
    Plus,
    Edit3,
    Trash2,
    BookOpen,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Download
} from "lucide-react";
import { Link } from "react-router-dom";

const VITE_IMAGE_URL = import.meta.env.VITE_BASE_URL;

const EbookList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { loading, error, data } = useAppSelector((state) => state.ebook);

    // State for search, pagination
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchEbooks({ page, limit, search: searchInput }));
        }, 500);
        return () => clearTimeout(timer);
    }, [dispatch, page, limit, searchInput]);

    const ebooks = Array.isArray(data?.ebooks) ? data.ebooks : [];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 1;

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    };

    const handleResetFilters = () => {
        setSearchInput("");
        setPage(1);
        setLimit(10);
    };

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await dispatch(deleteEbook(id)).unwrap();
                // Refresh or message handled by slice/fulfilled case
            } catch (err: any) {
                alert("Failed to delete ebook: " + err);
            }
        }
    };

    const generatePageNumbers = () => {
        const pages = [];
        const maxPages = 5;
        const start = Math.max(1, page - Math.floor(maxPages / 2));
        const end = Math.min(totalPages, start + maxPages - 1);
        if (start > 1) pages.push(1, "...");
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages) pages.push("...", totalPages);
        return pages;
    };

    const StatusBadge = ({ isPublished }: { isPublished: boolean }) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isPublished
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
            }`}>
            {isPublished ? (
                <><CheckCircle className="w-3 h-3" /> Published</>
            ) : (
                <><Clock className="w-3 h-3" /> Draft</>
            )}
        </span>
    );

    const EbookCard = ({ ebook }: { ebook: any }) => (
        <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="relative">
                <img
                    src={VITE_IMAGE_URL + "/" + ebook.thumbnail}
                    alt={ebook.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://via.placeholder.com/300x200?text=Ebook";
                    }}
                />
                <div className="absolute top-3 left-3">
                    <StatusBadge isPublished={ebook.isPublished} />
                </div>
            </div>

            <div className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight mb-2 line-clamp-2">
                    {ebook.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ebook.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {ebook.salesCount}</span>
                        <span className="flex items-center gap-1 text-yellow-500"><Star className="w-4 h-4 fill-current" /> {ebook.averageRating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to={`/ebooks/edit/${ebook._id}`} className="p-2 text-brand-500 hover:bg-brand-50 rounded-lg">
                            <Edit3 className="w-4 h-4" />
                        </Link>
                        {ebook.fullFile && (
                            <a
                                href={`${VITE_IMAGE_URL}/${ebook.fullFile}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Download Ebook"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                        )}
                        <button onClick={() => handleDelete(ebook._id, ebook.title)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <PageMeta title="Ebook List | LMS Admin" description="Manage your ebook collection" />
            <PageBreadcrumb pageTitle="Ebook List" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-6 py-8 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ebooks</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage your ebook collection</p>
                    </div>
                    <Link
                        to="/ebooks/add"
                        className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all shadow-lg font-medium"
                    >
                        <Plus className="w-5 h-5" /> Add Ebook
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search ebooks..."
                            className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Show:</span>
                        <select
                            value={limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="border border-gray-300 rounded-lg px-4 py-3 dark:bg-gray-900"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                    <button onClick={handleResetFilters} className="flex items-center gap-2 px-4 py-3 border rounded-lg hover:bg-gray-50">
                        <RotateCcw className="h-4 w-4" /> Reset
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-2 text-red-800">
                        <XCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {ebooks.length === 0 ? (
                            <div className="text-center py-20">
                                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No ebooks found</h3>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {ebooks.map((ebook: any) => <EbookCard key={ebook._id} ebook={ebook} />)}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 border rounded-xl overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">Thumbnail</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">Title</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">Price</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {ebooks.map((ebook: any) => (
                                            <tr key={ebook._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <img src={VITE_IMAGE_URL + "/" + ebook.thumbnail} className="w-12 h-12 rounded object-cover" alt="" />
                                                </td>
                                                <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900 dark:text-white">{ebook.title}</div></td>
                                                <td className="px-6 py-4"><div className="text-sm text-gray-600 dark:text-gray-400">{ebook.currency} {ebook.price?.$numberDecimal || ebook.price}</div></td>
                                                <td className="px-6 py-4"><StatusBadge isPublished={ebook.isPublished} /></td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link to={`/ebooks/edit/${ebook._id}`} className="text-brand-500 hover:text-brand-600"><Edit3 className="w-4 h-4" /></Link>
                                                        {ebook.fullFile && (
                                                            <a
                                                                href={`${VITE_IMAGE_URL}/${ebook.fullFile}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Download Ebook"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <button onClick={() => handleDelete(ebook._id, ebook.title)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {ebooks.length > 0 && (
                            <div className="flex items-center justify-between mt-8">
                                <div className="text-sm text-gray-500">Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results</div>
                                <div className="flex gap-1">
                                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="p-2 border rounded shadow-sm disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                                    {generatePageNumbers().map((n, i) => (
                                        typeof n === 'number' ? (
                                            <button key={i} onClick={() => handlePageChange(n)} className={`px-4 py-2 border rounded ${page === n ? 'bg-brand-500 text-white' : 'hover:bg-gray-50'}`}>{n}</button>
                                        ) : <span key={i} className="px-2">...</span>
                                    ))}
                                    <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="p-2 border rounded shadow-sm disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EbookList;
