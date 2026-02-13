import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateModule, getModuleById } from "../../store/slices/module";

const EditModulePopup = ({ module, courseId, onClose, onModuleUpdated }) => {
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        title: module.title || "",
        description: module.description || "",
        order: module.order || 1,
        estimatedDuration: module.estimatedDuration ?? 60,
        isPublished: module.isPublished ?? false,
    });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Update form state when module prop changes (show initial values immediately)
    useEffect(() => {
        setForm({
            title: module.title || "",
            description: module.description || "",
            order: module.order || 1,
            estimatedDuration: module.estimatedDuration ?? 60,
            isPublished: module.isPublished ?? false,
        });
    }, [module]);

    useEffect(() => {
        const fetchModule = async () => {
            setLoading(true);
            setError("");
            try {
                const token = localStorage.getItem("token") || "";
                const result = await dispatch(getModuleById({ moduleId: module._id, token })).unwrap();
                const data = result.data || result;
                setForm({
                    title: data.title || "",
                    description: data.description || "",
                    order: data.order || 1,
                    estimatedDuration: data.estimatedDuration ?? 60,
                    isPublished: data.isPublished ?? false,
                });
            } catch (e) {
                setError("Failed to fetch module details");
            } finally {
                setLoading(false);
            }
        };
        fetchModule();
        // eslint-disable-next-line
    }, [module._id, dispatch]);

    const handleSave = async () => {
        if (!form.title.trim()) {
            setError("Module title is required");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const payload = {
                moduleId: module._id,
                courseId,
                title: form.title,
                description: form.description,
                order: form.order || 1,
                estimatedDuration: form.estimatedDuration,
                isPublished: form.isPublished,
            };
            await dispatch(updateModule(payload)).unwrap();
            if (onModuleUpdated) onModuleUpdated();
            onClose();
        } catch (e) {
            setError("Failed to update module");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        setError("");
        try {
            const payload = {
                moduleId: module._id,
                courseId,
                title: form.title,
                description: form.description,
                order: form.order || 1,
                estimatedDuration: form.estimatedDuration,
                isPublished: false, // Mark as unpublished (deleted)
            };
            await dispatch(updateModule(payload)).unwrap();
            if (onModuleUpdated) onModuleUpdated();
            onClose();
        } catch (e) {
            setError("Failed to delete module");
        } finally {
            setSaving(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    onClick={() => {
                        setError(""); // Clear error on close
                        onClose();
                    }}
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Edit Module</h3>
                    <button
                        title="Delete Module"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={saving || loading}
                    >
                        <Trash2 className="w-6 h-6" />
                    </button>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Loading...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                rows={3}
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Estimated Duration (minutes)</label>
                            <input
                                type="number"
                                value={form.estimatedDuration}
                                onChange={e => setForm({ ...form, estimatedDuration: parseInt(e.target.value) || 60 })}
                                className="w-full border rounded px-3 py-2"
                                min={1}
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Module Order</label>
                            <input
                                type="number"
                                value={form.order || 1}
                                onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
                                className="w-full border rounded px-3 py-2"
                                min={1}
                                disabled={saving}
                            />
                        </div>
                        {error && <div className="text-red-600 text-sm">{error}</div>}
                    </div>
                )}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => {
                            setError(""); // Clear error on close
                            onClose();
                        }}
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                        disabled={saving || loading}
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full">
                            <h4 className="text-lg font-semibold mb-2 text-red-700">Delete Module</h4>
                            <p className="mb-4">Are you sure you want to delete this module?</p>
                            <div className="flex justify-end gap-2">
                                <button
                                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                    onClick={handleDelete}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditModulePopup;



