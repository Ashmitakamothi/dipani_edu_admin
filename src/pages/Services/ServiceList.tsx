import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { RootState } from "../../store";
import { getAllServiceCategories, deleteServiceCategory } from "../../store/slices/serviceCategory";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const colorBadgeMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800",
  rose: "bg-rose-100 text-rose-800",
  emerald: "bg-emerald-100 text-emerald-800",
  purple: "bg-purple-100 text-purple-800",
  orange: "bg-orange-100 text-orange-800",
  teal: "bg-teal-100 text-teal-800",
  indigo: "bg-indigo-100 text-indigo-800",
  yellow: "bg-yellow-100 text-yellow-800",
};

const ServiceList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { categories, loading } = useAppSelector((state: RootState) => state.serviceCategory);
  const token = useAppSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) dispatch(getAllServiceCategories(token) as any);
  }, [dispatch, token]);

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm("Delete this service category?")) return;
    await dispatch(deleteServiceCategory({ id, token }) as any);
  };

  return (
    <div>
      <PageMeta title="Service Categories | Admin" description="Manage service categories" />
      <PageBreadcrumb pageTitle="Service Categories" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Service Categories</h1>
          <button
            onClick={() => navigate("/services/add")}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No service categories yet. Click "Add Service" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={cat._id}
                className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm font-mono w-6">{idx + 1}</span>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{cat.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorBadgeMap[cat.colorScheme] || "bg-gray-100 text-gray-800"}`}
                      >
                        {cat.colorScheme}
                      </span>
                      {!cat.isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 max-w-lg">
                      {cat.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {cat.subServices?.length || 0} sub-services · Slug: <span className="font-mono">{cat.slug}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/services/edit/${cat._id}`)}
                    className="p-2 text-brand-500 hover:bg-brand-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;
