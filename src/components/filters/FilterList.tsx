import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import toast from "react-hot-toast";
import {
  fetchFilter,
  updateFilter,
  deleteFilter,
  fetchSubcategoriesByCategory,
} from "../../store/slices/filter";
import { fetchCourseCategories } from "../../store/slices/courseCategorySlice";
import {
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Minus,
} from "lucide-react";

interface FilterItem {
  _id: string;
  title: string;
  category: any;
  subCategory: any;
  language: string;
  filterOptions: any[];
  createdAt: string;
  updatedAt: string;
}

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  categoryId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

// Edit Modal Component
const EditFilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filter: FilterItem | null;
  onSuccess: () => void;
}> = ({ isOpen, onClose, filter, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    language: "",
    category: "",
    subCategory: "",
    filterOptions: [] as string[],
  });
  const [newOption, setNewOption] = useState("");

  // Get categories and subcategories from store
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useAppSelector((state) => state.courseCategory);
  const {
    data: filterData,
    loading: subcategoriesLoading,
    error: subcategoriesError,
  } = useAppSelector((state) => state.filter);
  const subcategories: SubCategory[] = filterData?.subcategories || [];

  // Fetch categories on modal open
  useEffect(() => {
    if (isOpen) {
      dispatch(
        fetchCourseCategories({
          page: 0,
          limit: 1000,
          filters: {
            status: "active",
            isDeleted: false,
          },
        })
      );
    }
  }, [dispatch, isOpen]);

  // Set form data when filter changes
  useEffect(() => {
    if (filter) {
      const categoryId =
        typeof filter.category === "string"
          ? filter.category
          : filter.category?._id || "";
      const subCategoryId =
        typeof filter.subCategory === "string"
          ? filter.subCategory
          : filter.subCategory?._id || "";

      setFormData({
        title: filter.title || "",
        language: filter.language || "",
        category: categoryId,
        subCategory: subCategoryId,
        filterOptions: Array.isArray(filter.filterOptions)
          ? filter.filterOptions.map((opt) =>
              typeof opt === "string"
                ? opt
                : opt.name || opt.title || String(opt)
            )
          : [],
      });

      // Fetch subcategories if category is selected
      if (categoryId) {
        dispatch(fetchSubcategoriesByCategory(categoryId));
      }
    }
  }, [filter, dispatch]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      dispatch(fetchSubcategoriesByCategory(formData.category));
    }
  }, [dispatch, formData.category]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setFormData({
      ...formData,
      category: categoryId,
      subCategory: "", // Reset subcategory when category changes
    });
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      subCategory: e.target.value,
    });
  };

  const handleAddOption = () => {
    if (
      newOption.trim() &&
      !formData.filterOptions.includes(newOption.trim())
    ) {
      setFormData({
        ...formData,
        filterOptions: [...formData.filterOptions, newOption.trim()],
      });
      setNewOption("");
    } else if (formData.filterOptions.includes(newOption.trim())) {
      toast.error("Option already exists");
    }
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = formData.filterOptions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      filterOptions: updatedOptions,
    });
  };

  const handleEditOption = (index: number, newValue: string) => {
    if (newValue.trim()) {
      // Check if the new value already exists (excluding current index)
      const exists = formData.filterOptions.some(
        (option, i) =>
          i !== index && option.toLowerCase() === newValue.trim().toLowerCase()
      );

      if (exists) {
        toast.error("Option already exists");
        return;
      }

      const updatedOptions = [...formData.filterOptions];
      updatedOptions[index] = newValue.trim();
      setFormData({
        ...formData,
        filterOptions: updatedOptions,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filter) return;

    if (formData.filterOptions.length === 0) {
      toast.error("At least one filter option is required");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (!formData.subCategory) {
      toast.error("Please select a subcategory");
      return;
    }

    setIsUpdating(true);
    try {
      await dispatch(
        updateFilter({
          id: filter._id,
          data: {
            title: formData.title,
            language: formData.language,
            category: formData.category, // Send ID, not name
            subCategory: formData.subCategory, // Send ID, not name
            filterOptions: formData.filterOptions,
          },
        })
      ).unwrap();

      toast.success("Filter updated successfully", {
        position: "top-right",
        duration: 3000,
        style: {
          background: "#10B981",
          color: "#fff",
        },
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update filter");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category?.name || "";
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find(
      (subcat) => subcat._id === subcategoryId
    );
    return subcategory?.name || "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Filter
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Update filter information and options
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter filter title"
                  required
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={handleCategoryChange}
                  disabled={categoriesLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>
                  {categories?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoriesError && (
                  <p className="mt-1 text-sm text-red-600">
                    Error loading categories: {categoriesError}
                  </p>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subCategory}
                  onChange={handleSubcategoryChange}
                  disabled={!formData.category || subcategoriesLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">
                    {!formData.category
                      ? "Please select a category first"
                      : subcategoriesLoading
                      ? "Loading subcategories..."
                      : subcategories.length === 0
                      ? "No subcategories available"
                      : "Select a subcategory"}
                  </option>
                  {Array.isArray(subcategories) &&
                    subcategories?.length > 0 &&
                    subcategories.map(
                      (subcategory) =>
                        subcategory &&
                        subcategory._id && (
                          <option key={subcategory._id} value={subcategory._id}>
                            {subcategory.name ?? "Unnamed Subcategory"}
                          </option>
                        )
                    )}
                </select>
                {subcategoriesError && (
                  <p className="mt-1 text-sm text-red-600">
                    Error loading subcategories: {subcategoriesError}
                  </p>
                )}
              </div>

              {/* Current Selection Display */}
              {(formData.category || formData.subCategory) && (
                <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Current Selection:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.category && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Category: {getCategoryName(formData.category)}
                      </span>
                    )}
                    {formData.subCategory && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        Subcategory: {getSubcategoryName(formData.subCategory)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Filter Options Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filter Options <span className="text-red-500">*</span>
                </label>

                {/* Add New Option */}
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add new option..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    disabled={!newOption.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Existing Options */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Options ({formData.filterOptions.length})
                    </h4>
                    {formData.filterOptions.length > 0 && (
                      <span className="text-xs text-gray-500">
                        Click on any option to edit
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.filterOptions.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                          <Filter className="w-8 h-8 mx-auto" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          No options added yet
                        </p>
                        <p className="text-gray-400 text-xs">
                          Add your first option above
                        </p>
                      </div>
                    ) : (
                      formData.filterOptions.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 group bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-600">
                              {index + 1}
                            </span>
                          </div>
                          <EditableOption
                            value={option}
                            onSave={(newValue) =>
                              handleEditOption(index, newValue)
                            }
                            onCancel={() => {}}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded"
                            title="Remove option"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || formData.filterOptions.length === 0}
                className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4" />
                    Update Filter
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Editable Option Component
const EditableOption: React.FC<{
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}> = ({ value, onSave, onCancel }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
    setEditValue(value);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
    onCancel();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onBlur={handleSave}
          autoFocus
          className="flex-1 px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    );
  }

  return (
    <div
      className="flex-1 px-3 py-2 text-sm bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value}
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  filter: FilterItem | null;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, filter, isDeleting }) => {
  if (!isOpen || !filter) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Filter
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete filter{" "}
              <strong className="text-gray-900">"{filter.title}"</strong>?
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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

const FilterList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.filter);

  // Extract filters and pagination from data
  const filters = data?.filters || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [filterToEdit, setFilterToEdit] = useState<FilterItem | null>(null);
  const [filterToDelete, setFilterToDelete] = useState<FilterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  // Fetch filters
  useEffect(() => {
    const fetchParams = {
      page: pagination.page,
      limit: pagination.limit,
      sort: { createdAt: "desc" },
      searchFields: searchQuery ? { title: searchQuery } : {},
      ...localFilters,
    };

    dispatch(fetchFilter(fetchParams));
  }, [dispatch, pagination.page, pagination.limit, searchQuery, localFilters]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      const fetchParams = {
        page: newPage,
        limit: pagination.limit,
        sort: { createdAt: "desc" },
        searchFields: searchQuery ? { title: searchQuery } : {},
        ...localFilters,
      };
      dispatch(fetchFilter(fetchParams));
    }
  };

  const handleLimitChange = (newLimit: number) => {
    const fetchParams = {
      page: 1,
      limit: newLimit,
      sort: { createdAt: "desc" },
      searchFields: searchQuery ? { title: searchQuery } : {},
      ...localFilters,
    };
    dispatch(fetchFilter(fetchParams));
  };

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...localFilters };
    if (key === "language") {
      if (value === "") {
        delete updated.language;
      } else {
        updated.language = value;
      }
    } else {
      updated[key] = value;
    }
    setLocalFilters(updated);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setLocalFilters({});
  };

  const openEditModal = (filter: FilterItem) => {
    setFilterToEdit(filter);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setFilterToEdit(null);
    setEditModalOpen(false);
  };

  const handleEditSuccess = () => {
    // Refresh the filters list after successful edit
    const fetchParams = {
      page: pagination.page,
      limit: pagination.limit,
      sort: { createdAt: "desc" },
      searchFields: searchQuery ? { title: searchQuery } : {},
      ...localFilters,
    };
    dispatch(fetchFilter(fetchParams));
  };

  const openDeleteModal = (filter: FilterItem) => {
    setFilterToDelete(filter);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setFilterToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    if (filterToDelete) {
      setIsDeleting(true);
      try {
        await dispatch(
          deleteFilter({
            id: filterToDelete._id,
            data: {
              title: filterToDelete.title,
              language: filterToDelete.language,
              category: filterToDelete.category,
              subCategory: filterToDelete.subCategory,
              filterOptions: filterToDelete.filterOptions,
            },
          })
        ).unwrap();

        toast.success(`Filter "${filterToDelete.title}" deleted successfully`, {
          position: "top-right",
          duration: 3000,
          style: {
            background: "#10B981",
            color: "#fff",
          },
        });

        closeDeleteModal();

        // Refresh the filters list
        const fetchParams = {
          page: pagination.page,
          limit: pagination.limit,
          sort: { createdAt: "desc" },
          searchFields: searchQuery ? { title: searchQuery } : {},
          ...localFilters,
        };
        dispatch(fetchFilter(fetchParams));
      } catch (error: any) {
        console.error("Failed to delete filter:", error);
        toast.error(error?.message || "Failed to delete filter");
        setIsDeleting(false);
      }
    }
  };

  // Helper functions
  const renderFilterOptions = (filterOptions: any[]) => {
    if (!Array.isArray(filterOptions)) return "";

    return filterOptions
      .map((option: any, i: number) => {
        if (typeof option === "string") {
          return option;
        } else if (option && typeof option === "object") {
          return option.name || option.title || `Option ${i + 1}`;
        }
        return String(option);
      })
      .join(", ");
  };

  const renderCategoryName = (category: any) => {
    if (!category) return "";
    if (typeof category === "string") return category;
    if (typeof category === "object") return category.name || "";
    return String(category);
  };

  const renderSubCategoryName = (subCategory: any) => {
    if (!subCategory) return "";
    if (typeof subCategory === "string") return subCategory;
    if (typeof subCategory === "object") return subCategory.name || "";
    return String(subCategory);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.page;
    const maxPages = 5;

    const start = Math.max(1, current - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);

    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);

    return pages;
  };

  return (
    <div>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white dark:bg-white/[0.03] px-5 py-7 xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Filters
          </h1>
          <span className="text-gray-500 text-sm dark:text-white/70">
            Total: {pagination.total}
          </span>
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-white/[0.03] shadow p-4 rounded-md mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/90 dark:placeholder:text-white/80  placeholder:text-black/80  w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 text-black-400 dark:text-white/90 dark:placeholder:text-white/80  placeholder:text-black/80  rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={localFilters.language || ""}
                onChange={(e) => handleFilterChange("language", e.target.value)}
                className="border border-gray-300 text-black-400 dark:text-white/90 dark:placeholder:text-white/80  placeholder:text-black/80 rounded-md px-3 py-2 focus:ring-indigo-500"
              >
                <option className="dark:text-black" value="">
                  All Languages
                </option>
                <option className="dark:text-black" value="English">
                  English
                </option>
                <option className="dark:text-black" value="Hindi">
                  Hindi
                </option>
                <option className="dark:text-black" value="Spanish">
                  Spanish
                </option>
              </select>
            </div>

            {/* Limit */}
            <div className="flex items-center gap-2  ">
              <span className="text-sm dark:text-white/90">Show:</span>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="border border-gray-300 text-black-400 dark:text-white/90 dark:placeholder:text-white/80  placeholder:text-black/80 rounded-md px-3 py-2 focus:ring-indigo-500"
              >
                <option className="dark:text-black" value={5}>
                  5
                </option>
                <option className="dark:text-black" value={10}>
                  10
                </option>
                <option className="dark:text-black" value={20}>
                  20
                </option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:text-white/90 text-black dark:hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-white/[0.03] shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-white/[0.04]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/90 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/90 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/90 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/90 uppercase">
                  SubCategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/90 uppercase">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/90 uppercase">
                  Options
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/90 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-white/90 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-white/[0.03]">
              {filters.map((filter: FilterItem, idx: number) => (
                <tr key={filter._id || idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.06]">
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {(pagination.page - 1) * pagination.limit + idx + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white/90">
                    {filter.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">
                    {renderCategoryName(filter.category)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">
                    {renderSubCategoryName(filter.subCategory)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">
                    {filter.language}
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-gray-700 dark:text-white/70 max-w-xs truncate"
                    title={renderFilterOptions(filter.filterOptions || [])}
                  >
                    {renderFilterOptions(filter.filterOptions || [])}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-white/70">
                    {filter.createdAt
                      ? new Date(filter.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(filter)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(filter)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filters.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No filters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {generatePageNumbers().map((page, idx) =>
              typeof page === "number" ? (
                <button
                  key={idx}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    pagination.page === page
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={idx} className="px-2 text-gray-400">
                  {page}
                </span>
              )
            )}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditFilterModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        filter={filterToEdit}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        filter={filterToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default FilterList;
