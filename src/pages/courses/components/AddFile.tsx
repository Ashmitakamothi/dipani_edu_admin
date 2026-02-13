import React, { act, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BookOpen,
  FileText,
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { createAssignment } from "../../../store/slices/assignment"; // Adjust path as needed
import PopupAlert from "../../../components/popUpAlert";

interface AddAssignmentFormProps {
  onChange?: () => void;
  courseId: string;
  lessonId: string;
}

export default function AddFile({
  courseId,
  lessonId,
}: AddAssignmentFormProps) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: any) => state.assignment);

  const [formData, setFormData] = useState({
    language: "English",
    fileType: "",
    active: true,
    isPublic: true,
    downloadable: true,
    file: null as File | null,
    lessonId: lessonId,
    courseId: courseId,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "file" | "document"
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  const removeFile = (type: "file" | "document") => {
    setFormData((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const apiFormData = new FormData();
    apiFormData.append("courseId", courseId);
    apiFormData.append("lessonId", lessonId);

    try {
      const result = await dispatch(createAssignment(apiFormData) as any);
      if (createAssignment.fulfilled.match(result)) {
        // Show success popup
        setPopup({
          isVisible: true,
          message: "Assignment created successfully!",
          type: "success",
        });
        // setShowSuccess(true);
        setFormData({
          language: "English",
          fileType: "",
          active: true,
          isPublic: true,
          downloadable: true,
          file: null as File | null,
          lessonId: lessonId,
          courseId: courseId,
        });
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setPopup({
        isVisible: true,
        message: "Failed to create Assignment. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">
              Assignment created successfully!
            </p>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}
        {/* Header */}
        {/* Form */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          <div className="space-y-6">
            {/* Assignment Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Type*
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              >
                <option value="">Select Subject</option>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="VIDEO">VIDEO</option>
                <option value="IMAGE">IMAGE</option>
              </select>
            </div>

            {/* Subject and Language Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject*
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="A homework is to be completed on your course of CSS and research yourself that you've got this! Please send your homework as soon as possible. Regards."
                required
                disabled={loading}
              />
            </div>

            {/* Score and Duration Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score
                </label>
                <input
                  type="number"
                  name="score"
                  value={formData.score}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="100"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Score
                </label>
                <input
                  type="number"
                  name="maxScore"
                  value={formData.maxScore}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="250"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="60"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Materials */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials
              </label>
              <input
                type="text"
                name="materials"
                value={formData.materials}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Maximum 255 characters"
                maxLength={255}
                disabled={loading}
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {formData.file ? (
                    <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {formData.file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile("file")}
                        className="text-red-500 hover:text-red-700"
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Choose an attachment
                      </p>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, "file")}
                        className="hidden"
                        id="file-upload"
                        disabled={loading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Browse Files
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  {formData.document ? (
                    <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {formData.document.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile("document")}
                        className="text-red-500 hover:text-red-700"
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload document
                      </p>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, "document")}
                        className="hidden"
                        id="document-upload"
                        accept=".pdf,.doc,.docx,.txt"
                        disabled={loading}
                      />
                      <label
                        htmlFor="document-upload"
                        className={`inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Browse Documents
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className={`px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium flex items-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Saving..." : "Save Assignment"}
              </button>
            </div>
          </div>
        </div>{" "}
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
