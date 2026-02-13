import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTextLesson,
  fetchTextLessonById,
  updateTextLesson,
} from "../../../store/slices/textLesson";
import PopupAlert from "../../../components/popUpAlert";
import QuillEditor from "../../../components/QuillEditor";
import { 
  BookOpen, 
  Type, 
  FileText, 
  Upload, 
  Save, 
  X, 
  Globe, 
  Lock, 
  Eye, 
  EyeOff,
  Paperclip,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Clock,
  Menu
} from "lucide-react";

// Enhanced popup component similar to Files component
const EnhancedPopup = ({ isVisible, message, type, onClose, autoClose = true }) => {
  useEffect(() => {
    if (isVisible && autoClose && type === "success") {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, type, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800";
      case "error":
        return "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800";
      case "warning":
        return "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 text-amber-800";
      case "info":
        return "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "info":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-20">
      <div className={`w-full max-w-sm md:max-w-md rounded-xl border-2 p-4 md:p-6 shadow-xl transform transition-all duration-300 scale-100 ${getTypeStyles()}`}>
        <div className="flex items-start gap-3 md:gap-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {type === "success" && (
          <div className="mt-4 bg-white bg-opacity-60 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-green-700">
              <Clock className="w-4 h-4" />
              <span>Lesson saved successfully</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TextLessonEditor = ({
  section,
  lesson,
  onChange,
  courseId,
  lessonId,
  textLessonId,
  onClose,
}) => {
  console.log("TextLessonEditor props:", {
    section,
    lesson,
    onChange: !!onChange,
    courseId,
    lessonId,
    textLessonId,
    onClose: !!onClose
  });

  const dispatch = useDispatch();
  const { loading, error, data } = useSelector((state) => state.textLesson);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const [formData, setFormData] = useState({
    language: "English",
    title: "",
    bookTitle: "",
    accessibility: "free",
    attachments: [],
    summary: "",
    content: "",
  });

  const [titleCharCount, setTitleCharCount] = useState(0);
  const [bookTitleCharCount, setBookTitleCharCount] = useState(0);
  const [archive, setArchive] = useState(true);
  const [dropContent, setDropContent] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const quillRef = useRef(null);
  const [content, setContent] = useState("");

  const getData = useCallback(async () => {
    try {
      console.log("getData called - textLessonId:", textLessonId);
      console.log("textLessonId type:", typeof textLessonId);
      console.log("textLessonId truthy:", !!textLessonId);
      
      if (textLessonId && textLessonId !== 'undefined' && textLessonId !== '') {
        setIsEditMode(true);
        console.log("Attempting to fetch text lesson data for ID:", textLessonId);
        
        const response = await (dispatch as any)(
          fetchTextLessonById(textLessonId)
        ).unwrap();
        
        console.log("Fetch response:", response);
        const data = response?.data || response;
        
        if (data) {
          setFormData({
            language: data.language || "English",
            title: data.title || "",
            bookTitle: data.bookTitle || data.subTitle || "",
            accessibility: data.accessibility || "free",
            attachments: data.attachments || [],
            summary: data.summary || "",
            content: data.content || "",
          });
          console.log("Form data updated:", data);
        } else {
          console.warn("No data received from API");
        }
      } else {
        console.log("No textLessonId provided or invalid, staying in create mode");
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Error fetching text lesson data:", error);
      setPopup({
        isVisible: true,
        message: "Failed to load lesson data. Please try again.",
        type: "error",
      });
    }
  }, [textLessonId, dispatch]);

  useEffect(() => {
    console.log("useEffect triggered - textLessonId:", textLessonId);
    getData();
  }, [getData]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Handle successful save
  useEffect(() => {
    if (data && !loading && !error) {
      setSaveSuccess(true);
    }
  }, [data, loading, error]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "title") {
      setTitleCharCount(value.length);
    }
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      // Create FormData object for multipart/form-data
      const apiFormData = new FormData();

      // Append basic form fields
      apiFormData.append("language", formData.language);
      apiFormData.append("title", formData.title);
      apiFormData.append("subTitle", formData.bookTitle);
      apiFormData.append("accessibility", formData.accessibility);
      apiFormData.append("summary", formData.summary);
      apiFormData.append("content", formData.content);
      apiFormData.append("archive", archive.toString());
      apiFormData.append("dropContent", dropContent.toString());

      if (!isEditMode) {
        apiFormData.append("course", courseId);
        apiFormData.append("lessonId", lessonId);
      }
      // Append file attachments
      formData.attachments.forEach((file, index) => {
        if (file instanceof File) {
          apiFormData.append(`attachments[${index}]`, file);
        }
      });

      // Dispatch the async thunk
      if (isEditMode) {
        await dispatch(
          updateTextLesson({ lessonId: textLessonId, formData: apiFormData })
        ).unwrap();
      } else {
        await dispatch(createTextLesson(apiFormData)).unwrap();
      }
      // Show success popup

      onClose();
      setPopup({
        isVisible: true,
        message: "Text Lesson created successfully!",
        type: "success",
      });
    } catch (err) {
      setPopup({
        isVisible: true,
        message: "Failed to create Text Lesson. Please try again.",
        type: "error",
      });
      console.error("Failed to save lesson:", err);
    }
  };

  const handleCancel = () => {
    setFormData({
      language: "English",
      title: "",
      bookTitle: "",
      accessibility: "free",
      attachments: [],
      summary: "",
      content: "",
    });
    setTitleCharCount(0);
    if (onClose) onClose();
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto max-h-[600px]">
        {/* Enhanced Header - Responsive */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                    {isEditMode ? "Edit Text Lesson" : "Create New Text Lesson"}
                  </h2>
                  <p className="text-blue-100 text-xs sm:text-sm mt-1 hidden sm:block">
                    {isEditMode ? "Update lesson content and settings" : "Design engaging text-based learning content"}
                  </p>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-all duration-200"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                </button>
              )}
            </div>
          </div>

          {/* Content - Responsive */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 !pb-24 max-h-[700px] overflow-scroll">
            {/* Mobile/Tablet responsive grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Globe className="w-4 h-4" />
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange("language", e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base"
                    disabled={loading}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Type className="w-4 h-4" />
                    Lesson Title *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter an engaging lesson title"
                      maxLength={255}
                      disabled={loading}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-12 sm:pr-16 border-2 border-gray-200 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-50 text-sm sm:text-base"
                    />
                    <div className="absolute right-3 top-2 sm:top-3 text-xs text-gray-400">
                      {titleCharCount}/255
                    </div>
                  </div>
                </div>

                {/* Sub Title */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="w-4 h-4" />
                    Sub Title
                  </label>
                  <input
                    type="text"
                    value={formData.bookTitle}
                    onChange={(e) => handleInputChange("bookTitle", e.target.value)}
                    placeholder="Optional subtitle or description"
                    disabled={loading}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-50 text-sm sm:text-base"
                  />
                </div>

                {/* Accessibility - Responsive */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Lock className="w-4 h-4" />
                    Access Level
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <label className="relative">
                      <input
                        type="radio"
                        name="accessibility"
                        value="free"
                        checked={formData.accessibility === "free"}
                        onChange={(e) => handleInputChange("accessibility", e.target.value)}
                        disabled={loading}
                        className="sr-only"
                      />
                      <div className={`p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.accessibility === "free"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                          <div>
                            <div className="font-semibold text-sm sm:text-base">Free Access</div>
                            <div className="text-xs opacity-70">Available to everyone</div>
                          </div>
                        </div>
                      </div>
                    </label>
                    <label className="relative">
                      <input
                        type="radio"
                        name="accessibility"
                        value="paid"
                        checked={formData.accessibility === "paid"}
                        onChange={(e) => handleInputChange("accessibility", e.target.value)}
                        disabled={loading}
                        className="sr-only"
                      />
                      <div className={`p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.accessibility === "paid"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                          <div>
                            <div className="font-semibold text-sm sm:text-base">Premium</div>
                            <div className="text-xs opacity-70">Requires enrollment</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Attachments */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Paperclip className="w-4 h-4" />
                    Attachments
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-4 sm:p-6 bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      disabled={loading}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-blue-500" />
                      <span className="text-sm font-medium">Choose Files</span>
                      <span className="text-xs text-gray-400 mt-1 text-center">
                        Upload related documents or resources
                      </span>
                    </label>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {formData.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex sm:flex-row items-center sm:items-center justify-between gap-4 bg-white border border-gray-200 p-3 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">
                              {file.name || file.fileName}
                            </span>
                          </div>
                          <button
                            onClick={() => removeAttachment(index)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              
              </div>
            </div>

            {/* Summary - Full width on mobile */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" />
                Lesson Summary
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                rows={4}
                disabled={loading}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50 transition-all duration-200 text-sm sm:text-base"
                placeholder="Write a brief summary that will help students understand what they'll learn..."
              />
            </div>

            {/* Content Editor - Responsive height */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <BookOpen className="w-4 h-4" />
                Lesson Content *
              </label>
              <div className="min-h-[300px] sm:min-h-[400px]">
                <QuillEditor
                  value={formData.content}
                  onChange={(content) => handleInputChange("content", content)}
                  placeholder="Start writing your lesson content..."
                  height="300px"
                  toolbar="full"
                  className={loading ? "opacity-50 pointer-events-none" : ""}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Footer - Responsive */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-4 fixed bottom-0 w-full sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600 order-2 sm:order-1">
                <span className="text-red-500">*</span> Required fields
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isEditMode ? "Update Lesson" : "Create Lesson"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Popup - Responsive */}
      <EnhancedPopup
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ isVisible: false, message: "", type: "" })}
      />
    </>
  );
};

export default TextLessonEditor;