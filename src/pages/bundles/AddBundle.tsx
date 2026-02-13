import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCourseBundle } from "../../store/slices/courseBundle";
import { fetchCourses } from "../../store/slices/course";
import { RootState } from "../../hooks/redux";
import QuillEditor from "../../components/QuillEditor";

import { ChevronDown, X, Check, CheckCircle, XCircle } from "lucide-react";

interface Course {
  _id: string;
  id?: string;
  title: string;
  name?: string;
}

interface MultiSelectDropdownProps {
  courses: {
    courses: Course[];
  };
  selectedCourses: string[];
  onChange: (courses: string[]) => void;
  loading: boolean;
}

const MultiSelectDropdown = ({
  courses,
  selectedCourses,
  onChange,
  loading,
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter courses based on search term
  const filteredCourses =
    courses?.courses?.filter((course: Course) =>
      (course.title || course.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ) || [];

  const handleCourseToggle = (courseId: string) => {
    const newSelection = selectedCourses.includes(courseId)
      ? selectedCourses.filter((id) => id !== courseId)
      : [...selectedCourses, courseId];

    onChange(newSelection);
  };

  const removeCourse = (courseId: string) => {
    onChange(selectedCourses.filter((id) => id !== courseId));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected courses display */}
      <div className="mb-2">
        <div className="flex flex-wrap gap-2">
          {selectedCourses.map((courseId) => {
            const course = courses?.courses?.find(
              (c: any) => (c._id || c.id) === courseId
            );
            const courseName =
              course?.title || course?.name || "Unknown Course";

            return (
              <span
                key={courseId}
                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-white/[0.03] text-blue-800 text-sm rounded-full"
              >
                {courseName}
                <button
                  type="button"
                  onClick={() => removeCourse(courseId)}
                  className="ml-2 hover:text-blue-600"
                >
                  <X size={14} />
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* Dropdown trigger */}
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-white/[0.03] dark:placeholder:text-white/90 cursor-pointer flex sm:flex-row items-center sm:items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-700 dark:text-white/90 ">
          {selectedCourses.length === 0
            ? "Select courses..."
            : `${selectedCourses.length} course${
                selectedCourses.length > 1 ? "s" : ""
              } selected`}
        </span>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border dark:bg-gray-800 border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:text-white/90 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-48">
            {loading ? (
              <div className="p-4 text-center text-gray-600">
                Loading courses...
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-4 text-center text-gray-600">
                {searchTerm ? "No courses found" : "No courses available"}
              </div>
            ) : (
              filteredCourses
                .map((course) => {
                  const courseId = course._id || course.id;
                  const courseName =
                    course.title || course.name || "Untitled Course";
                  const isSelected = courseId
                    ? selectedCourses.includes(courseId)
                    : false;

                  if (!courseId) return null;

                  return (
                    <div
                      key={courseId}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex sm:flex-row items-center sm:items-center justify-between gap-4 ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleCourseToggle(courseId)}
                    >
                      <span
                        className={`text-sm ${
                          isSelected
                            ? "text-blue-700 font-medium"
                            : "text-gray-700 dark:text-white/80"
                        }`}
                      >
                        {courseName}
                      </span>
                      {isSelected && (
                        <Check size={16} className="text-blue-600" />
                      )}
                    </div>
                  );
                })
                .filter(Boolean)
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Popup Component
const CustomPopup = ({
  popup,
  onClose,
}: {
  popup: {
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  };
  onClose: () => void;
}) => {
  if (!popup.show) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          {popup.type === "success" ? (
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 mr-3" />
          )}
          <h3
            className={`text-lg font-semibold ${
              popup.type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {popup.title}
          </h3>
        </div>
        <p className="text-gray-600 mb-6">{popup.message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md font-medium ${
              popup.type === "success"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white transition duration-200`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const AddBundleForm = () => {
  const dispatch = useDispatch();

  // Redux state
  const { loading: bundleLoading, error: bundleError } = useSelector(
    (state: RootState) => state.courseBundle
  );
  const { data: courses, loading: coursesLoading } = useSelector(
    (state: RootState) => state.course
  );
  console.log("Courses:", courses);

  // Popup state
  const [popup, setPopup] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    slug: "",
    description: "",
    language: "English",
    level: "Beginner",
    price: "",
    discount: "",
    currency: "INR",
    courses: [] as string[],
    certificate: false,
    featured: false,
    downloadable: false,
    popular: false,
    private: false,
    tags: "",
    seoTitle: "",
    seoDescription: "",
    accessPeriod: "",
    accessType: "lifetime",
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    thumbnail: null,
    banner: null,
  });

  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Fetch courses on component mount
  useEffect(() => {
    dispatch(fetchCourses({ page: 1, limit: 100 }) as any); // Fetch more courses for dropdown
  }, [dispatch]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    setFiles((prev) => ({
      ...prev,
      [name]: fileList?.[0] || null,
    }));
  };

  const handleSubmit = async () => {
    const bundleFormData = new FormData();

    // Append text fields
    Object.keys(formData).forEach((key) => {
      if (key === "courses") return; // Handle courses separately
      if (key === "tags") {
        // Split tags by comma and append each tag separately
        const tagsArray = formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
        tagsArray.forEach((tag) => {
          bundleFormData.append("tags", tag);
        });
      } else {
        bundleFormData.append(key, (formData as any)[key]);
      }
    });

    // Append selected courses
    selectedCourses.forEach((courseId) => {
      bundleFormData.append("courses", courseId);
    });

    // Append files
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        bundleFormData.append(key, files[key]);
      }
    });

    try {
      await (dispatch(createCourseBundle(bundleFormData)) as any).unwrap();

      // Show success popup
      setPopup({
        show: true,
        type: "success",
        title: "Success!",
        message: "Bundle created successfully!",
      });

      // Reset form
      setFormData({
        title: "",
        subtitle: "",
        slug: "",
        description: "",
        language: "English",
        level: "Beginner",
        price: "",
        discount: "",
        currency: "INR",
        courses: [],
        certificate: false,
        featured: false,
        downloadable: false,
        popular: false,
        private: false,
        tags: "",
        seoTitle: "",
        seoDescription: "",
        accessPeriod: "",
        accessType: "lifetime",
      });
      setFiles({
        thumbnail: null,
        banner: null,
      });
      setSelectedCourses([]);
    } catch (error: any) {
      console.error("Error creating bundle:", error);

      // Show error popup
      setPopup({
        show: true,
        type: "error",
        title: "Error!",
        message: error?.message || "Failed to create bundle. Please try again.",
      });
    }
  };

  return (
    <div className="mx-auto p-6 bg-white dark:bg-white/[0.03] shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white/90">
        Add Course Bundle
      </h2>

      {bundleError && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-white/[0.03 border border-red-400 text-red-700 rounded">
          Error: {bundleError}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 text-gray-400 dark:text-white/90 dark:placeholder:text-white/40  placeholder:text-black/80 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Complete Solar Energy Design Master Bundle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 text-gray-400 dark:text-white/90 dark:placeholder:text-white/40 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Master 3 solar courses in one"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 text-gray-400 dark:text-white/90 dark:placeholder:text-white/40 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="complete-solar-bundle"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
            Description
          </label>
          <QuillEditor
            value={formData.description}
            onChange={(value: string) =>
              setFormData((prev) => ({ ...prev, description: value }))
            }
            placeholder="This bundle includes beginner to advanced courses..."
            height="200px"
            toolbar="full"
          />
        </div>

        {/* Course Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
            Select Courses *
          </label>
          <MultiSelectDropdown
            courses={courses}
            selectedCourses={selectedCourses}
            onChange={setSelectedCourses}
            loading={coursesLoading}
          />
          {selectedCourses.length === 0 && (
            <p className="text-sm text-red-600 mt-1">
              Please select at least one course
            </p>
          )}
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Language
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:text-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:text-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option className="dark:text-black" value="Beginner">
                Beginner
              </option>
              <option className="dark:text-black" value="Intermediate">
                Intermediate
              </option>
              <option className="dark:text-black" value="Advanced">
                Advanced
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border dark:text-white/90 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option className="dark:text-black" value="INR">
                INR
              </option>
              {/* <option className="dark:text-black" value="USD">
                USD
              </option>
              <option className="dark:text-black" value="EUR">
                EUR
              </option> */}
            </select>
          </div>
        </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={e => {
                                let value = e.target.value;
                                // Allow only up to 2 decimal places
                                if (value.includes('.')) {
                                    const [intPart, decPart] = value.split('.');
                                    if (decPart.length > 2) {
                                        value = `${intPart}.${decPart.slice(0, 2)}`;
                                    }
                                }
                                setFormData(prev => ({
                                    ...prev,
                                    price: value
                                }));
                            }}
                            required
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="699"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount (%) (max 100)
                        </label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={e => {
                                let value = e.target.value;
                                // Only allow numbers between 0 and 100
                                if (Number(value) > 100) value = '100';
                                if (Number(value) < 0) value = '0';
                                setFormData(prev => ({
                                    ...prev,
                                    discount: value
                                }));
                            }}
                            min={0}
                            max={100}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="10"
                        />
                    </div>
                </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Thumbnail
            </label>
            <input
              type="file"
              name="thumbnail"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 text-black dark:text-white/90 dark:placeholder:text-white/40 placeholder:text-black/60 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Banner
            </label>
            <input
              type="file"
              name="banner"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 text-black dark:text-white/90 dark:placeholder:text-white/40 placeholder:text-black/60 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Boolean Options */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            "certificate",
            "featured",
            "downloadable",
            "popular",
            "private",
          ].map((field) => (
            <div key={field} className="flex items-center">
              <input
                type="checkbox"
                name={field}
                id={field}
                checked={(formData as any)[field]}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label
                htmlFor={field}
                className="text-sm font-medium text-gray-700 dark:text-white/90 capitalize"
              >
                {field}
              </label>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 text-black dark:text-white/90 dark:placeholder:text-white/40 placeholder:text-black/60 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="solar, engineering, renewable"
          />
        </div>

        {/* SEO Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              SEO Title
            </label>
            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 text-black dark:text-white/90 dark:placeholder:text-white/40 placeholder:text-black/60 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Solar Energy Design Course Bundle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90  mb-2">
              SEO Description
            </label>
            <textarea
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 text-black dark:text-white/90 dark:placeholder:text-white/40 placeholder:text-black/60 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Get 3-in-1 solar courses and start your career in renewable energy."
            />
          </div>
        </div>

        {/* Access Type & Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Access Type
            </label>
            <select
              name="accessType"
              value={formData.accessType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:text-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lifetime">Lifetime</option>
              <option value="limited">Limited</option>
            </select>
          </div>
          {formData.accessType === "limited" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
                Access Period 
              </label>
              <input
                type="String"
                name="accessPeriod"
                value={formData.accessPeriod}
                onChange={handleInputChange}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of days"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={bundleLoading || selectedCourses.length === 0}
            className={`px-6 py-3 rounded-md font-medium ${
              bundleLoading || selectedCourses.length === 0
                ? "bg-gray-400 dark:bg-white/90 dark:text-black cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white  transition duration-200`}
          >
            {bundleLoading ? "Creating Bundle..." : "Create Bundle"}
          </button>
        </div>
      </div>

      {/* Custom Popup */}
      <CustomPopup
        popup={popup}
        onClose={() => setPopup((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default AddBundleForm;
