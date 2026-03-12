import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { RootState } from "../../store";
import {
  createServiceCategory,
  updateServiceCategory,
  getAllServiceCategories,
  SubService,
} from "../../store/slices/serviceCategory";
import { Plus, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const COLOR_OPTIONS = ["blue", "rose", "emerald", "purple", "orange", "teal", "indigo", "yellow"];

const emptySubService = (): SubService => ({ title: "", desc: "", items: [""] });

const AddEditService: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const { categories, loading } = useAppSelector((state: RootState) => state.serviceCategory);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    badge: "",
    description: "",
    colorScheme: "blue",
    order: 0,
    isActive: true,
    subServices: [emptySubService()],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && categories.length === 0) dispatch(getAllServiceCategories(token) as any);
  }, [token]);

  useEffect(() => {
    if (isEdit && id) {
      const existing = categories.find((c) => c._id === id);
      if (existing) {
        setForm({
          title: existing.title,
          slug: existing.slug,
          badge: existing.badge || "",
          description: existing.description || "",
          colorScheme: existing.colorScheme || "blue",
          order: existing.order || 0,
          isActive: existing.isActive,
          subServices: existing.subServices?.length ? existing.subServices.map((s) => ({
            ...s,
            items: s.items?.length ? s.items : [""],
          })) : [emptySubService()],
        });
      }
    }
  }, [categories, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAutoSlug = () => {
    setForm((prev) => ({
      ...prev,
      slug: prev.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  };

  // Sub-service handlers
  const addSubService = () => setForm((prev) => ({ ...prev, subServices: [...prev.subServices, emptySubService()] }));
  const removeSubService = (idx: number) =>
    setForm((prev) => ({ ...prev, subServices: prev.subServices.filter((_, i) => i !== idx) }));
  const updateSubService = (idx: number, field: keyof SubService, value: any) =>
    setForm((prev) => ({
      ...prev,
      subServices: prev.subServices.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));

  // Item handlers
  const addItem = (subIdx: number) =>
    setForm((prev) => ({
      ...prev,
      subServices: prev.subServices.map((s, i) => (i === subIdx ? { ...s, items: [...s.items, ""] } : s)),
    }));
  const removeItem = (subIdx: number, itemIdx: number) =>
    setForm((prev) => ({
      ...prev,
      subServices: prev.subServices.map((s, i) =>
        i === subIdx ? { ...s, items: s.items.filter((_, j) => j !== itemIdx) } : s
      ),
    }));
  const updateItem = (subIdx: number, itemIdx: number, value: string) =>
    setForm((prev) => ({
      ...prev,
      subServices: prev.subServices.map((s, i) =>
        i === subIdx ? { ...s, items: s.items.map((it, j) => (j === itemIdx ? value : it)) } : s
      ),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        order: Number(form.order),
        subServices: form.subServices.map((s) => ({
          ...s,
          items: s.items.filter((it) => it.trim() !== ""),
        })),
      };
      if (isEdit && id) {
        await dispatch(updateServiceCategory({ id, data: payload, token }) as any).unwrap();
      } else {
        await dispatch(createServiceCategory({ data: payload, token }) as any).unwrap();
      }
      navigate("/services/all");
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm";

  return (
    <div>
      <PageMeta title={`${isEdit ? "Edit" : "Add"} Service | Admin`} description="Manage service category" />
      <PageBreadcrumb pageTitle={isEdit ? "Edit Service" : "Add Service"} />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-8">
          {isEdit ? "Edit Service Category" : "Add Service Category"}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} onBlur={handleAutoSlug} required className={inputCls} placeholder="e.g. Finance Services" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
              <input name="slug" value={form.slug} onChange={handleChange} required className={inputCls} placeholder="e.g. finance" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge Text</label>
              <input name="badge" value={form.badge} onChange={handleChange} className={inputCls} placeholder="e.g. 💰 1. Finance" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Scheme</label>
              <select name="colorScheme" value={form.colorScheme} onChange={handleChange} className={inputCls}>
                {COLOR_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
              <input name="order" type="number" value={form.order} onChange={handleChange} className={inputCls} min={0} />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 accent-brand-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active (visible on site)</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputCls} placeholder="Brief description of this service category" />
            </div>
          </div>

          {/* Sub Services */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Sub-Services</h2>
              <button type="button" onClick={addSubService} className="flex items-center gap-1 text-sm text-brand-500 hover:text-brand-700 font-medium">
                <Plus className="w-4 h-4" /> Add Sub-Service
              </button>
            </div>
            <div className="space-y-4">
              {form.subServices.map((sub, subIdx) => (
                <div key={subIdx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-800/50 relative">
                  <button
                    type="button"
                    onClick={() => removeSubService(subIdx)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Sub-Service Title *</label>
                      <input value={sub.title} onChange={(e) => updateSubService(subIdx, "title", e.target.value)} required className={inputCls} placeholder="e.g. Loan Assistance" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Short Description</label>
                      <input value={sub.desc} onChange={(e) => updateSubService(subIdx, "desc", e.target.value)} className={inputCls} placeholder="Brief description..." />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">Items (bullet points)</label>
                    <div className="space-y-2">
                      {sub.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-2">
                          <input
                            value={item}
                            onChange={(e) => updateItem(subIdx, itemIdx, e.target.value)}
                            className={inputCls}
                            placeholder={`Item ${itemIdx + 1}`}
                          />
                          {sub.items.length > 1 && (
                            <button type="button" onClick={() => removeItem(subIdx, itemIdx)} className="text-gray-400 hover:text-red-500 shrink-0">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => addItem(subIdx)} className="text-xs text-brand-500 hover:text-brand-700 flex items-center gap-1 mt-1">
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:opacity-50 font-medium text-sm"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Service"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/services/all")}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditService;
