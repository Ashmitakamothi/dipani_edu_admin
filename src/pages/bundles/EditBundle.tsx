import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../../store/slices/course";
import {
  fetchCourseBundleById,
  updateCourseBundle,
} from "../../store/slices/courseBundle";
import { RootState } from "../../hooks/redux";
import QuillEditor from "../../components/QuillEditor";
import { ChevronDown, X, Check, CheckCircle, XCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch } from "../../store";

const MultiSelectDropdown = ({
  courses,
  selectedCourses,
  onChange,
  loading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCourses =
    courses?.courses?.filter((course) =>
      (course.title || course.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ) || [];

  const handleCourseToggle = (courseId) => {
    const newSelection = selectedCourses.includes(courseId)
      ? selectedCourses.filter((id) => id !== courseId)
      : [...selectedCourses, courseId];
    onChange(newSelection);
  };

  const removeCourse = (courseId) => {
    onChange(selectedCourses.filter((id) => id !== courseId));
  };

  return (
    <div className="relative" ref={dropdownRef}>
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
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
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
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex sm:flex-row items-center sm:items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-700">
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
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
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
              filteredCourses.map((course) => {
                const courseId = course._id || course.id;
                const courseName =
                  course.title || course.name || "Untitled Course";
                const isSelected = selectedCourses.includes(courseId);
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
                          : "text-gray-700"
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
    <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center  justify-center z-9999">
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

const EditBundleForm = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  // Get all params from URL and extract the id
  const params = useParams();
  const id = params.id || params.bundleId; // Support both 'id' and 'bundleId' param names

  console.log("All URL params:", params);
  console.log("EditBundleForm ID:", id);
  console.log("Current URL:", window.location.pathname);

  const {
    loading: bundleLoading,
    error: bundleError,
    data: bundleData,
  } = useSelector((state: RootState) => state.courseBundle);
  const { data: courses, loading: coursesLoading } = useSelector(
    (state: RootState) => state.course
  );

  console.log("Courses data:", courses);
  console.log("Bundle data:", bundleData);

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
    courses: [],
    certificate: false,
    featured: false,
    downloadable: false,
    popular: false,
    private: false,
    tags: "",
    seoTitle: "",
    seoDescription: "",
    accessType: "lifetime",
    accessPeriod: "",
  });

  const [files, setFiles] = useState({
    thumbnail: null,
    banner: null,
  });

  const [selectedCourses, setSelectedCourses] = useState([]);

  // Fetch courses and bundle data
  useEffect(() => {
    console.log("Fetching courses...");
    dispatch(fetchCourses({ page: 1, limit: 100 })); // Fetch more courses for dropdown

    if (id && id !== "undefined") {
      console.log("Fetching bundle with ID:", id);
      dispatch(fetchCourseBundleById(id));
    } else {
      console.warn("No bundle ID provided or ID is undefined");
    }
  }, [dispatch, id]);

  // Populate form when bundle data is loaded
  useEffect(() => {
    console.log("Bundle data updated:", bundleData);
    console.log("Current bundle ID:", id);

    if (bundleData && id && id !== "undefined") {
      console.log("Populating form with bundle data");

      setFormData({
        title: bundleData.title || "",
        subtitle: bundleData.subtitle || "",
        slug: bundleData.slug || "",
        description: bundleData.description || "",
        language: bundleData.language || "English",
        level: bundleData.level || "Beginner",
        price: bundleData.price || "",
        discount: bundleData.discount || "",
        currency: bundleData.currency || "INR",
        courses: bundleData.courses?.map((c: any) => c._id || c.id) || [],
        certificate: !!bundleData.certificate,
        featured: !!bundleData.featured,
        downloadable: !!bundleData.downloadable,
        popular: !!bundleData.popular,
        private: !!bundleData.private,
        tags: Array.isArray(bundleData.tags)
          ? bundleData.tags.join(", ")
          : bundleData.tags || "",
        seoTitle: bundleData.seoTitle || "",
        seoDescription: bundleData.seoDescription || "",
        accessType: bundleData.accessType || "lifetime",
        accessPeriod: bundleData.accessPeriod || "",
      });

      const courseIds =
        bundleData.courses?.map((c: any) => c._id || c.id) || [];
      setSelectedCourses(courseIds);
      console.log("Selected courses set to:", courseIds);
    }
  }, [bundleData, id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles((prev) => ({
      ...prev,
      [name]: fileList[0],
    }));
  };

  const handleSubmit = async () => {
    if (!id || id === "undefined") {
      setPopup({
        show: true,
        type: "error",
        title: "Error!",
        message: "Bundle ID is missing. Cannot update bundle.",
      });
      return;
    }

    if (selectedCourses.length === 0) {
      setPopup({
        show: true,
        type: "error",
        title: "Error!",
        message: "Please select at least one course.",
      });
      return;
    }

    const bundleFormData = new FormData();

    // Add bundle ID for update
    bundleFormData.append("id", id);

    // Add form data
    Object.keys(formData).forEach((key) => {
      if (key === "courses") return;
      if (key === "tags") {
        const tagsArray = formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
        tagsArray.forEach((tag) => {
          bundleFormData.append("tags", tag);
        });
      } else {
        bundleFormData.append(key, formData[key]);
      }
    });

    // Add selected courses
    selectedCourses.forEach((courseId) => {
      bundleFormData.append("courses", courseId);
    });

    // Add files
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        bundleFormData.append(key, files[key]);
      }
    });

    try {
      await dispatch(
        updateCourseBundle({ id, formData: bundleFormData })
      ).unwrap();

      // Show success popup
      setPopup({
        show: true,
        type: "success",
        title: "Success!",
        message: "Bundle updated successfully!",
      });

      // Navigate after a short delay
      setTimeout(() => {
        navigate("/bundles/all");
      }, 2000);
    } catch (error: any) {
      console.error("Error updating bundle:", error);

      // Show error popup
      setPopup({
        show: true,
        type: "error",
        title: "Error!",
        message: error?.message || "Error updating bundle. Please try again.",
      });
    }
  };

  // Show error if no ID is found
  if (!id || id === "undefined") {
    return (
      <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error: Bundle ID not found</h3>
          <p>
            No bundle ID was provided in the URL. Please check your route
            configuration.
          </p>
          <p className="mt-2 text-sm">
            Current URL: {window.location.pathname}
          </p>
          <p className="text-sm">URL Parameters: {JSON.stringify(params)}</p>
        </div>
        <button
          onClick={() => navigate("/bundles/all")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Bundles
        </button>
      </div>
    );
  }

    return (
        <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Edit Course Bundle {id && `(ID: ${id})`}
            </h2>
            
            {bundleError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    Error: {bundleError}
                </div>
            )}
            
            {bundleLoading && (
                <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                    Loading bundle data...
                </div>
            )}
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Complete Solar Energy Design Master Bundle"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subtitle
                        </label>
                        <input
                            type="text"
                            name="subtitle"
                            value={formData.subtitle}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Master 3 solar courses in one"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug *
                    </label>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="complete-solar-bundle"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <QuillEditor
                        value={formData.description}
                        onChange={(value: string) => setFormData(prev => ({ ...prev, description: value }))}
                        placeholder="This bundle includes beginner to advanced courses..."
                        height="200px"
                        toolbar="full"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Courses *
                    </label>
                    <MultiSelectDropdown
                        courses={courses}
                        selectedCourses={selectedCourses}
                        onChange={setSelectedCourses}
                        loading={coursesLoading}
                    />
                    {selectedCourses.length === 0 && (
                        <p className="text-sm text-red-600 mt-1">Please select at least one course</p>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                        </label>
                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Spanish">Spanish</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Level
                        </label>
                        <select
                            name="level"
                            value={formData.level}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                        </label>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="INR">INR</option>
                            {/* <option value="USD">USD</option>
                            <option value="EUR">EUR</option> */}
                        </select>
                    </div>
                </div>
                
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
                            min={0}
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
                            // Ensure number is between 0 and 100
                            let numericValue = Number(value);
                            if (isNaN(numericValue)) value = '0';
                            if (numericValue > 100) value = '100';
                            if (numericValue < 0) value = '0';
                        
                            setFormData(prev => ({
                              ...prev,
                              discount: value
                            }));
                          }}
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            if (input.validity.rangeOverflow) input.value = '100';
                            if (input.validity.rangeUnderflow) input.value = '0';
                          }}
                          min={0}
                          max={100}
                          step="any"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="10"
                        />

                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thumbnail
                        </label>
                        <input
                            type="file"
                            name="thumbnail"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {(files.thumbnail || bundleData?.thumbnail) && (
                            <div className="mt-2">
                                <img
                                    src={files.thumbnail ? URL.createObjectURL(files.thumbnail) : `${import.meta.env.VITE_BASE_URL_ADMIN}/${bundleData?.thumbnail}`}
                                    alt="Thumbnail preview"
                                    className="w-32 h-20 object-cover rounded-md border"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Banner
                        </label>
                        <input
                            type="file"
                            name="banner"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {(files.banner || bundleData?.banner) && (
                            <div className="mt-2">
                                <img
                                    src={files.banner ? URL.createObjectURL(files.banner) : `${import.meta.env.VITE_BASE_URL_ADMIN}/${bundleData?.banner}`}
                                    alt="Banner preview"
                                    className="w-32 h-20 object-cover rounded-md border"
                                />
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['certificate', 'featured', 'downloadable', 'popular', 'private'].map((field) => (
                        <div key={field} className="flex items-center">
                            <input
                                type="checkbox"
                                name={field}
                                id={field}
                                checked={(formData as any)[field]}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            <label htmlFor={field} className="text-sm font-medium text-gray-700 capitalize">
                                {field}
                            </label>
                        </div>
                    ))}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma-separated)
                    </label>
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="solar, engineering, renewable"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            SEO Title
                        </label>
                        <input
                            type="text"
                            name="seoTitle"
                            value={formData.seoTitle}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Solar Energy Design Course Bundle"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            SEO Description
                        </label>
                        <textarea
                            name="seoDescription"
                            value={formData.seoDescription}
                            onChange={handleInputChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Get 3-in-1 solar courses and start your career in renewable energy."
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Type
                    </label>
                    <select
                      name="accessType"
                      value={formData.accessType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="lifetime">Lifetime</option>
                      <option value="limited">Limited</option>
                    </select>
                  </div>
                  {formData.accessType === "limited" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Period (days)
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
                
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/bundles/all')}
                        className="px-6 py-3 rounded-md font-medium bg-gray-500 hover:bg-gray-600 text-white transition duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={bundleLoading || selectedCourses.length === 0}
                        className={`px-6 py-3 rounded-md font-medium ${
                            bundleLoading || selectedCourses.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        } text-white transition duration-200`}
                    >
                        {bundleLoading ? 'Updating Bundle...' : 'Update Bundle'}
                    </button>
                </div>
            </div>
            
            {/* Custom Popup */}
            <CustomPopup 
                popup={popup} 
                onClose={() => setPopup(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

export default EditBundleForm;
