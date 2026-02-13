import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../../store/slices/anayltics";
import { RootState, AppDispatch } from "../../store";
import {
  RefreshCw,
  Calendar,
  Eye,
  Clock,
  Users,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Search,
  User,
} from "lucide-react";

const VideoAnalyticsDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, loading, error } = useSelector(
    (state: RootState) => state.analytics
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [openUserEngagement, setOpenUserEngagement] = useState(true);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m " : ""}${secs}s`;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-blue-700">
        <p>Loading Dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-red-600">
        <p>Error: {error}</p>
      </div>
    );

  if (!dashboard)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-500">
        <p>No dashboard data available.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-white/[0.03] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Project Analytics
            </h1>
            <p className="text-gray-500">
              Comprehensive insights into your learning platform performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(fetchDashboard())}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              <RefreshCw size={16} /> Refresh
            </button>
      
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <h3 className="text-2xl font-bold text-blue-700">
                {formatNumber(dashboard.overview?.totalViews || 0)}
              </h3>
              <span className="text-green-600 text-xs">+12.5%</span>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Eye className="text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Watch Time</p>
              <h3 className="text-2xl font-bold text-purple-700">
                {formatWatchTime(dashboard.overview?.totalWatchTime || 0)}
              </h3>
              <span className="text-green-600 text-xs">+8.2%</span>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <Clock className="text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <h3 className="text-2xl font-bold text-green-700">
                {formatNumber(dashboard.overview?.activeUsers || 0)}
              </h3>
              <span className="text-green-600 text-xs">+5.4%</span>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <Users className="text-green-600" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Completion</p>
              <h3 className="text-2xl font-bold text-orange-700">
                {dashboard.overview?.avgCompletionRate?.toFixed(1) || "0"}%
              </h3>
              <span className="text-green-600 text-xs">+3.1%</span>
            </div>
            <div className="bg-orange-50 p-3 rounded-full">
              <TrendingUp className="text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6 flex gap-6">
          {["Overview"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Overview Table */}
        {activeTab === "Overview" && (
          <>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-10">
              <div className="flex items-center p-4 border-b">
                <Search className="text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ml-3 flex-1 bg-transparent outline-none text-sm"
                />
              </div>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Title</th>
                    <th className="px-6 py-3 text-left">Views</th>
                    <th className="px-6 py-3 text-left">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.videoPerformance
                    ?.filter((video) =>
                      video.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((video) => (
                      <tr
                        key={video.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-3">{video.title}</td>
                        <td className="px-6 py-3 text-blue-600">
                          {formatNumber(video.views)}
                        </td>
                        <td className="px-6 py-3 text-blue-600">
                          {video.engagement?.toFixed(2) || "0"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* User Engagement Section */}
            <section className="mb-10 bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-gray-200">
              <h2
                className="text-xl sm:text-2xl font-bold mb-5 text-gray-800 flex sm:flex-row items-center sm:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setOpenUserEngagement(!openUserEngagement)}
              >
                <div className="flex items-center gap-2 dark:text-white/90">
                  <User className="text-blue-600" size={24} /> User Engagement
                </div>
                {openUserEngagement ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </h2>
              {openUserEngagement && (
                <div className="overflow-x-auto rounded-lg border max-h-[700px] overflow-scroll border-gray-200 mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 dark:bg-white/[0.06]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-white/90 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-white/90 uppercase tracking-wider">
                          Videos Watched
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-white/90 uppercase tracking-wider">
                          Last Active
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-white/[0.03] divide-y divide-gray-200">
                      {dashboard.userEngagement?.map((user) => (
                        <tr
                          key={user.userId}
                          className="hover:bg-gray-50 hover:dark:bg-white/[0.06] transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white/90">
                            {user?.userId?.fullName || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            {user.videosWatched}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white/70">
                            {user.lastActive ? user.lastActive : "Never Active"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dashboard.userEngagement?.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No user engagement data available.
                    </p>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoAnalyticsDashboard;
