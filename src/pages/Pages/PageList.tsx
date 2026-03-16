import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import axiosInstance from "../../services/axiosConfig";
import PopupAlert from "../../components/popUpAlert";

export default function PageList() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<any | null>(null);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/pages");
      if (response.data && response.data.data) {
        setPages(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/pages/edit/${id}`);
  };

  const handleDelete = (item: any) => {
    setPageToDelete(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;
    try {
      await axiosInstance.delete(`/pages/${pageToDelete._id}`);
      setDeleteOpen(false);
      setPageToDelete(null);
      setPopup({
        isVisible: true,
        message: "Page deleted successfully",
        type: "success",
      });
      fetchPages();
    } catch (err: any) {
      setPopup({
        isVisible: true,
        message: err.response?.data?.message || "Failed to delete page",
        type: "error",
      });
    }
  };

  const filteredPages = pages.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <PageMeta title="Page Management | Dipani Global Edu" description="Manage dynamic website pages" />
      <PageBreadcrumb pageTitle="Pages" />
      
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Dynamic Pages</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage informative pages like Privacy Policy, Terms, etc.</p>
            </div>
            <button
              onClick={() => navigate("/pages/add")}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Page
            </button>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Slug</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Last Updated</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredPages.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          {searchTerm ? "No pages match your search." : "No dynamic pages created yet."}
                        </td>
                      </tr>
                    ) : (
                      filteredPages.map((page) => (
                        <tr key={page._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{page.title}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-sm">{page.slug}</td>
                          <td className="px-6 py-4">
                            {page.status === "active" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                <Clock className="w-3 h-3" /> Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            {new Date(page.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                             <button
                              onClick={() => handleEdit(page._id)}
                              className="p-2 text-gray-400 hover:text-brand-500 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(page)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {deleteOpen && pageToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
              <button
                onClick={() => { setDeleteOpen(false); setPageToDelete(null); }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Page</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
                Are you sure you want to delete <span className="font-bold">"{pageToDelete.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setDeleteOpen(false); setPageToDelete(null); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <PopupAlert
          isVisible={popup.isVisible}
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ ...popup, isVisible: false })}
        />
      </div>
    </>
  );
}
