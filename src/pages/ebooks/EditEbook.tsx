import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    BookOpen,
    FileText,
    DollarSign,
    Image,
    ArrowRight,
    CheckCircle,
    Loader2,
    AlertCircle,
    Type,
    User,
    Upload,
    Save
} from "lucide-react";
import { fetchEbookById, updateEbook } from "../../store/slices/ebook";
import CategorySubcategoryDropdowns from "../../components/CategorySubcategoryDropdowns";
import PopupAlert from "../../components/popUpAlert";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const VITE_IMAGE_URL = import.meta.env.VITE_BASE_URL;

const FileUpload = ({
    label,
    accept,
    onFileChange,
    currentFile,
    existingUrl,
    icon: Icon,
}: {
    label: string;
    accept: string;
    onFileChange: (file: File | null) => void;
    currentFile: File | null;
    existingUrl?: string;
    icon: React.ComponentType<{ className?: string }>;
}) => {
    const [dragOver, setDragOver] = useState(false);

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Icon className="w-5 h-5 text-indigo-600" />
                {label}
            </label>
            <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${dragOver ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) onFileChange(e.dataTransfer.files[0]); }}
            >
                <input type="file" accept={accept} onChange={(e) => onFileChange(e.target.files?.[0] || null)} className="hidden" id={`file-${label}`} />
                <label htmlFor={`file-${label}`} className="cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">Drop file or <span className="text-indigo-600">browse</span></p>
                </label>
                {currentFile ? (
                    <div className="mt-3 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-xs text-indigo-700">
                        New: {currentFile.name}
                    </div>
                ) : existingUrl ? (
                    <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs flex items-center justify-center gap-2">
                        <span>Current File exists</span>
                        {accept === "image/*" && <img src={VITE_IMAGE_URL + "/" + existingUrl} className="w-8 h-8 rounded object-cover" alt="" />}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const EditEbook = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state: any) => state.ebook);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "",
        subCategoryId: "",
        price: "",
        salePrice: "",
        currency: "INR",
        isFree: false,
        author: "",
        isPublished: true,
        thumbnailUrl: "",
        previewFileUrl: "",
        fullFileUrl: "",
    });

    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [fullFile, setFullFile] = useState<File | null>(null);

    const [alert, setAlert] = useState({ isVisible: false, message: "", type: "" });
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchEbook = async () => {
            try {
                const ebook = await (dispatch as any)(fetchEbookById(id!)).unwrap();
                setFormData({
                    title: ebook.title || "",
                    description: ebook.description || "",
                    categoryId: ebook.categoryId?._id || ebook.categoryId || "",
                    subCategoryId: ebook.subCategoryId?._id || ebook.subCategoryId || "",
                    price: ebook.price?.$numberDecimal || ebook.price || "",
                    salePrice: ebook.salePrice?.$numberDecimal || ebook.salePrice || "",
                    currency: ebook.currency || "INR",
                    isFree: ebook.isFree || false,
                    author: ebook.author || "",
                    isPublished: ebook.isPublished ?? true,
                    thumbnailUrl: ebook.thumbnail,
                    previewFileUrl: ebook.previewFile,
                    fullFileUrl: ebook.fullFile,
                });
            } catch (err: any) {
                setAlert({ isVisible: true, message: "Failed to fetch ebook data", type: "error" });
            } finally {
                setIsFetching(false);
            }
        };
        fetchEbook();
    }, [id, dispatch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as any).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.categoryId) {
            setAlert({ isVisible: true, message: "Title and Category are required.", type: "error" });
            return;
        }

        const submitData = new FormData();
        // Only append fields that have values
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== "thumbnailUrl" && key !== "previewFileUrl" && key !== "fullFileUrl") {
                submitData.append(key, String(value));
            }
        });

        if (thumbnail) submitData.append("thumbnail", thumbnail);
        if (previewFile) submitData.append("previewFile", previewFile);
        if (fullFile) submitData.append("fullFile", fullFile);

        try {
            await (dispatch as any)(updateEbook({ id: id!, data: submitData })).unwrap();
            setAlert({ isVisible: true, message: "Ebook updated successfully!", type: "success" });
            setTimeout(() => navigate("/ebooks/all"), 2000);
        } catch (err: any) {
            setAlert({ isVisible: true, message: err || "Failed to update ebook", type: "error" });
        }
    };

    if (isFetching) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

    return (
        <div>
            <PageMeta title="Edit Ebook | LMS Admin" description="Update ebook details" />
            <PageBreadcrumb pageTitle="Edit Ebook" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-6 py-8 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Type className="w-5 h-5 text-indigo-600" /> Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full border rounded-xl px-4 py-3 dark:bg-gray-900"
                                placeholder="Ebook title"
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" /> Author
                            </label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                className="w-full border rounded-xl px-4 py-3 dark:bg-gray-900"
                                placeholder="Author name"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" /> Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full border rounded-xl px-4 py-3 dark:bg-gray-900"
                            placeholder="Ebook description"
                        />
                    </div>

                    <CategorySubcategoryDropdowns
                        selectedCategoryId={formData.categoryId}
                        selectedSubcategoryId={formData.subCategoryId}
                        onCategoryChange={(id) => setFormData(prev => ({ ...prev, categoryId: id, subCategoryId: "" }))}
                        onSubcategoryChange={(id) => setFormData(prev => ({ ...prev, subCategoryId: id }))}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-indigo-600" /> Price
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full border rounded-xl px-4 py-3 dark:bg-gray-900"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-indigo-600" /> Sale Price
                            </label>
                            <input
                                type="number"
                                name="salePrice"
                                value={formData.salePrice}
                                onChange={handleInputChange}
                                className="w-full border rounded-xl px-4 py-3 dark:bg-gray-900"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-10">
                            <input
                                type="checkbox"
                                name="isFree"
                                id="isFree"
                                checked={formData.isFree}
                                onChange={handleInputChange}
                                className="w-5 h-5 accent-indigo-600"
                            />
                            <label htmlFor="isFree" className="text-sm font-semibold text-gray-700">Is Free?</label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FileUpload label="Thumbnail" accept="image/*" icon={Image} onFileChange={setThumbnail} currentFile={thumbnail} existingUrl={formData.thumbnailUrl} />
                        <FileUpload label="Preview File (PDF)" accept=".pdf" icon={BookOpen} onFileChange={setPreviewFile} currentFile={previewFile} existingUrl={formData.previewFileUrl} />
                        <FileUpload label="Full Ebook File" accept=".pdf,.epub" icon={Upload} onFileChange={setFullFile} currentFile={fullFile} existingUrl={formData.fullFileUrl} />
                    </div>

                    <div className="flex items-center gap-4 pt-6 text-gray-700">
                        <input type="checkbox" name="isPublished" id="isPublished" checked={formData.isPublished} onChange={handleInputChange} className="w-5 h-5 accent-indigo-600" />
                        <label htmlFor="isPublished" className="font-semibold">Published</label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Update Ebook
                    </button>
                </form>
            </div>

            {alert.isVisible && (
                <PopupAlert
                    message={alert.message}
                    type={alert.type as any}
                    isVisible={alert.isVisible}
                    onClose={() => setAlert({ ...alert, isVisible: false })}
                />
            )}
        </div>
    );
};

export default EditEbook;
