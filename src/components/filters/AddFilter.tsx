import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { postFilter } from "../../store/slices/filter";
import toast, { Toaster } from "react-hot-toast";
import CategorySubcategoryDropdowns from "../CategorySubcategoryDropdowns"; // Adjust import path as needed
import PopupAlert from "../popUpAlert";

export default function AddFilter() {
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.filter);
      const [popup, setPopup] = useState({ isVisible: false, message: '', type: '' });


    const [form, setForm] = useState({
        language: "",
        categoryId: "",
        subCategoryId: "",
        title: "",
        filterOptions: [] as string[],
    });
    const [filterOptions, setFilterOptions] = useState<string[]>([]);
    const [optionInput, setOptionInput] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (categoryId: string, categoryName: string) => {
        setForm({ 
            ...form, 
            categoryId,
            // Reset subcategory when category changes
            subCategoryId: ""
        });
    };

    const handleSubcategoryChange = (subcategoryId: string, subcategoryName: string) => {
        setForm({ 
            ...form, 
            subCategoryId: subcategoryId
        });
    };

    const handleAddOption = () => {
        if (optionInput.trim()) {
            setFilterOptions([...filterOptions, optionInput.trim()]);
            setOptionInput("");
        }
    };

    const handleRemoveOption = (idx: number) => {
        setFilterOptions(filterOptions.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.language || !form.categoryId || !form.subCategoryId || !form.title) {
            toast.error("All fields are required.", { duration: 5000, position: "top-right" });
            return;
        }
        if (filterOptions.length === 0) {
            toast.error("At least one filter option is required.", { duration: 5000, position: "top-right" });
            return;
        }
        try {
            await dispatch(
                postFilter({
                    language: form.language,
                    category: form.categoryId,        // Pass ID instead of name
                    subCategory: form.subCategoryId,  // Pass ID instead of name
                    title: form.title,
                    filterOptions,
                })
            ).unwrap();
            setPopup({
    isVisible: true,
    message: 'Filter added successfully!',
    type: 'success'
  });
            setForm({ 
                language: "", 
                categoryId: "",
                subCategoryId: "",
                title: "",
                filterOptions: []
            });
            setFilterOptions([]);
            setOptionInput("");
        } catch (err: any) {
 setPopup({
    isVisible: true,
    message: 'Failed to add Filter . Please try again.',
    type: 'error'
  });        }
    };

    return (
        <div>
            <Toaster position="top-right" />
            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <div className="mx-auto w-full">
                    <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
                        Add New Filter
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Language <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="language"
                                value={form.language}
                                onChange={handleChange}
                                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Enter language"
                                required
                            />
                        </div>

                        {/* Category and Subcategory Dropdowns */}
                        <CategorySubcategoryDropdowns
                            selectedCategoryId={form.categoryId}
                            selectedSubcategoryId={form.subCategoryId}
                            onCategoryChange={handleCategoryChange}
                            onSubcategoryChange={handleSubcategoryChange}
                            disabled={loading}
                        />

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Enter filter title"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filter Options <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={optionInput}
                                    onChange={(e) => setOptionInput(e.target.value)}
                                    className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    placeholder="Add option"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="rounded bg-gray-300 px-4 py-2 text-gray-700 font-semibold hover:bg-gray-400 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    Add
                                </button>
                            </div>
                            <ul className="mt-2 space-y-1">
                                {filterOptions.map((opt, idx) => (
                                    <li key={idx} className="flex sm:flex-row items-center sm:items-center justify-between gap-4 bg-gray-100 dark:bg-gray-800 rounded px-3 py-1">
                                        <span>{opt}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(idx)}
                                            className="text-red-500 hover:text-red-700 focus:outline-none ml-2"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            type="submit"
                            className="rounded bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition"
                            disabled={loading}
                        >
                            {loading ? "Adding..." : "Add Filter"}
                        </button>
                        {error && <div className="text-red-500 mt-2">{error}</div>}
                    </form>
                </div>
            </div>
             <PopupAlert 
  message={popup.message}
  type={popup.type}
  isVisible={popup.isVisible}
  onClose={() => setPopup({ ...popup, isVisible: false })}
/>
        </div>
    );
}