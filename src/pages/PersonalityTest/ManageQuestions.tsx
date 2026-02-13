import React, { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import axiosInstance from "../../services/axiosConfig";
import { Plus, Trash, Save, List, Pencil, X, BookOpen, ChevronRight, Search } from "lucide-react";
import toast from "react-hot-toast";

const MBTI_TYPES = [
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
    "ISTP", "ISFP", "ESTP", "ESFP"
];

const ManageQuestions: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'questions' | 'mapping'>('questions');
    const [questions, setQuestions] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [mappingLoading, setMappingLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newQuestion, setNewQuestion] = useState({
        question: "",
        dimension: "IE",
        agreeType: "E",
        disagreeType: "I",
        weight: 1
    });

    // Course Mapping State
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [tempSelectedCourses, setTempSelectedCourses] = useState<string[]>([]);
    const [courseSearch, setCourseSearch] = useState("");

    const questionInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchQuestions();
        fetchCourses();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/personality/questions");
            setQuestions(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axiosInstance.get("/courses?limit=100");
            setCourses(response.data?.data?.data || []);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axiosInstance.put(`/personality/questions/${editingId}`, newQuestion);
                toast.success("Question updated successfully!");
                setEditingId(null);
            } else {
                await axiosInstance.post("/personality/questions", { questions: [newQuestion] });
                toast.success("Question created successfully!");
            }

            setNewQuestion({
                question: "",
                dimension: "IE",
                agreeType: "E",
                disagreeType: "I",
                weight: 1
            });
            fetchQuestions();
        } catch (error: any) {
            console.error("Error saving question:", error);
            toast.error(error.response?.data?.message || "Error saving question");
        }
    };

    const handleEdit = (q: any) => {
        setEditingId(q._id);
        const dimension = q.dimension?.toUpperCase() || "IE";
        const currentTypes = types[dimension] || ["I", "E"];

        setNewQuestion({
            question: q.question || "",
            dimension: dimension,
            agreeType: q.agreeType || currentTypes[1],
            disagreeType: q.disagreeType || currentTypes[0],
            weight: q.weight || 1
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => questionInputRef.current?.focus(), 100);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;
        try {
            await axiosInstance.delete(`/personality/questions/${id}`);
            toast.success("Question deleted successfully!");
            fetchQuestions();
        } catch (error: any) {
            console.error("Error deleting question:", error);
            toast.error(error.response?.data?.message || "Error deleting question");
        }
    };

    const handleUpdateMapping = async () => {
        if (!selectedType) return;
        setMappingLoading(true);
        try {
            await axiosInstance.put("/personality/course-mapping", {
                personalityType: selectedType,
                courseIds: tempSelectedCourses
            });
            toast.success(`Courses updated for ${selectedType}`);
            setSelectedType(null);
            fetchCourses();
        } catch (error: any) {
            console.error("Error updating mapping:", error);
            toast.error("Failed to update mapping");
        } finally {
            setMappingLoading(false);
        }
    };

    const openMappingModal = (type: string) => {
        setSelectedType(type);
        const assignedCourses = courses
            .filter(c => c.suitablePersonalityTypes?.includes(type))
            .map(c => c._id);
        setTempSelectedCourses(assignedCourses);
        setCourseSearch("");
    };

    const toggleCourseSelection = (courseId: string) => {
        setTempSelectedCourses(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const dimensions = ["IE", "SN", "TF", "JP"];
    const types: Record<string, string[]> = {
        IE: ["I", "E"],
        SN: ["S", "N"],
        TF: ["T", "F"],
        JP: ["J", "P"]
    };

    const handleDimensionChange = (dimension: string) => {
        const [disagreeType, agreeType] = types[dimension];
        setNewQuestion({ ...newQuestion, dimension, agreeType, disagreeType });
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(courseSearch.toLowerCase())
    );

    return (
        <>
            <PageMeta title="Manage Personality Test | LMS Admin" description="Manage personality test questions and course mappings" />
            <PageBreadcrumb pageTitle="Personality Test" />

            <div className="p-6 max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'questions' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Questions
                        {activeTab === 'questions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('mapping')}
                        className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'mapping' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Course Mapping
                        {activeTab === 'mapping' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
                    </button>
                </div>

                {activeTab === 'questions' ? (
                    <div className="animate-in fade-in duration-300">
                        {/* Create/Edit Question Form */}
                        <div className={`p-6 rounded-xl shadow mb-8 transition-colors duration-300 ${editingId ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    {editingId ? <Pencil className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5" />}
                                    {editingId ? 'Edit Question' : 'Add New Question'}
                                </h2>
                                {editingId && (
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setNewQuestion({ question: "", dimension: "IE", agreeType: "E", disagreeType: "I", weight: 1 });
                                        }}
                                        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <X className="w-4 h-4" /> Cancel Edit
                                    </button>
                                )}
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Text</label>
                                    <input
                                        ref={questionInputRef}
                                        type="text"
                                        value={newQuestion.question}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g., You enjoy vibrant social events..."
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dimension</label>
                                        <select
                                            value={newQuestion.dimension}
                                            onChange={(e) => handleDimensionChange(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            {dimensions.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agree Type</label>
                                        <select
                                            value={newQuestion.agreeType}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, agreeType: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            {(types[newQuestion.dimension] || ["I", "E"]).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disagree Type</label>
                                        <select
                                            value={newQuestion.disagreeType}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, disagreeType: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            {(types[newQuestion.dimension] || ["I", "E"]).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight</label>
                                        <input
                                            type="number"
                                            value={newQuestion.weight}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, weight: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            min="1"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    {editingId ? <Pencil className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {editingId ? 'Update Question' : 'Save Question'}
                                </button>
                            </form>
                        </div>

                        {/* Questions List */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <List className="w-5 h-5" /> Existing Questions
                                </h2>
                                <span className="text-sm text-gray-500">{questions.length} questions found</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-700 uppercase text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-4">Question</th>
                                            <th className="px-6 py-4">Dim</th>
                                            <th className="px-6 py-4">Agree</th>
                                            <th className="px-6 py-4">Disagree</th>
                                            <th className="px-6 py-4">Weight</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Loading questions...</td>
                                            </tr>
                                        ) : questions.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No questions found. Add your first one above!</td>
                                            </tr>
                                        ) : (
                                            questions.map((q) => (
                                                <tr key={q._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{q.question}</td>
                                                    <td className="px-6 py-4 text-sm font-mono text-blue-600 dark:text-blue-400">{q.dimension}</td>
                                                    <td className="px-6 py-4 text-sm font-mono">{q.agreeType}</td>
                                                    <td className="px-6 py-4 text-sm font-mono">{q.disagreeType}</td>
                                                    <td className="px-6 py-4 text-sm">{q.weight}</td>
                                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(q)}
                                                            className="text-blue-500 hover:text-blue-700 p-1 transition-colors"
                                                            title="Edit Question"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(q._id)}
                                                            className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                                            title="Delete Question"
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {MBTI_TYPES.map(type => {
                                const assignedCourses = courses.filter(c => c.suitablePersonalityTypes?.includes(type));
                                return (
                                    <div key={type} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-transparent hover:border-blue-500 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{type}</h3>
                                            <button
                                                onClick={() => openMappingModal(type)}
                                                className="p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50 dark:bg-gray-700 dark:group-hover:bg-blue-900/30 text-gray-500 group-hover:text-blue-600 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Courses</p>
                                            <div className="flex flex-wrap gap-2">
                                                {assignedCourses.length > 0 ? (
                                                    assignedCourses.map(course => (
                                                        <span key={course._id} className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                                            <BookOpen className="w-2 h-2" /> {course.title.substring(0, 15)}...
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No courses assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Mapping Modal */}
                {selectedType && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Map Courses for {selectedType}</h3>
                                    <p className="text-sm text-gray-500">Select which courses are suitable for this personality type</p>
                                </div>
                                <button onClick={() => setSelectedType(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="relative mb-6">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search courses..."
                                        value={courseSearch}
                                        onChange={(e) => setCourseSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {filteredCourses.map(course => {
                                        const isSelected = tempSelectedCourses.includes(course._id);
                                        return (
                                            <div
                                                key={course._id}
                                                onClick={() => toggleCourseSelection(course._id)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'}`}>
                                                        <BookOpen className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-semibold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>{course.title}</h4>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{course.categoryId?.name || 'Uncategorized'}</p>
                                                    </div>
                                                </div>
                                                {isSelected && <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white"><ChevronRight className="w-4 h-4" /></div>}
                                            </div>
                                        );
                                    })}
                                    {filteredCourses.length === 0 && (
                                        <div className="text-center py-10 text-gray-500">No courses found matching "{courseSearch}"</div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 text-right">
                                <button
                                    onClick={() => setSelectedType(null)}
                                    className="px-6 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateMapping}
                                    disabled={mappingLoading}
                                    className="px-8 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {mappingLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Mapping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ManageQuestions;
