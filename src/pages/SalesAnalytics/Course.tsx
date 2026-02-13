import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseSalesAnalytics } from "../../store/slices/salesAnalyticsSlice";
import { RootState, AppDispatch } from "../../store";
import {
  BarChart2,
  ShoppingCart,
  TrendingUp,
  BookOpen,
  Search,
  SortAsc,
  SortDesc,
  Users,
  Award,
  Target,
  Loader,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar,
  PieChart,
} from "lucide-react";

interface CourseData {
  _id: string;
  orderCount: number;
  courseId: string;
  title: string;
  totalSales: number;
}

interface SalesAnalyticsState {
  loading: boolean;
  error: string | null;
  data: CourseData[] | null;
}

const Course: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, data } = useSelector(
    (state: RootState) => state.salesAnalytics
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "totalSales" | "orderCount">("totalSales");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Get token from localStorage or context - adjust as needed for your app
  const token = localStorage.getItem("token") || ""; // Replace with your token management logic

  useEffect(() => {
    if (token) {
      dispatch(fetchCourseSalesAnalytics({ token }));
    }
  }, [dispatch, token]);

  // Memoized calculations for analytics
  const analytics = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCourses: 0,
        averageRevenuePerCourse: 0,
        topPerformingCourse: null,
        averageOrdersPerCourse: 0,
      };
    }

    const totalRevenue = data.reduce((sum, course) => sum + course.totalSales, 0);
    const totalOrders = data.reduce((sum, course) => sum + course.orderCount, 0);
    const totalCourses = data.length;
    const averageRevenuePerCourse = totalCourses > 0 ? totalRevenue / totalCourses : 0;
    const averageOrdersPerCourse = totalCourses > 0 ? totalOrders / totalCourses : 0;
    const topPerformingCourse = [...data].sort((a, b) => b.totalSales - a.totalSales)[0];

    return {
      totalRevenue,
      totalOrders,
      totalCourses,
      averageRevenuePerCourse,
      topPerformingCourse,
      averageOrdersPerCourse,
    };
  }, [data]);

  // Filtered and sorted courses
  const filteredAndSortedCourses = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let filtered = data.filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = (valueB as string).toLowerCase();
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    return filtered;
  }, [data, searchTerm, sortBy, sortOrder]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return <Filter size={16} className="text-gray-400" />;
    return sortOrder === "asc" ? (
      <SortAsc size={16} className="text-blue-500" />
    ) : (
      <SortDesc size={16} className="text-blue-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-white/[0.03]">
        <div className="flex flex-col items-center p-6 bg-white dark:bg-white/[0.06] rounded-lg shadow-xl">
          <Loader className="animate-spin h-10 w-10 text-blue-600 mb-4" />
          <p className="text-xl font-medium text-gray-700 dark:text-white/90">
            Loading Course Sales Analytics...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching sales data and performance metrics.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-white/[0.03]">
        <div className="flex flex-col items-center p-6 bg-white dark:bg-white/[0.06] rounded-lg shadow-xl">
          <XCircle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-xl font-medium text-gray-700 dark:text-white/90">
            Error Loading Sales Data
          </p>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
            {error}. Please check your connection and try again.
          </p>
          <button
            onClick={() => token && dispatch(fetchCourseSalesAnalytics({ token }))}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-white/[0.03] text-gray-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white/90 border-b-4 border-blue-600 pb-4 flex items-center gap-3 mb-2">
            <BarChart2 className="text-blue-600" size={32} />
            Course Sales Analytics
          </h1>
          <p className="text-gray-600 dark:text-white/70 text-lg">
            Track course performance, revenue, and sales trends
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-green-700 mt-1">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {formatCurrency(analytics.averageRevenuePerCourse)} per course
                </p>
              </div>
            </div>
          </div>

          {/* <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-blue-700 mt-1">
                  {analytics.totalOrders.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {analytics.averageOrdersPerCourse.toFixed(1)} per course
                </p>
              </div>
              <ShoppingCart size={40} className="text-blue-400 opacity-70" />
            </div>
          </div> */}

          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                  Active Courses
                </p>
                <p className="text-3xl font-bold text-purple-700 mt-1">
                  {analytics.totalCourses}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Generating revenue
                </p>
              </div>
              <BookOpen size={40} className="text-purple-400 opacity-70" />
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                  Top Performer
                </p>
                <p className="text-lg font-bold text-orange-700 mt-1 truncate max-w-[120px]">
                  {analytics.topPerformingCourse?.title.substring(0, 20) || "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.topPerformingCourse ? 
                    formatCurrency(analytics.topPerformingCourse.totalSales) : "No data"}
                </p>
              </div>
              <Award size={40} className="text-orange-400 opacity-70" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex-1 min-w-0">
              <div className="flex items-center bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-300 focus-within:border-blue-500 transition-colors duration-200 shadow-sm overflow-hidden">
                <Search className="text-gray-500 ml-3" size={20} />
                <input
                  type="text"
                  placeholder="Search courses by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-gray-700 dark:text-white/90 px-3 py-2.5 focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-white/80">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                  className="p-2 border border-gray-300 rounded-md bg-white dark:bg-white/[0.03] dark:text-white/90 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option className="dark:text-black" value="totalSales">Revenue</option>
                  <option className="dark:text-black" value="orderCount">Orders</option>
                  <option className="dark:text-black" value="title">Course Title</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-2 border border-gray-300 rounded-md bg-white dark:bg-white/[0.03] hover:bg-gray-100 transition-colors"
                >
                  {getSortIcon(sortBy)}
                </button>
              </div>

              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-white dark:bg-white/[0.03] text-gray-600"}`}
                >
                  <PieChart size={16} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 ${viewMode === "table" ? "bg-blue-500 text-white" : "bg-white dark:bg-white/[0.03] text-gray-600"}`}
                >
                  <BarChart2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Course Data Display */}
        {filteredAndSortedCourses.length === 0 ? (
          <div className="text-center text-gray-500 py-16 text-xl">
            <BookOpen size={50} className="mx-auto mb-4 text-gray-400" />
            <p>No courses found matching your criteria.</p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCourses.map((course) => (
              <div
                key={course._id}
                className={`bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  selectedCourse?._id === course._id ? "border-blue-500 bg-blue-50 dark:bg-white/[0.06]" : "border-gray-200"
                }`}
                onClick={() => setSelectedCourse(course)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90 line-clamp-2">
                    {course.title}
                  </h3>
                  <Eye size={20} className="text-gray-400 hover:text-blue-500 transition-colors" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-white/70">Revenue:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(course.totalSales)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-white/70">Orders:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {course.orderCount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-white/70">Avg per Order:</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/80">
                      {formatCurrency(course.totalSales / course.orderCount)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Course ID: {course.courseId.substring(0, 8)}...</span>
                    <TrendingUp className="text-green-500" size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-white/[0.03] rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-white/[0.06]">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-2">
                        Course Title {getSortIcon("title")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("totalSales")}
                    >
                      <div className="flex items-center gap-2">
                        Total Revenue {getSortIcon("totalSales")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("orderCount")}
                    >
                      <div className="flex items-center gap-2">
                        Order Count {getSortIcon("orderCount")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider"
                    >
                      Avg per Order
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider"
                    >
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-white/[0.03] divide-y divide-gray-200">
                  {filteredAndSortedCourses.map((course) => (
                    <tr
                      key={course._id}
                      className={`hover:bg-blue-50 dark:hover:bg-white/[0.06] cursor-pointer transition-colors ${
                        selectedCourse?._id === course._id ? "bg-blue-100 dark:bg-white/[0.09]" : ""
                      }`}
                      onClick={() => setSelectedCourse(course)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white/90 max-w-xs truncate">
                          {course.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-white/70">
                          ID: {course.courseId.substring(0, 12)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {formatCurrency(course.totalSales)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600">
                          {course.orderCount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white/90">
                          {formatCurrency(course.totalSales / course.orderCount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 mr-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    (course.totalSales / analytics.totalRevenue) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-white/70 min-w-[40px]">
                            {((course.totalSales / analytics.totalRevenue) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Selected Course Details Modal/Sidebar */}
        {selectedCourse && (
  <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <div className="bg-white dark:bg-white/[0.03] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">
            Course Details
          </h2>
          <button
            onClick={() => setSelectedCourse(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XCircle size={24} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white/90 mb-4">
          {selectedCourse.title}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-white/[0.06] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {/* <DollarSign className="text-green-500" size={20} /> */}
              <span className="font-medium text-gray-700 dark:text-white/80">
                Total Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(selectedCourse.totalSales)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-white/[0.06] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="text-blue-500" size={20} />
              <span className="font-medium text-gray-700 dark:text-white/80">
                Total Orders
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {selectedCourse.orderCount.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-white/[0.06] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-purple-500" size={20} />
              <span className="font-medium text-gray-700 dark:text-white/80">
                Average per Order
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(
                selectedCourse.totalSales / selectedCourse.orderCount
              )}
            </p>
          </div>

       
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 dark:text-white/80 mb-2">
            Course Information
          </h4>
          <div className="text-sm text-gray-600 dark:text-white/70 space-y-1">
            <p>
              <span className="font-medium">Course ID:</span>{" "}
              {selectedCourse.courseId}
            </p>
            <p>
              <span className="font-medium">Internal ID:</span>{" "}
              {selectedCourse._id}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default Course;