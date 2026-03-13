import React, { useEffect, useState } from "react";
import { 
    Users, 
    CheckCircle, 
    BookOpen, 
    BarChart3, 
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    TrendingUp
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { 
    fetchLearningOverview, 
    fetchPopularCourses, 
    fetchCompletionRates, 
    fetchStudentProgress,
    setCurrentPage
} from "../../store/slices/learningAnalytics";
import ComponentCard from "../../components/common/ComponentCard";

const LearningAnalytics: React.FC = () => {
    const dispatch = useAppDispatch();
    const { 
        overview, 
        popularCourses, 
        completionRates, 
        studentProgress, 
        loading, 
        pagination 
    } = useAppSelector((state) => state.learningAnalytics);

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(fetchLearningOverview());
        dispatch(fetchPopularCourses(5));
        dispatch(fetchCompletionRates(5));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchStudentProgress({ 
            page: pagination.page, 
            limit: pagination.limit, 
            search: searchTerm 
        }));
    }, [dispatch, pagination.page, searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        dispatch(setCurrentPage(1));
    };

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Learning Analytics</h1>
                    <p className="text-gray-500">Track course performance and student progress</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            dispatch(fetchLearningOverview());
                            dispatch(fetchPopularCourses(5));
                            dispatch(fetchCompletionRates(5));
                            dispatch(fetchStudentProgress({ page: pagination.page }));
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Active Students" 
                    value={overview?.activeStudentsCount || 0} 
                    icon={<Users className="w-6 h-6 text-indigo-600" />}
                    trend="+5% from last month"
                />
                <StatCard 
                    title="Avg. Completion Rate" 
                    value={`${Math.round(overview?.averageCompletionRate || 0)}%`} 
                    icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
                    trend="Up by 2% recently"
                />
                <StatCard 
                    title="Total Enrollments" 
                    value={overview?.totalEnrollments || 0} 
                    icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
                />
                <StatCard 
                    title="Total Courses" 
                    value={overview?.totalCourses || 0} 
                    icon={<BookOpen className="w-6 h-6 text-purple-600" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Courses Chart */}
                <ComponentCard title="Most Popular Courses">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={popularCourses} layout="vertical" margin={{ left: 40, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="title" 
                                    type="category" 
                                    width={120} 
                                    tick={{ fontSize: 12 }} 
                                    axisLine={false} 
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="enrollmentCount" radius={[0, 4, 4, 0]}>
                                    {popularCourses.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ComponentCard>

                {/* Completion Rates Chart */}
                <ComponentCard title="Course Completion Rates">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={completionRates}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis 
                                    dataKey="title" 
                                    tick={{ fontSize: 12 }} 
                                    axisLine={false} 
                                    interval={0}
                                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                                />
                                <YAxis tick={{ fontSize: 12 }} axisLine={false} unit="%" />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="avgProgress" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ComponentCard>
            </div>

            {/* Student Progress Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Student Progress Details</h2>
                        <p className="text-sm text-gray-500">View real-time progress for all enrolled students</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search students..." 
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Progress</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 italic">
                            {studentProgress.map((student) => (
                                <tr key={student._id} className="hover:bg-gray-50 transition no-italic">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                                                {student.userId.profilePicture ? (
                                                    <img src={student.userId.profilePicture} alt="" className="w-full h-full object-cover" />
                                                ) : student.userId.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{student.userId.fullName}</p>
                                                <p className="text-xs text-gray-500">{student.userId.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-700 font-medium">{student.courseId?.title || "N/A"}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full max-w-[120px] space-y-1.5">
                                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-600">
                                                <span>{Math.round(student.progressPercentage)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        student.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                                                    }`} 
                                                    style={{ width: `${student.progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            student.status === 'active' ? 'bg-blue-50 text-blue-700' :
                                            student.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                                            'bg-gray-50 text-gray-700'
                                        }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(student.updatedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing page <span className="font-bold text-gray-900">{pagination.page}</span> of <span className="font-bold text-gray-900">{pagination.totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button 
                            disabled={pagination.page === 1}
                            onClick={() => dispatch(setCurrentPage(pagination.page - 1))}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => dispatch(setCurrentPage(pagination.page + 1))}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    trend?: string;
}> = ({ title, value, icon, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-indigo-100 transition">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition">
                {icon}
            </div>
            {trend && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                    {trend}
                </span>
            )}
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-extrabold text-gray-900">{value}</p>
        </div>
    </div>
);

export default LearningAnalytics;
