import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  File, 
  X, 
  ChevronDown, 
  FileText,
  Image,
  Video,
  Download,
  Eye,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  XCircle,
  Sparkles,
  FileUp,
  ExternalLink,
  Calendar,
  User,
  FileIcon
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadFile,
  fetchFileById,
  updateFile,
  clearFileState,
} from "../../../store/slices/files";

// Enhanced popup component with better animations
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
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full rounded-xl border-2 p-6 shadow-xl transform transition-all duration-300 scale-100 ${getTypeStyles()}`}>
        <div className="flex items-start gap-4">
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
              <span>File processing completed successfully</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Upload progress component
const UploadProgress = ({ isVisible, progress, fileName, stage }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <FileUp className="w-8 h-8 text-white animate-pulse" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Uploading File
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            {fileName}
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>{stage}</span>
            <span>{progress}%</span>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Sparkles className="w-4 h-4" />
              <span>Processing your file for optimal delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// File Preview Component
const FilePreview = ({ file, onDownload }) => {
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "PDF":
        return <FileText className="w-8 h-8 text-red-600" />;
      case "DOCX":
        return <FileText className="w-8 h-8 text-blue-600" />;
      case "IMAGE":
        return <Image className="w-8 h-8 text-green-600" />;
      case "VIDEO":
        return <Video className="w-8 h-8 text-purple-600" />;
      default:
        return <FileIcon className="w-8 h-8 text-gray-600" />;
    }
  };

  const getFileName = () => {
    if (file.filePath) {
      const pathParts = file.filePath.split(/[\\\/]/);
      return pathParts[pathParts.length - 1];
    }
    return "Unknown file";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Current File Preview
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            file.active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {file.active ? 'Active' : 'Inactive'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            file.isPublic 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {file.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            {getFileIcon(file.fileType)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate text-lg">
              {getFileName()}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {file.fileType} Document
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Uploaded {formatDate(file.createdAt)}</span>
              </div>
              {file.updatedAt !== file.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Updated {formatDate(file.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Language</span>
            </div>
            <span className="text-sm text-gray-600">{file.language}</span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Download</span>
            </div>
            <span className="text-sm text-gray-600">
              {file.downloadable ? 'Allowed' : 'Restricted'}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                File Information
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600">
                ID: {file._id}
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-blue-700">
            <p><strong>Course:</strong> {file.courseId?.title}</p>
            <p><strong>Lesson:</strong> {file.lessonId?.title}</p>
            <p><strong>File Path:</strong> {file.filePath}</p>
          </div>
        </div>

        {/* {file.downloadable && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={onDownload}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              Download Current File
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default function FileUploadForm({
  section,
  lesson,
  onChange,
  courseId,
  lessonId,
  fileId,
  contentId,
  onSaveSuccess,
  onClose,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedFileType, setSelectedFileType] = useState("Select file type");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [downloadable, setDownloadable] = useState(true);
  const [active, setActive] = useState(true);
  const [publicContent, setPublicContent] = useState(false);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const [uploadProgress, setUploadProgress] = useState({
    isVisible: false,
    progress: 0,
    fileName: "",
    stage: "Preparing upload...",
  });
  
  const [justMounted, setJustMounted] = useState(true);
  const [hasPerformedUpdate, setHasPerformedUpdate] = useState(false);
  const [currentFileData, setCurrentFileData] = useState(null);
  
  console.log("FileUploadForm rendered with fileId:", fileId);
  console.log("contentId:", contentId);
  console.log("lessonId:", lessonId);
  console.log("courseId:", courseId);

  const [isEditMode, setIsEditMode] = useState(false);
  const actualFileId = fileId || contentId;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const {
    uploading,
    error,
    success,
    file: fetchedFile,
  } = useSelector((state) => state.file);

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
  ];
  
  const fileTypes = [
    { 
      value: "PDF", 
      label: "PDF Document", 
      icon: FileText, 
      color: "text-red-600",
      accept: ".pdf",
      extensions: ["pdf"]
    },
    { 
      value: "DOCX", 
      label: "Word Document", 
      icon: FileText, 
      color: "text-blue-600",
      accept: ".doc,.docx",
      extensions: ["doc", "docx"]
    },
    { 
      value: "IMAGE", 
      label: "Image File", 
      icon: Image, 
      color: "text-green-600",
      accept: ".jpg,.jpeg,.png,.gif,.bmp,.webp",
      extensions: ["jpg", "jpeg", "png", "gif", "bmp", "webp"]
    },
  ];

  const getAcceptedFileTypes = () => {
    const selectedType = fileTypes.find(type => type.value === selectedFileType);
    return selectedType ? selectedType.accept : "";
  };

  const validateFileType = (file) => {
    const selectedType = fileTypes.find(type => type.value === selectedFileType);
    if (!selectedType) return false;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return selectedType.extensions.includes(fileExtension || "");
  };

  const filterValidFiles = (files) => {
    if (selectedFileType === "Select file type") {
      return files;
    }

    const validFiles = files.filter(file => validateFileType(file));
    const invalidFiles = files.filter(file => !validateFileType(file));

    if (invalidFiles.length > 0) {
      const selectedType = fileTypes.find(type => type.value === selectedFileType);
      const allowedExtensions = selectedType?.extensions.join(", ") || "";
      
      setPopup({
        isVisible: true,
        message: `Some files were rejected. Only ${selectedFileType} files are allowed (${allowedExtensions}).`,
        type: "warning",
      });
    }

    return validFiles;
  };

  const simulateUpload = (fileName) => {
    setUploadProgress({
      isVisible: true,
      progress: 0,
      fileName,
      stage: "Preparing upload...",
    });

    let progress = 0;
    const stages = [
      "Preparing upload...",
      "Uploading file...",
      "Processing file...",
      "Validating content...",
      "Finalizing...",
    ];

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setUploadProgress(prev => ({ ...prev, isVisible: false }));
          setPopup({
            isVisible: true,
            message: "File uploaded successfully! 🎉 Your file has been processed and is now available for download.",
            type: "success",
          });
        }, 1000);
      }

      const stageIndex = Math.floor((progress / 100) * stages.length);
      setUploadProgress({
        isVisible: true,
        progress: Math.min(progress, 100),
        fileName,
        stage: stages[Math.min(stageIndex, stages.length - 1)],
      });
    }, 500);
  };

  useEffect(() => {
    dispatch(clearFileState());
    setHasPerformedUpdate(false);
    
    const timer = setTimeout(() => {
      setJustMounted(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [dispatch]);

  useEffect(() => {
    if (selectedFiles.length > 0 && selectedFileType !== "Select file type") {
      const validFiles = filterValidFiles(selectedFiles);
      if (validFiles.length !== selectedFiles.length) {
        setSelectedFiles(validFiles);
      }
    }
  }, [selectedFileType]);

  useEffect(() => {
    const loadData = async () => {
      console.log("Loading data with actualFileId:", actualFileId);
      setHasPerformedUpdate(false);
      dispatch(clearFileState());
      
      if (actualFileId) {
        setIsEditMode(true);
        try {
          const response = await dispatch(fetchFileById(actualFileId)) as any;
          console.log("Fetched file response:", response);
          
          let data;
          if (response.payload?.data) {
            data = response.payload.data;
          } else if (response.payload) {
            data = response.payload;
          } else {
            data = response;
          }
          
          console.log("Processing file data:", data);
          
          // Set form values from fetched data
          setSelectedLanguage(data.language || "English");
          setActive(data.active ?? true);
          setDownloadable(data.downloadable ?? true);
          setPublicContent(data.isPublic ?? false);
          setSelectedFileType(data.fileType || "Select file type");
          setSelectedFiles([]);
          setCurrentFileData(data);
          
          // Force re-render to show file preview
          setTimeout(() => {
            console.log("File data loaded for preview:", data);
          }, 100);
          
        } catch (err) {
          console.error("Error fetching file:", err);
          setPopup({
            isVisible: true,
            message: "Failed to fetch file data. Please try again.",
            type: "error",
          });
        }
      } else {
        setIsEditMode(false);
        handleReset();
      }
    };
    
    loadData();
  }, [actualFileId, dispatch]);

  useEffect(() => {
    if (isEditMode && fetchedFile && !uploading && !error) {
      setSelectedLanguage(fetchedFile.language || "English");
      setSelectedFileType(fetchedFile.fileType || "Select file type");
      setDownloadable(fetchedFile.downloadable ?? true);
      setActive(fetchedFile.active ?? true);
      setPublicContent(fetchedFile.isPublic ?? false);
      setSelectedFiles([]);
      
      setTimeout(() => {
        dispatch(clearFileState());
      }, 100);
    }
  }, [fetchedFile, isEditMode, uploading, error, dispatch]);

  useEffect(() => {
    if (justMounted) return;
    
    if (!uploading && !isEditMode && !hasPerformedUpdate) {
      if (success) {
        setPopup({
          isVisible: true,
          message: "File uploaded successfully!",
          type: "success",
        });
        if (onSaveSuccess) onSaveSuccess(success);
        handleReset();
      } else if (error) {
        setPopup({
          isVisible: true,
          message: `Failed to upload file. ${error}`,
          type: "error",
        });
      }
    }
  }, [success, error, uploading, isEditMode, onSaveSuccess, justMounted, hasPerformedUpdate]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (selectedFileType === "Select file type") {
      setPopup({
        isVisible: true,
        message: "Please select a file type first before uploading files.",
        type: "warning",
      });
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const validFiles = filterValidFiles(files);
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e) => {
    if (selectedFileType === "Select file type") {
      setPopup({
        isVisible: true,
        message: "Please select a file type first before uploading files.",
        type: "warning",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const files = Array.from(e.target.files || []);
    const validFiles = filterValidFiles(files);
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownload = () => {
    setPopup({
      isVisible: true,
      message: "Download functionality would be implemented here based on your backend setup.",
      type: "info",
    });
  };

  const handleUploadOrUpdate = async () => {
    console.log("file upload or update called");
    if (!isEditMode && selectedFiles.length === 0) {
      setPopup({
        isVisible: true,
        message: "Please select files to upload",
        type: "error",
      });
      console.log("return from handleUploadOrUpdate 1");
      return;
    }
    if (selectedFileType === "Select file type") {
      setPopup({
        isVisible: true,
        message: "Please select a file type",
        type: "error",
      });
      console.log("return from handleUploadOrUpdate 2");
      return;
    }
    console.log("Selected files:", selectedFiles);
    console.log("isEditMode:", isEditMode);
    console.log("Actual File ID:", actualFileId);

    if (!isEditMode && selectedFiles.length > 0) {
      simulateUpload(selectedFiles[0].name);
    }

    try {
      if (isEditMode && actualFileId) {
        const payload = {
          fileId: actualFileId,
          language: selectedLanguage,
          fileType: selectedFileType,
          downloadable,
          active,
          isPublic: publicContent,
          lessonId,
          courseId,
        };
        await dispatch(updateFile(payload));
        
        setHasPerformedUpdate(true);
        
        setPopup({
          isVisible: true,
          message: "File updated successfully! 🎉 All changes have been saved.",
          type: "success",
        });
        
        if (onSaveSuccess) {
          onSaveSuccess(true);
        }
      } else {
        const uploadPromises = selectedFiles.map((file) => {
          const payload = {
            language: selectedLanguage,
            fileType: selectedFileType,
            downloadable,
            active,
            isPublic: publicContent,
            file,
            lessonId,
            courseId,
          };
          return dispatch(uploadFile(payload));
        });
        await Promise.all(uploadPromises);
        handleClose();
      }
    } catch {
      setUploadProgress(prev => ({ ...prev, isVisible: false }));
      setPopup({
        isVisible: true,
        message: `Failed to ${
          isEditMode ? "update" : "upload"
        } file. Please try again.`,
        type: "error",
      });
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setSelectedLanguage("English");
    setSelectedFileType("Select file type");
    setDownloadable(true);
    setActive(true);
    setPublicContent(false);
    setHasPerformedUpdate(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setPopup({ isVisible: false, message: "", type: "" });
    if (onClose) onClose();
  };

  return (
    <>
      <div className="bg-white lg:w-[800px]  rounded-2xl max-w-4xl w-full mx-auto shadow-2xl max-h-[700px] overflow-scroll">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FileUp className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isEditMode ? "Edit File" : "Upload File"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isEditMode ? "Update file settings and metadata" : "Add a new file to your lesson"}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={handleClose}
                className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-all"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 pb-36">
          {/* Debug info - remove this after testing */}
          {console.log("Debug - isEditMode:", isEditMode, "fetchedFile:", fetchedFile, "currentFileData:", currentFileData)}
          
          {/* File Preview - Show in edit mode when we have file data */}
          {isEditMode && (fetchedFile || currentFileData) && (
            <FilePreview 
              file={fetchedFile || currentFileData || {
                _id: actualFileId,
                language: selectedLanguage,
                fileType: selectedFileType,
                downloadable: downloadable,
                active: active,
                isPublic: publicContent,
                lessonId: { title: lesson?.title || "Current Lesson" },
                courseId: { title: "Current Course" },
                filePath: "Loading...",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }} 
              onDownload={handleDownload}
            />
          )}

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Language
            </label>
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="w-full px-4 py-3 text-left bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex sm:flex-row items-center sm:items-center justify-between gap-4 hover:border-gray-300 transition-all"
              >
                <span className="font-medium">{selectedLanguage}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLanguageOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* File Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              File Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              {fileTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedFileType === type.value;
                return (
                  <div
                    key={type.value}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedFileType(type.value);
                      setSelectedFiles([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-6 h-6 ${
                        isSelected ? "text-blue-600" : type.color
                      }`} />
                      <div>
                        <span className={`font-medium ${
                          isSelected ? "text-blue-900" : "text-gray-700"
                        }`}>
                          {type.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {type.extensions.map(ext => `.${ext}`).join(", ")}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              }
            )}
            </div>
          </div>
          {/* File Upload Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Upload Files *
            </label>
            <div
              className={`border-2 rounded-xl p-6 transition-all ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex items-center justify-center flex-col gap-4">
                <Upload className="w-12 h-12 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Drag and drop files here or{" "}
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="text-blue-600 hover:underline"
                  >
                    select files
                  </button>
                </p>
                <input
                  type="file"
                  multiple
                  accept={getAcceptedFileTypes()}
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex sm:flex-row items-center sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <FileIcon className="w-6 h-6 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
         {/* File Settings */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">File Settings</h3>
            <div className="space-y-4">
              <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 p-4 bg-white rounded-xl">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-600" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Downloadable
                    </label>
                    <p className="text-xs text-gray-500">Allow users to download this file</p>
                  </div>
                </div>
                <button
                  onClick={() => setDownloadable(!downloadable)}
                  disabled={uploading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    downloadable ? "bg-blue-600" : "bg-gray-300"
                  } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      downloadable ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 p-4 bg-white rounded-xl">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                    <p className="text-xs text-gray-500">File is visible to students</p>
                  </div>
                </div>
                <button
                  onClick={() => setActive(!active)}
                  disabled={uploading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    active ? "bg-blue-600" : "bg-gray-300"
                  } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 p-4 bg-white rounded-xl">
                <div className="flex items-center gap-3">
                  {publicContent ? <Globe className="w-5 h-5 text-gray-600" /> : <Lock className="w-5 h-5 text-gray-600" />}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Public Content
                    </label>
                    <p className="text-xs text-gray-500">Accessible without enrollment</p>
                  </div>
                </div>
                <button
                  onClick={() => setPublicContent(!publicContent)}
                  disabled={uploading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    publicContent ? "bg-blue-600" : "bg-gray-300"
                  } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      publicContent ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 fixed bottom-0 w-full flex justify-between items-center">
          <div className="text-sm text-gray-600">
            * Required fields
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={uploading || uploadProgress.isVisible}
              className="px-6 py-2 rounded-xl font-semibold text-gray-700 border-2 border-gray-300 hover:bg-gray-100 transition-all duration-200"
            >
              Reset
            </button>
            <button
              onClick={handleUploadOrUpdate}
              disabled={
                uploading ||
                uploadProgress.isVisible ||
                (!isEditMode && selectedFiles.length === 0) ||
                selectedFileType === "Select file type"
              }
              className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 ${
                uploading || uploadProgress.isVisible ||
                (!isEditMode && selectedFiles.length === 0) ||
                selectedFileType === "Select file type"
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {uploading || uploadProgress.isVisible ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isEditMode ? "Updating..." : "Uploading..."}
                </>
              ) : (
                <>
                  <FileUp className="w-5 h-5" />
                  {isEditMode ? "Update File" : "Upload Files"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Upload Progress Modal */}
      <UploadProgress
        isVisible={uploadProgress.isVisible}
        progress={uploadProgress.progress}
        fileName={uploadProgress.fileName}
        stage={uploadProgress.stage}
      />

      {/* Enhanced Popup */}
      <EnhancedPopup
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ isVisible: false, message: "", type: "" })}
      />
    </>
  );
}