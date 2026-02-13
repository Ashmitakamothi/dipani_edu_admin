import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  HelpCircle,
  AlertCircle,
  Eye,
  Settings,
} from "lucide-react";
import { createQuiz, upadateQuiz } from "../../../store/slices/quiz"; // Adjust the import path as needed
import PopupAlert from "../../../components/popUpAlert";
import { useParams } from "react-router";
import axiosInstance from "../../../services/axiosConfig";
type QuestionType = {
  question: string;
  options: string[];
  correctAnswer: string;
};

type LessonType = {
  quizTitle?: string;
  quizDuration?: number | string;
  quizDifficulty?: string;
  passMark?: number;
  quizDescription?: string;
  questions?: QuestionType[];
};

type QuizProps = {
  lesson?: LessonType;
  onChange?: (data: LessonType) => void;
  courseId: string; // Required for API call
  lessonId: string; // Required for API call
};

// Redux state type (adjust according to your store structure)
interface RootState {
  quiz: {
    loading: boolean;
    error: string | null;
    data: any;
  };
}

const EditQuiz = ({ section, lesson, onChange, courseId, lessonId }) => {
  const dispatch = useDispatch();
  const {
    loading: saving,
    error: saveError,
    data: saveData,
  } = useSelector((state: RootState) => state.quiz);

  const params = useParams();
  const quizId = params.quizId;

  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [questions, setQuestions] = useState<QuestionType[]>(
    lesson?.questions || []
  );
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [quizData, setQuizData] = useState({
    courseId: "",
    courseTitle: "",
    lessonId: "",
    lessonTitle: "",
    passMark: 70,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const getData = async () => {
    try {
      const response = await axiosInstance("/quiz/" + quizId);

      const data = response.data?.data;
      setQuizData({
        courseId: data?.course?._id,
        courseTitle: data?.course.title,
        lessonId: data.lesson.lessonId,
        lessonTitle: data.lesson.title,
        passMark: data.passMark || 70,
      });
      setQuestions(data.questions || []);
      console.log("Fetched quiz data:", response.data);
    } catch (error) {
      console.error("Failed to fetch quiz data:", error);
      setPopup({
        isVisible: true,
        message: "Failed to load quiz data. Please try again.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    getData();
  }, [quizId]);

  // Handle save success
  useEffect(() => {
    if (saveData && !saving && !saveError) {
      setSaveSuccess(true);
      // Auto-hide success message after 3 seconds
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveData, saving, saveError]);

  const handleChange = (field: any, value: any) => {
    setQuizData((prev) => ({ ...prev, [field]: value }));
    if (onChange)
      onChange({ ...lesson, ...quizData, [field]: value, questions });
  };

  const handleQuestionsUpdate = (updatedQuestions: any) => {
    setQuestions(updatedQuestions);
    if (onChange)
      onChange({ ...lesson, ...quizData, questions: updatedQuestions });
  };

  const handleSaveQuiz = async () => {
    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    // Reset previous success state
    setSaveSuccess(false);

    // Prepare payload for API
    const payload = {
      id: quizId,
      passMark: quizData.passMark,
      questions: questions,
    };

    try {
      await dispatch(upadateQuiz(payload) as any);
      // Show success popup
      setPopup({
        isVisible: true,
        message: "Quiz updated successfully!",
        type: "success",
      });
    } catch (error) {
      setPopup({
        isVisible: true,
        message: "Failed to create Quiz. Please try again.",
        type: "error",
      });
      console.error("Failed to save quiz:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 font-medium">Error saving quiz:</span>
          </div>
          <p className="text-red-600 mt-1">{saveError}</p>
        </div>
      )}

      {/* Basic Quiz Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-600" />
          Quiz Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Course Title *
            </label>
            <input
              disabled
              type="text"
              value={quizData.courseTitle}
              onChange={(e) => handleChange("quizTitle", e.target.value)}
              placeholder="Enter quiz title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Lesson title *
            </label>
            <input
              disabled
              type="text"
              value={quizData.lessonTitle}
              onChange={(e) => handleChange("quizTitle", e.target.value)}
              placeholder="Enter quiz title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Difficulty Level
            </label>
            <select
              value={quizData.quizDifficulty}
              onChange={(e) => handleChange("quizDifficulty", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select difficulty</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Pass Mark (%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={quizData.passMark}
              onChange={(e) =>
                handleChange("passMark", parseInt(e.target.value) || 70)
              }
              placeholder="70"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        {/* <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Description
          </label>
          <textarea
            value={quizData.quizDescription}
            onChange={(e) => handleChange("quizDescription", e.target.value)}
            placeholder="Brief description of the quiz content and objectives"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
        </div> */}
      </div>

      {/* Questions Management */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-green-600" />
                Quiz Questions ({questions.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage your quiz questions and answers
              </p>
            </div>
            <button
              onClick={() => {
                setEditingQuestion(null);
                setShowQuestionBuilder(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>
        <div className="p-6">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No questions yet
              </h4>
              <p className="text-gray-500 mb-4">
                Start building your quiz by adding questions
              </p>
              <button
                onClick={() => setShowQuestionBuilder(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuestionCard
                  key={index}
                  question={question}
                  index={index}
                  onEdit={() => {
                    setEditingQuestion(index);
                    setShowQuestionBuilder(true);
                  }}
                  onDelete={() => {
                    const updatedQuestions = questions.filter(
                      (_, i) => i !== index
                    );
                    handleQuestionsUpdate(updatedQuestions);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Quiz Button */}
      <div className="flex justify-end items-center gap-4">
        <button
          onClick={handleSaveQuiz}
          disabled={saving || questions?.length === 0}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow ${
            saving || questions?.length === 0
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving Quiz..." : "Save Quiz"}
        </button>
        {saveSuccess && (
          <span className="text-green-600 font-medium flex items-center animate-fade-in">
            <CheckCircle className="w-5 h-5 mr-1" />
            Quiz saved successfully!
          </span>
        )}
      </div>

      {/* Question Builder Modal */}
      {showQuestionBuilder && (
        <QuestionBuilder
          question={
            editingQuestion !== null ? questions[editingQuestion] : null
          }
          onSave={(questionData: any) => {
            let updatedQuestions;
            if (editingQuestion !== null) {
              updatedQuestions = [...questions];
              updatedQuestions[editingQuestion] = questionData;
            } else {
              updatedQuestions = [...questions, questionData];
            }
            handleQuestionsUpdate(updatedQuestions);
            setShowQuestionBuilder(false);
            setEditingQuestion(null);
          }}
          onClose={() => {
            setShowQuestionBuilder(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
};

const QuestionCard = ({ question, index, onEdit, onDelete }) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              Q{index + 1}
            </span>
            <span className="text-sm text-gray-500">
              {question.options?.length || 0} options
            </span>
          </div>
          <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
            {question.question}
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Correct: {question.correctAnswer}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {showPreview && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border ${
                  option === question.correctAnswer
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
                {option === question.correctAnswer && (
                  <CheckCircle className="w-4 h-4 inline ml-2 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const QuestionBuilder = ({ question, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    question: question?.question || "",
    options: question?.options || ["", "", "", ""],
    correctAnswer: question?.correctAnswer || "",
  });
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, ""],
      });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions,
        correctAnswer:
          formData.correctAnswer === formData.options[index]
            ? ""
            : formData.correctAnswer,
      });
    }
  };

  const handleSave = () => {
    if (!formData.question.trim()) {
      alert("Please enter a question");
      return;
    }
    const filledOptions = formData.options.filter((opt) => opt.trim());
    if (filledOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }
    if (
      !formData.correctAnswer ||
      !filledOptions.includes(formData.correctAnswer)
    ) {
      alert("Please select a valid correct answer");
      return;
    }
    onSave({
      question: formData.question.trim(),
      options: filledOptions,
      correctAnswer: formData.correctAnswer,
    });
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {question ? "Edit Question" : "Add New Question"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <textarea
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              placeholder="Enter your question here..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Answer Options *
              </label>
              {formData.options.length < 6 && (
                <button
                  onClick={addOption}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              )}
            </div>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={
                        formData.correctAnswer === option &&
                        option.trim() !== ""
                      }
                      onChange={() =>
                        option.trim() &&
                        setFormData({ ...formData, correctAnswer: option })
                      }
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      disabled={!option.trim()}
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 text-sm font-medium px-2 py-1 rounded min-w-[24px] text-center">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {formData.options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select the radio button next to the correct answer
            </p>
          </div>
        </div>
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {question ? "Update Question" : "Add Question"}
            </button>
          </div>
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
};

export default EditQuiz;
