import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchOverview } from "../../store/slices/dashboard";
import {
  BookOpen,
  Users,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  IndianRupee,
  Eye,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { overview, loading, error } = useAppSelector(
    (state) => state.dashboard
  );


  const navigate = useNavigate();
  useEffect(() => {
    dispatch(fetchOverview());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error loading dashboard</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const { counts, latest } = overview;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'Inr',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="w-3 h-3" />;
      case "resolved":
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {counts?.totalCourses}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {counts?.totalStudents}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Support Tickets
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {counts?.totalSupportTickets}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <HelpCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Forum Threads
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {counts?.totalForumThreads}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sales Overview
              </h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {counts?.todaySales}
                </p>
                <p className="text-sm text-gray-600">Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {counts?.thisMonthSales}
                </p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {counts?.thisYearSales}
                </p>
                <p className="text-sm text-gray-600">This Year</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {counts?.totalSales}
                </p>
                <p className="text-sm text-gray-600">All Time</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold">Platform Revenue</h3>
              <IndianRupee className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {formatCurrency(counts?.platformIncome)}
              </p>
              <p className="text-blue-100 text-sm mt-1">
                Total Revenue Generated
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Latest Courses
              </h3>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {latest?.courses?.slice(0, 3).map((course) => (
                <div key={course._id} className="flex items-start space-x-3">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y3RjhGQSIvPgo8cGF0aCBkPSJNMjQgMTZWMzJNMzIgMjRIMTYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(course.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
            onClick={()=>navigate('/courses/all/courses')}
            className="w-full mt-4 flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 py-2">
              <span>View All Courses</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Support Tickets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Tickets
              </h3>
              <HelpCircle className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {latest?.supportTickets?.slice(0, 3).map((ticket) => (
                <div
                  key={ticket?._id}
                  className="border-l-4 border-blue-500 pl-4"
                >
                  <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ticket?.subject?.substring(0, 30)}...
                    </p>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        ticket?.status
                      )}`}
                    >
                      {getStatusIcon(ticket?.status)}
                      <span className="capitalize">{ticket?.status}</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {ticket?.userId?.fullName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(ticket?.createdAt)}
                  </p>
                </div>
              ))}
            </div>
            <button 
            onClick={()=>navigate('/requests')}
            className="w-full mt-4 flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 py-2">
              <span>View All Tickets</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Forum Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Forum Activity
              </h3>
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {latest?.forumThreads?.slice(0, 3)?.map((thread) => (
                <div key={thread._id} className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-purple-600">
                        {thread?.createdBy?.fullName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {thread.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {thread?.createdBy?.fullName}
                      </p>
                      {thread?.courseId && (
                        <p className="text-xs text-gray-400 truncate">
                          in {thread?.courseId?.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatDate(thread.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
