import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, X, FileText, Link2, Globe } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import axiosInstance from "../../services/axiosConfig";
import Editor from "../../components/Editor";
import PopupAlert from "../../components/popUpAlert";

export default function AddEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    status: "active",
  });
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchPage = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get(`/pages/${id}`);
          if (response.data && response.data.data) {
            const pageData = response.data.data;
            setFormData({
              title: pageData.title,
              slug: pageData.slug,
              status: pageData.status,
            });
            // Try parsing content if it's a string (JSON string from EditorJS)
            try {
              setContent(JSON.parse(pageData.content));
            } catch (e) {
              setContent(pageData.content);
            }
          }
        } catch (err: any) {
          setPopup({
            isVisible: true,
            message: "Failed to fetch page data",
            type: "error",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchPage();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title if not in edit mode
    if (name === "title" && !isEditMode) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleEditorChange = (data: any) => {
    setContent(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !content) {
      setPopup({
        isVisible: true,
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        content: JSON.stringify(content),
      };

      if (isEditMode) {
        await axiosInstance.put(`/pages/${id}`, payload);
      } else {
        await axiosInstance.post("/pages", payload);
      }

      setPopup({
        isVisible: true,
        message: `Page ${isEditMode ? "updated" : "created"} successfully!`,
        type: "success",
      });

      setTimeout(() => {
        navigate("/pages/all");
      }, 1500);
    } catch (err: any) {
      setPopup({
        isVisible: true,
        message: err.response?.data?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`${isEditMode ? "Edit" : "Add"} Page | Dipani Global Edu`} description="Manage dynamic website content" />
      <PageBreadcrumb pageTitle={isEditMode ? "Edit Page" : "Add Page"} />

      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Page" : "Create New Page"}
          </h1>
          <button
            onClick={() => navigate("/pages/all")}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-500" /> Page Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Privacy Policy"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-brand-500" /> URL Slug *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="privacy-policy"
                    className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono text-sm"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 italic">This will be used in the URL: dipaniglobaledu.com/pages/[slug]</p>
              </div>
            </div>

            <div className="mb-6">
               <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-brand-500" /> Page Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full sm:w-48 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Content *</label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden min-h-[400px] bg-white dark:bg-gray-900 border-2">
                <Editor
                  data={content}
                  onChange={handleEditorChange}
                  holder="page-content-editor"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isEditMode ? "Update Page" : "Publish Page"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/pages/all")}
                className="px-8 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

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
