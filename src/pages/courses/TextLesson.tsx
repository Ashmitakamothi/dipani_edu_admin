import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  createTextLesson,
  fetchTextLessons,
} from "../../store/slices/textLesson";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";
import {
  Plus,
  Loader2,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  Globe,
  Lock,
  Unlock,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";

interface TextLesson {
  _id: string;
  title: string;
  subTitle?: string;
  language: string;
  accessibility: string;
  summary: string;
  content: string;
  course?: {
    _id: string;
    title: string;
  } | null;
  lesson?: {
    _id: string;
    title: string;
  };
  order: number;
  isActive: boolean;
  attachments: Array<{
    fileName: string;
    uploadedAt: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const TextLessonPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error, data } = useAppSelector((state) => state.textLesson);

  const [lessons, setLessons] = useState<TextLesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    subTitle: "",
    language: "English",
    accessibility: "free",
    summary: "",
    content: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(fetchTextLessons() as any)
      .unwrap()
      .then((res: any) => setLessons(res.data || []))
      .catch(() => {});
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      await dispatch(createTextLesson(formData) as any).unwrap();
      toast.success("Text lesson created!");
      setForm({
        title: "",
        subTitle: "",
        language: "English",
        accessibility: "free",
        summary: "",
        content: "",
      });
      setShowForm(false);
      dispatch(fetchTextLessons() as any);
    } catch (err: any) {
      toast.error("Failed to create lesson");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleContentExpansion = (lessonId: string) => {
    setExpandedContent(expandedContent === lessonId ? null : lessonId);
  };

  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    const cleanText = stripHtmlTags(text);
    return cleanText.length > maxLength
      ? cleanText.substring(0, maxLength) + "..."
      : cleanText;
  };

  return (
    <div>
      <PageMeta
        title="Text Lessons | LMS Admin"
        description="Manage text lessons"
      />
      <PageBreadcrumb pageTitle="Text Lessons" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              Text Lessons
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Total: {lessons.length} lessons
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Lesson
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Create New Lesson
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                  Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                  Subtitle
                </label>
                <input
                  name="subTitle"
                  value={form.subTitle}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                  Language
                </label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                  Accessibility
                </label>
                <select
                  name="accessibility"
                  value={form.accessibility}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                Summary
              </label>
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                Content *
              </label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                required
                rows={6}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading && <Loader2 className="animate-spin w-4 h-4" />}
                Create Lesson
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Title & Subtitle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Language
                  </th>
                  {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Access</th> */}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Course
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Summary
                  </th>
                  {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Content</th> */}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Attachments
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Action
                  </th>
                  {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Created</th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                {lessons.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-12 text-gray-500 dark:text-gray-400"
                    >
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        No text lessons found
                      </p>
                      <p className="text-sm">
                        Create your first lesson to get started
                      </p>
                    </td>
                  </tr>
                )}
                {lessons.map((lesson, idx) => (
                  <tr
                    key={lesson._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {lesson.title}
                        </p>
                        {lesson.subTitle && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {lesson.subTitle}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {lesson.language}
                        </span>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                {lesson.accessibility.toLowerCase() === 'free' ? (
                                                    <Unlock className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Lock className="w-4 h-4 text-amber-500" />
                                                )}
                                                <span className={`text-sm capitalize ${
                                                    lesson.accessibility.toLowerCase() === 'free' 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-amber-600 dark:text-amber-400'
                                                }`}>
                                                    {lesson.accessibility}
                                                </span>
                                            </div>
                                        </td> */}
                    <td className="px-6 py-4">
                      {lesson.course ? (
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {lesson.course.title}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          No course
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {truncateText(lesson.summary, 30)}
                        </p>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        {expandedContent === lesson._id 
                                                            ? stripHtmlTags(lesson.content)
                                                            : truncateText(lesson.content, 10)
                                                        }
                                                    </p>
                                                    {lesson.content.length > 50 && (
                                                        <button
                                                            onClick={() => toggleContentExpansion(lesson._id)}
                                                            className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                                        >
                                                            {expandedContent === lesson._id ? (
                                                                <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                <Eye className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td> */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {lesson.attachments.length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {lesson.attachments.length} file(s)
                            </p>
                            {lesson.attachments
                              .slice(0, 2)
                              .map((attachment) => (
                                <p
                                  key={attachment._id}
                                  className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32"
                                >
                                  {attachment.fileName}
                                </p>
                              ))}
                            {lesson.attachments.length > 2 && (
                              <p className="text-xs text-gray-400">
                                +{lesson.attachments.length - 2} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No files
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lesson.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {lesson.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(lesson.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </td> */}

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        onClick={() =>
                          navigate(`/courses/text-courses/${lesson._id}`)
                        }
                        title="Edit Quiz"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        // onClick={() => openDeleteModal(quiz)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextLessonPage;
