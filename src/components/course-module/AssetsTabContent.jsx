import React, { useEffect, useState } from "react";
import {
  FileText,
  Video,
  Download,
  CheckSquare,
  Search,
  BookOpen,
  Clock,
  CalendarDays,
  XCircle,
} from "lucide-react";
import axiosInstance from "../../services/axiosConfig";
import Quiz from "../../pages/courses/components/Quiz";
import Assignment from "../../pages/courses/components/Assignment";
import Files from "../../pages/courses/components/Files";
import TextLesson from "../../pages/courses/components/TextLesson";
import VedioLesson from "../../pages/courses/components/VideoLesson";

const AssetsTabContent = ({ courseID }) => {
  const [activeFilter, setActiveFilter] = useState("quizzes");
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState({});
  const [openQuiz, setOpenQuiz] = useState(null);
  const [openAssignment, setOpenAssignment] = useState(null);
  const [openFile, setOpenFile] = useState(null);
  const [openVideoLesson, setOpenVideoLesson] = useState(null);
  const [openTextLesson, setOpenTextLesson] = useState(null);

  const getData = async () => {
    try {
      const response = await axiosInstance.get(
        `courses/${courseID}/all-attachments`
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, [courseID]);

  const filterOptions = [
    {
      id: "quizzes",
      label: "Quizzes",
      icon: CheckSquare,
      count: data?.quizzes?.length || 0,
    },
    {
      id: "files",
      label: "Files",
      icon: Download,
      count: data?.files?.length || 0,
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: FileText,
      count: data?.assignments?.length || 0,
    },
    {
      id: "videos",
      label: "Video Lessons",
      icon: Video,
      count: data?.videos?.length || 0,
    },
    {
      id: "texts",
      label: "Text Lessons",
      icon: BookOpen,
      count: data?.texts?.length || 0,
    },
  ];

  const filteredData =
    data[activeFilter]?.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getAssetTypeColor = (type) => {
    const colors = {
      quizzes: "bg-blue-100 text-blue-800 border-blue-200",
      files: "bg-green-100 text-green-800 border-green-200",
      assignments: "bg-purple-100 text-purple-800 border-purple-200",
      videos: "bg-orange-100 text-orange-800 border-orange-200",
      texts: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getAssetIcon = (type) => {
    const icons = {
      quizzes: CheckSquare,
      files: Download,
      assignments: FileText,
      videos: Video,
      texts: BookOpen,
    };
    const IconComponent = icons[type] || FileText;
    return <IconComponent className="w-6 h-6" />;
  };

  const getActionButton = (type) => {
    const actions = {
      quizzes: { text: "View Quiz", color: "bg-blue-600 hover:bg-blue-700" },
      files: { text: "View File", color: "bg-green-600 hover:bg-green-700" },
      assignments: {
        text: "View Assignment",
        color: "bg-purple-600 hover:bg-purple-700",
      },
      videos: {
        text: "View Video Lesson",
        color: "bg-orange-600 hover:bg-orange-700",
      },
      texts: {
        text: "View Text Lesson",
        color: "bg-gray-600 hover:bg-gray-700",
      },
    };
    return (
      actions[type] || {
        text: "Access Asset",
        color: "bg-indigo-600 hover:bg-indigo-700",
      }
    );
  };

  return (
    <>
      {/* Modals */}
      {openQuiz && (
        <div className="fixed inset-0 bg-black/40  backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="relative  bg-white dark:bg-white/[0.03] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-fade-in-up">
            <button
              onClick={() => setOpenQuiz(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close Quiz"
            >
              <XCircle className="w-7 h-7" />
            </button>
            <Quiz
              sectionId={courseID}
              lesson={openQuiz?.lessonId}
              onChange={() => {}}
              courseId={openQuiz?.courseID}
              lessonId={openQuiz?.lessonId}
              moduleId={openQuiz?.moduleId}
              contentId={openQuiz?.contentId}
              isEdit={true}
              quizId={openQuiz?.id}
              quizData={openQuiz}
              onClose={() => setOpenQuiz(null)}
            />
          </div>
        </div>
      )}
      {openAssignment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-fade-in-up">
            <button
              onClick={() => setOpenAssignment(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close Assignment"
            >
              <XCircle className="w-7 h-7" />
            </button>
            <Assignment
              sectionId={courseID}
              lesson={openAssignment?.lessonId}
              onChange={() => {}}
              courseId={courseID}
              lessonId={openAssignment?.lessonId}
              moduleId={openAssignment?.moduleId}
              contentId={openAssignment?.contentId}
              isEdit={true}
              assignmentId={openAssignment?.id}
              assignmentData={openAssignment}
              onClose={() => setOpenAssignment(null)}
            />
          </div>
        </div>
      )}
      {openFile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-fade-in-up">
            <button
              onClick={() => setOpenFile(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close File"
            >
              <XCircle className="w-7 h-7" />
            </button>
            <Files
              courseId={courseID}
              lessonId={openFile?.lessonId}
              fileId={openFile?.id}
              videoData={openFile}
              onClose={() => setOpenFile(null)}
            />
          </div>
        </div>
      )}
      {openTextLesson && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-fade-in-up">
            <button
              onClick={() => setOpenTextLesson(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close Text Lesson"
            >
              <XCircle className="w-7 h-7" />
            </button>
            <TextLesson
              courseId={courseID}
              lessonId={openTextLesson?.lessonId}
              textLessonId={openTextLesson?.id}
              onClose={() => setOpenTextLesson(null)}
            />
          </div>
        </div>
      )}
      {openVideoLesson && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-95 animate-fade-in-up">
            <button
              onClick={() => setOpenVideoLesson(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close Video Lesson"
            >
              <XCircle className="w-7 h-7" />
            </button>
            <VedioLesson
              lessonId={openVideoLesson?.lessonId}
              videoId={openVideoLesson?.id}
              fileId={openVideoLesson?.id}
              onClose={() => setOpenVideoLesson(null)}
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-8 bg-gray-50 dark:bg-white/[0.03] min-h-screen">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white/90 mb-3 leading-tight">
            Explore Course Assets
          </h2>
          <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
            Dive into all your course materials, neatly organized for seamless
            learning.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full dark:bg-white/[0.03] max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400  w-5 h-5" />
            <input
              type="text"
              placeholder="Search quizzes, files, videos, and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full dark:bg-white/[0.03]  dark:text-white/90 pl-12 pr-6 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm text-gray-700 text-base"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-12 flex justify-center">
          <div className="flex flex-wrap justify-center gap-3 bg-white dark:bg-white/[0.03] p-2 rounded-2xl shadow-md border border-gray-200">
            {filterOptions.map((option) => {
              const IconComponent = option.icon;
              const isActive = activeFilter === option.id;
              return (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => setActiveFilter(option.id)}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-base transition-all duration-300 ease-in-out
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-white/[0.03]  transform scale-105"
                        : "bg-white dark:bg-white/[0.06] dark:text-white/90  text-gray-700 hover:bg-blue-50 hover:text-blue-700 shadow-sm border border-transparent hover:border-blue-200"
                    }
                  `}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{option.label}</span>
                  <span
                    className={`
                      px-2.5 py-0.5 rounded-full text-xs font-bold
                      ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-800"
                      }
                    `}
                  >
                    {option.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Grid of Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredData.map((item, index) => (
            <div
              key={item?.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col justify-between"
              style={{
                animationDelay: `${index * 80}ms`,
                animation: "fadeInUp 0.7s ease-out forwards",
                opacity: 0,
              }}
            >
              <div>
                <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
                  <div
                    className={`p-3 rounded-full ${getAssetTypeColor(
                      activeFilter
                    )} text-white flex-shrink-0`}
                  >
                    {getAssetIcon(activeFilter)}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getAssetTypeColor(
                      activeFilter
                    )}`}
                  >
                    {activeFilter === "quizzes" && "Quiz"}
                    {activeFilter === "files" && "File"}
                    {activeFilter === "assignments" && "Assignment"}
                    {activeFilter === "videos" && "Video Lesson"}
                    {activeFilter === "texts" && "Text Lesson"}
                  </span>
                </div>

                <h3 className="font-bold text-xl text-gray-900 mb-3 leading-snug group-hover:text-blue-700 transition-colors duration-200">
                  {item?.name}
                </h3>

                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  {/* Displaying available data fields */}
                  <span className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">
                      Date: {new Date(item?.date).toLocaleDateString()}
                    </span>
                  </span>

                  {item?.duration && (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        Duration: {item?.duration}
                      </span>
                    </span>
                  )}
                  {item?.qsize && (
                    <span className="flex items-center gap-2">
                      <span className="font-medium">
                        Questions: {item?.qsize}
                      </span>
                    </span>
                  )}
                  {item?.totalMarks && (
                    <span className="flex items-center gap-2">
                      <span className="font-medium">
                        Total Marks: {item?.totalMarks}
                      </span>
                    </span>
                  )}
                  {item?.passMark && (
                    <span className="flex items-center gap-2">
                      <span className="font-medium">
                        Pass Mark: {item?.passMark}
                      </span>
                    </span>
                  )}

                  {item?.readTime && (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        Read Time: {item?.readTime}
                      </span>
                    </span>
                  )}
                  {item?.difficulty && (
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item?.difficulty === "Easy"
                            ? "bg-green-100 text-green-700"
                            : item?.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Difficulty: {item?.difficulty}
                      </span>
                    </div>
                  )}
                  {item?.fileType && (
                    <span className="font-medium">
                      File Type: {item?.fileType}
                    </span>
                  )}
                  {item?.quality && (
                    <span className="font-medium">
                      Quality: {item?.quality}
                    </span>
                  )}
                  {item?.language && (
                    <span className="font-medium">
                      Language: {item?.language}
                    </span>
                  )}
                  {item?.subject && (
                    <span className="font-medium">
                      Subject: {item?.subject}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-5 border-t border-gray-100 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (activeFilter === "quizzes") {
                      setOpenQuiz(item);
                    } else if (activeFilter === "files") {
                      setOpenFile(item);
                    } else if (activeFilter === "assignments") {
                      setOpenAssignment(item);
                    } else if (activeFilter === "videos") {
                      setOpenVideoLesson(item);
                    } else if (activeFilter === "texts") {
                      setTextLesson(item);
                    }
                  }}
                  className={`w-full text-white py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-md ${
                    getActionButton(activeFilter).color
                  }`}
                >
                  {getActionButton(activeFilter).text}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg mt-10">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-blue-400" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              No Assets Found
            </h4>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              We couldn't find any assets matching your current filter or search
              term. Please try adjusting your criteria.
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Keyframe for fadeInUp animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default AssetsTabContent;
