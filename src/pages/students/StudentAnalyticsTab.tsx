import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStudentAnalytics } from "../../store/slices/students";
import {
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Activity,
  Users,
  MessageCircle,
  Calendar,
  BarChart3,
  Target,
  ArrowUpRight,
  PlayCircle,
  DollarSign,
  FileText,
} from "lucide-react";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const StatCard = ({ icon: Icon, value, label, trend, color = "blue", bgGradient }: any) => (
  <div className={`relative overflow-hidden rounded-2xl ${bgGradient || 'bg-gradient-to-br from-white to-gray-50'} p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center text-green-600 text-sm font-medium">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          {trend}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
    <div className={`absolute -top-4 -right-4 w-16 h-16 bg-${color}-100 rounded-full opacity-20`} />
  </div>
);

const ProgressBar = ({ percentage, color = "blue" }: { percentage: number; color?: string }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className={`bg-${color}-500 h-2 rounded-full transition-all duration-500 ease-out`}
      style={{ width: `${Math.min(percentage, 100)}%` }}
    />
  </div>
);

const ActivityCard = ({ activity, index }: { activity: any; index: number }) => (
  <div className="group relative bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
    <div className="absolute top-4 right-4">
      {activity.completed ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <PlayCircle className="w-5 h-5 text-blue-500" />
      )}
    </div>

    
    <div className="pr-8">
      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        Course: {activity.courseName}
      </h4>
      <p className="text-sm text-black-600 mb-3">Lesson: {activity.lessonName}</p>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-700">Progress</span>
            <span className="text-xs font-bold text-blue-600">
              {Math.round(activity.progressPercentage)}%
            </span>
          </div>
          <ProgressBar percentage={activity.progressPercentage} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
         
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {activity.lastUpdatedAt ? formatDate(activity.lastUpdatedAt) : "N/A"}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StudentAnalyticsTab = ({ studentId }: { studentId: string }) => {
  const dispatch = useDispatch();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    dispatch(fetchStudentAnalytics(studentId))
      .unwrap()
      .then((data) => {
        setAnalytics(data?.data || data);
        setError(null);
      })
      .catch(() => {
        setError("Failed to fetch analytics");
        setAnalytics(null);
      })
      .finally(() => setLoading(false));
  }, [studentId, dispatch]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading analytics...</p>
        <p className="text-sm text-gray-400">Please wait while we fetch the data</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-[400px] flex flex-col justify-center items-center">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 text-center max-w-md">
          <XCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Analytics</h3>
          <p className="text-red-600">{error || "No analytics data found."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const completionRate = analytics.totalEnrollments > 0 
    ? Math.round((analytics.completedCourses / analytics.totalEnrollments) * 100) 
    : 0;

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Analytics Dashboard</h2>
        <p className="text-gray-600">Comprehensive overview of learning progress and activities</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          value={analytics.totalEnrollments}
          label="Total Enrollments"
          color="blue"
          bgGradient="bg-gradient-to-br from-blue-50 to-blue-100"
        />
        <StatCard
          icon={Award}
          value={analytics.completedCourses}
          label="Completed Courses"
          trend={`${completionRate}%`}
          color="green"
          bgGradient="bg-gradient-to-br from-green-50 to-green-100"
        />
        <StatCard
          icon={Target}
          value={analytics.activeCourses}
          label="Active Courses"
          color="purple"
          bgGradient="bg-gradient-to-br from-purple-50 to-purple-100"
        />
        <StatCard
          icon={ShoppingCart}
          value={analytics.totalOrders}
          label="Total Orders"
          color="indigo"
          bgGradient="bg-gradient-to-br from-indigo-50 to-indigo-100"
        />
      </div>

     

      {/* Recent Learning Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Activity className="w-6 h-6 mr-3" />
            Recent Learning Activity
          </h3>
          <p className="text-blue-100 text-sm mt-1">Track your latest progress and achievements</p>
        </div>
        <div className="p-6">
          {analytics.recentLearningActivity?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.recentLearningActivity.map((activity: any, idx: number) => (
                <ActivityCard key={idx} activity={activity} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="mx-auto w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No recent learning activity available</p>
              <p className="text-gray-400 text-sm">Start a course to see your progress here</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Enrollments & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Enrollments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <BookOpen className="w-6 h-6 mr-3" />
              Recent Enrollments
            </h3>
          </div>
          <div className="p-6">
            {analytics.recentEnrollments?.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentEnrollments.map((enr: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{enr.courseName}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Status: <span className="font-medium text-indigo-600">{enr.status}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Enrolled</p>
                      <p className="text-sm font-medium text-gray-700">
                        {enr.enrolledAt ? formatDate(enr.enrolledAt) : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500">No recent enrollments</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <ShoppingCart className="w-6 h-6 mr-3" />
              Recent Orders
            </h3>
          </div>
          <div className="p-6">
            {analytics.recentOrders?.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentOrders.map((order: any) => (
                  <div key={order.orderId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Order #{order.orderId}</h4>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        ₹{order.grandTotal?.$numberDecimal}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Placed</p>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500">No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Submissions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <BarChart3 className="w-6 h-6 mr-3" />
            Quiz Submissions
          </h3>
        </div>
        <div className="p-6">
          {analytics.quizSubmissions?.length > 0 ? (
            <div className="space-y-4">
              {analytics.quizSubmissions.map((quiz: any, idx: number) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{quiz.quizTitle}</h4>
                    <p className="text-sm text-gray-500">
                      Course: <span className="font-medium text-yellow-700">{quiz.courseTitle}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Lesson: <span className="font-medium text-yellow-700">{quiz.lessonTitle}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end mt-2 md:mt-0">
                    <span className="text-xs text-gray-500">Submitted</span>
                    <span className="text-sm font-medium text-gray-700">{quiz.submittedAt ? formatDate(quiz.submittedAt) : "N/A"}</span>
                    <span className={`mt-1 px-2 py-1 rounded-full text-xs font-bold ${quiz.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {quiz.passed ? "Passed" : "Failed"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Score: {quiz.score}/{quiz.totalMarks} ({quiz.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500">No quiz submissions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Submissions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <FileText className="w-6 h-6 mr-3" />
            Assignment Submissions
          </h3>
        </div>
        <div className="p-6">
          {analytics.assignmentSubmissions?.length > 0 ? (
            <div className="space-y-4">
              {analytics.assignmentSubmissions.map((assignment: any, idx: number) => (
                <div key={idx}
                                            onClick={() => window.open(`/assignments/submissions/${assignment?._id}`, "_blank")}

                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{assignment.assignmentTitle}</h4>
                    <p className="text-sm text-gray-500">
                      Course: <span className="font-medium text-pink-700">{assignment.courseTitle}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Lesson: <span className="font-medium text-pink-700">{assignment.lessonTitle}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end mt-2 md:mt-0">
                    <span className="text-xs text-gray-500">Submitted</span>
                    <span className="text-sm font-medium text-gray-700">{assignment.submittedAt ? formatDate(assignment.submittedAt) : "N/A"}</span>
                    <span className={`mt-1 px-2 py-1 rounded-full text-xs font-bold ${assignment.is_complete ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {assignment.is_complete ? "Completed" : assignment.status}
                    </span>
                    {assignment.scoreGiven === null && (
                        <button
                            className="mt-2 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold hover:bg-red-600 transition-colors"
                            onClick={() => window.open(`/assignments/submissions/${assignment?._id}`, "_blank")}
                        >
                            Grade Assignment
                        </button>
                    )}
                    {assignment.scoreGiven !== null && (
                      <span className="text-xs text-gray-500 mt-1">
                        Score: {assignment.scoreGiven}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500">No assignment submissions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsTab;