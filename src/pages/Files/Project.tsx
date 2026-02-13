import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectAnalytics } from '../../store/slices/anayltics';
import { RootState } from '../../store';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Activity, 
  Eye, 
  Search, 
  Filter, 
  Calendar,
  ShoppingCart,
  UserCheck,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Loader,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Clock,
  CheckCircle,
  Package,
  XCircle,
  ChevronRight,
  TrendingDown,
  Mail,
  User,
  Settings
} from 'lucide-react';

const Project = () => {
  const dispatch = useDispatch();
  const { projectAnalytics, loading, error } = useSelector(
    (state: RootState) => state.analytics
  );

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  useEffect(() => {
    dispatch(fetchProjectAnalytics());
  }, [dispatch]);

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!projectAnalytics) return null;

    const { summary, topEntities, trends, revenueBreakdown } = projectAnalytics;
    
    // Calculate growth rates
    const enrollmentGrowth = trends?.enrollments ? 
      ((trends.enrollments[trends.enrollments.length - 1]?.count || 0) - 
       (trends.enrollments[0]?.count || 0)) / (trends.enrollments[0]?.count || 1) * 100 : 0;

    const revenueGrowth = trends?.sales ? 
      ((trends.sales[trends.sales.length - 1]?.revenue || 0) - 
       (trends.sales[0]?.revenue || 0)) / (trends.sales[0]?.revenue || 1) * 100 : 0;

    const averageRevenuePerUser = summary?.totalUsers ? 
      summary.totalRevenue / summary.totalUsers : 0;

    const conversionRate = summary?.totalUsers ? 
      (summary.totalEnrollments / summary.totalUsers) * 100 : 0;

    return {
      ...summary,
      enrollmentGrowth,
      revenueGrowth,
      averageRevenuePerUser,
      conversionRate
    };
  }, [projectAnalytics]);

  // Filtered courses based on search
  const filteredCourses = useMemo(() => {
    if (!projectAnalytics?.topEntities?.topCourses) return [];
    
    return projectAnalytics.topEntities.topCourses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projectAnalytics?.topEntities?.topCourses, searchTerm]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Loading Analytics
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Fetching your project data and insights...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
            {error}
          </p>
          <button
            onClick={() => dispatch(fetchProjectAnalytics())}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!projectAnalytics) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            No Data Available
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            No analytics data found for your project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="text-blue-600" size={36} />
                Project Analytics
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive insights into your learning platform performance
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => dispatch(fetchProjectAnalytics())}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="30d">Last 30 Days</option>
                <option value="7d">Last 7 Days</option>
                <option value="1d">Today</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {analytics?.totalCourses || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {analytics?.totalBundles || 0} bundles available
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight size={12} className="mr-1" />
                +12.5%
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {analytics?.totalUsers?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Conversion: {analytics?.conversionRate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight size={12} className="mr-1" />
                {analytics?.enrollmentGrowth?.toFixed(1) || 0}%
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Enrollments</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {analytics?.totalEnrollments?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Active learners
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                {/* Replace DollarSign icon with Indian Rupees symbol */}
                <span className="h-6 w-6 text-green-600 text-2xl font-bold">₹</span>
              </div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight size={12} className="mr-1" />
                {analytics?.revenueGrowth?.toFixed(1) || 0}%
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Avg: {formatCurrency(analytics?.averageRevenuePerUser || 0)}/user
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'courses', label: 'Top Courses', icon: BookOpen },
                { id: 'users', label: 'Top Users', icon: Users },
                { id: 'revenue', label: 'Revenue', icon: () => <span className="text-lg font-bold">₹</span> },
                { id: 'activity', label: 'Activity', icon: Activity }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Trends Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp size={20} />
                      Enrollment Trends
                    </h3>
                    <div className="space-y-3">
                      {projectAnalytics?.trends?.enrollments?.slice(-7).map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(item._id)}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((item.count / 10) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[30px]">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      {/* Replace DollarSign icon with Indian Rupees symbol */}
                      <span className="text-xl font-bold">₹</span>
                      Revenue Trends
                    </h3>
                    <div className="space-y-3">
                      {projectAnalytics?.trends?.sales?.slice(-5).map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(item._id)}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock size={20} />
                    Recent Signups
                  </h3>
                  <div className="space-y-3">
                    {projectAnalytics?.activityLogs?.recentSignups?.slice(0, 5).map((user, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-600 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <User size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Top Performing Courses
                  </h3>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 min-w-[300px]">
                    <Search size={16} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course, index) => (
                      <div key={course._id} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                                #{index + 1}
                              </span>
                              <BookOpen size={16} className="text-gray-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                              {course.title}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
  <span className="flex items-center gap-1">
    <Users size={14} />
    {(course.enrolledStudentsCount ? course.enrolledStudentsCount - 20000 : 0).toLocaleString()} enrolled
  </span>
</div>

                          </div>
                     
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                      No courses found.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  User Analytics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Users size={18} />
                      Top Users
                    </h4>
                    <div className="space-y-3">
                      {projectAnalytics?.topEntities?.topUsers?.slice(0, 5).map((user, index) => (
                        <div key={user._id} className="flex items-center gap-3 py-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(user.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp size={18} />
                      Signup Trends
                    </h4>
                    <div className="space-y-3">
                      {projectAnalytics?.trends?.signups?.slice(-7).map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(item._id)}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((item.count / 40) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[20px]">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Revenue Analytics
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen size={18} />
                      Top Revenue Courses
                    </h4>
                    <div className="space-y-4">
                      {projectAnalytics?.topEntities?.topRevenueCourses?.map((course, index) => (
                        <div key={course._id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-600 last:border-0">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                              {course.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Course ID: {course._id.substring(0, 8)}...
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-600">
                              {formatCurrency(course.totalSales)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              #{index + 1}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Package size={18} />
                      Revenue Breakdown
                    </h4>
                    <div className="space-y-4">
                      {projectAnalytics?.revenueBreakdown?.courseRevenue?.map((item, index) => (
                        <div key={item._id} className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                              {item.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min((item.total / (analytics?.totalRevenue || 1)) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[60px] text-right">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bundle Revenue Section */}
                {projectAnalytics?.revenueBreakdown?.bundleRevenue?.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg mt-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Package size={18} />
                      Bundle Revenue
                    </h4>
                    <div className="space-y-4">
                      {projectAnalytics.revenueBreakdown.bundleRevenue.map((item, index) => (
                        <div key={item._id} className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                              {item.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min((item.total / (analytics?.totalRevenue || 1)) * 100, 100)}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[60px] text-right">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ShoppingCart size={18} />
                      Recent Orders
                    </h4>
                    <div className="space-y-4">
                      {projectAnalytics?.activityLogs?.recentOrders?.slice(0, 5).map((order, index) => (
                        <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-600 last:border-0">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.orderNo}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {order.items?.length || 0} item(s) • {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-600">
                              {formatCurrency(order.grandTotal?.$numberDecimal || order.grandTotal || 0)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.payment?.status === 'paid' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                              {order.payment?.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                
                </div>

                {/* Recent Enrollments Section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg mt-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserCheck size={18} />
                    Recent Enrollments
                  </h4>
                  <div className="space-y-4">
                    {projectAnalytics?.activityLogs?.recentEnrollments?.length > 0 ? (
                      projectAnalytics.activityLogs.recentEnrollments.slice(0, 10).map((enroll, index) => (
                        <div key={enroll._id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-600 last:border-0">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {enroll.type === 'courseBundle' ? 'Bundle' : 'Course'}: {enroll.courseId || enroll.courseBundleId}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              User: {enroll.userId} • {formatDate(enroll.enrolledAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              {enroll.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No recent enrollments found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;