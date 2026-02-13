import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchBanners, deleteBanner } from "../../store/slices/banner";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RotateCcw,
  Pencil,
  Trash2,
} from "lucide-react";

const Banner: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { banners, loading, error } = useAppSelector((state) => state.banner);
  console.log("Banners from state:", banners);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const VITE_IMAGE = import.meta.env.VITE_IMAGE_URL;

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch =
      !searchInput ||
      banner.title.toLowerCase().includes(searchInput.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && banner.isActive) ||
      (statusFilter === "inactive" && !banner.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleResetFilters = () => {
    setSearchInput("");
    setStatusFilter("");
  };

  const handleEdit = (id: string) => {
    navigate(`/banner/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      setDeletingId(id);
      await dispatch(deleteBanner(id));
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageMeta
        title="Banner List | LMS Admin"
        description="List of all banners"
      />
      <PageBreadcrumb pageTitle="Banner List" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Banners
          </h1>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            onClick={() => (window.location.href = "/banner/add")}
          >
            Add Banner
          </button>
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
                placeholder="Search by title..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
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
                  Image
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
              {filteredBanners.map((banner, idx) => (
                <tr
                  key={banner._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <img
                      src={`${VITE_IMAGE}/${banner.image}`}
                      alt={banner.title}
                      className="w-14 h-10 rounded-sm object-cover"
                      onError={(e) => {
                        console.log("Image load error for banner:", banner);
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://tse2.mm.bing.net/th/id/OIP.z2HmY-oQPSmmDwR-MYmW6QAAAA?pid=Api&P=0&h=180";
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {banner.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {banner.type}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {banner.isActive ? (
                      <CheckCircle className="text-green-500 h-5 w-5" />
                    ) : (
                      <XCircle className="text-red-500 h-5 w-5" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {banner.priority}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {banner.createdAt
                      ? new Date(banner.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      title="Edit"
                      className="p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900"
                      onClick={() => handleEdit(banner._id)}
                    >
                      <Pencil className="w-4 h-4 text-indigo-600" />
                    </button>
                    <button
                      title="Delete"
                      className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      onClick={() => handleDelete(banner._id)}
                      disabled={deletingId === banner._id}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBanners.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-gray-400 dark:text-gray-500"
                  >
                    No banners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Banner;
