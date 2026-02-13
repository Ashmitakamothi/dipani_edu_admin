import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVideoSessions } from "../../store/slices/anayltics"; // Assuming this correctly fetches the data
import { RootState, AppDispatch } from "../../store";
import {
  Video,
  User,
  Clock,
  Search,
  ChevronLeft, // For pagination
  ChevronRight, // For pagination
  ChevronDown,
  ChevronUp,
  Eye,
  Play,
  Pause,
  SkipForward,
  Repeat,
  ExternalLink,
  EyeOff,
  Activity,
  MousePointer,
  Volume2,
  Settings,
  BarChart2,
  Users,
  Film,
  Globe,
  Loader,
  XCircle,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";

// --- Utility Functions (Kept from original) ---

const formatWatchTime = (seconds: number) => {
  if (seconds === undefined || seconds === null) return "N/A";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  let timeString = "";
  if (h > 0) timeString += `${h}h `;
  if (m > 0) timeString += `${m}m `;
  timeString += `${s}s`;
  return timeString.trim();
};

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case "VIDEO_PLAYED":
      return <Play size={16} className="text-green-500" />;
    case "VIDEO_PAUSED":
      return <Pause size={16} className="text-orange-500" />;
    case "VIDEO_SEEKED":
      return <SkipForward size={16} className="text-blue-500" />;
    case "VIDEO_RETRY":
      return <Repeat size={16} className="text-yellow-500" />;
    case "VIDEO_OPENED_NEW_TAB":
      return <ExternalLink size={16} className="text-purple-500" />;
    case "TAB_VISIBLE":
      return <Eye size={16} className="text-green-600" />;
    case "TAB_HIDDEN":
      return <EyeOff size={16} className="text-red-500" />;
    case "QUALITY_CHANGED":
      return <Settings size={16} className="text-indigo-500" />;
    case "VOLUME_CHANGED":
      return <Volume2 size={16} className="text-teal-500" />;
    default:
      return <Activity size={16} className="text-gray-500" />;
  }
};

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case "VIDEO_PLAYED":
      return "bg-green-50 border-green-200";
    case "VIDEO_PAUSED":
      return "bg-orange-50 border-orange-200";
    case "VIDEO_SEEKED":
      return "bg-blue-50 border-blue-200";
    case "VIDEO_RETRY":
      return "bg-yellow-50 border-yellow-200";
    case "VIDEO_OPENED_NEW_TAB":
      return "bg-purple-50 border-purple-200";
    case "TAB_VISIBLE":
      return "bg-green-50 border-green-200";
    case "TAB_HIDDEN":
      return "bg-red-50 border-red-200";
    case "QUALITY_CHANGED":
      return "bg-indigo-50 border-indigo-200";
    case "VOLUME_CHANGED":
      return "bg-teal-50 border-teal-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const formatEventType = (eventType: string) => {
  return eventType
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// --- InteractionDetails Component (Minor Enhancements, kept mostly same) ---

const InteractionDetails: React.FC<{ interactions: any[] }> = ({
  interactions,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState("");

  const filteredInteractions = interactions.filter(
    (interaction) =>
      interaction.eventType.toLowerCase().includes(filter.toLowerCase()) ||
      (interaction.additionalData &&
        JSON.stringify(interaction.additionalData)
          .toLowerCase()
          .includes(filter.toLowerCase()))
  );

  const eventTypeCounts = interactions.reduce((acc, interaction) => {
    acc[interaction.eventType] = (acc[interaction.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (interactions.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-4 px-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-2">
        <Info size={16} className="text-gray-400" /> No interactions recorded
        for this session.
      </div>
    );
  }

  return (
    <div className="mt-4 border border-gray-200  bg-gray-50 overflow-hidden">
      <div
        className="p-3 cursor-pointer flex sm:flex-row items-center sm:items-center justify-between gap-4 bg-gray-100 hover:bg-gray-200 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-gray-700">
          <MousePointer size={18} />
          <span className="font-semibold">
            {interactions.length} Detailed Interactions
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-600" />
        ) : (
          <ChevronDown size={20} className="text-gray-600" />
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-white">
          {/* Event Type Summary */}
          <div className="mb-4 bg-blue-50 p-3 rounded-md border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Interaction Summary
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(eventTypeCounts).map(([eventType, count]) => (
                <span
                  key={eventType}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getEventColor(
                    eventType
                  )} text-gray-800`}
                >
                  {getEventIcon(eventType)}
                  {formatEventType(eventType)}:{" "}
                  <span className="font-bold">{count}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="mb-4">
            <div className="flex items-center bg-white rounded-lg border border-gray-300 focus-within:border-blue-500 transition-colors duration-200 shadow-sm">
              <Search className="text-gray-400 ml-3" size={18} />
              <input
                type="text"
                placeholder="Filter events (e.g., 'play', 'seek', 'quality')..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-transparent text-sm px-3 py-2.5 focus:outline-none placeholder-gray-400"
              />
              {filter && (
                <button
                  onClick={() => setFilter("")}
                  className="mr-2 p-1 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                  aria-label="Clear filter"
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Interactions List */}
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredInteractions.length > 0 ? (
              filteredInteractions.map((interaction, index) => (
                <div
                  key={interaction._id || index}
                  className={`p-3 rounded-lg border shadow-sm ${getEventColor(
                    interaction.eventType
                  )}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getEventIcon(interaction.eventType)}
                      <div>
                        <div className="font-semibold text-sm text-gray-800">
                          {formatEventType(interaction.eventType)}
                        </div>
                        <div className="text-xs text-gray-600">
                          <Clock
                            size={12}
                            className="inline mr-1 text-gray-500"
                          />
                          {new Date(interaction.timestamp).toLocaleString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    {/* <div className="text-right text-xs text-gray-500">
                      <div>Video Time: <span className="font-medium text-gray-700">{interaction.currentTime?.toFixed(1)}s</span></div>
                      <div>Watch Progress: <span className="font-medium text-gray-700">{interaction.watchProgress?.toFixed(1)}%</span></div>
                    </div> */}
                  </div>

                  {/* Additional Data */}
                  {/* {interaction.additionalData && Object.keys(interaction.additionalData).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                      <div className="font-medium text-gray-600 mb-1">Details:</div>
                      <div className="bg-white rounded-md p-2 text-gray-700 border border-gray-100 grid grid-cols-2 gap-x-4 gap-y-1">
                        {Object.entries(interaction.additionalData).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-0.5">
                            <span className="font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="ml-2 text-right text-gray-800 font-semibold">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6 text-sm">
                No interactions found matching "{filter}". Try a different
                search term.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Session Component (Rework for Master-Detail View with Pagination) ---

const Session: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { videoMetrics, loading, error } = useSelector(
    (state: RootState) => state.analytics
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<
    "totalWatchTime" | "completionPercentage" | "userName" | "timestamp"
  >("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

  useEffect(() => {
    dispatch(fetchVideoSessions());
  }, [dispatch]);

  const sessions = useMemo(() => {
    if (!videoMetrics) return [];

    const rawSessions = Array.isArray(videoMetrics)
      ? videoMetrics
      : typeof videoMetrics === "object" && videoMetrics !== null
      ? Object.values(videoMetrics).flatMap((v) => (Array.isArray(v) ? v : [v]))
      : [];

    return rawSessions.map((session: any) => ({
      ...session,
      _id: session._id || session.sessionId, // Ensure a consistent ID
      videoTitle: session.videoId?.title || "Unknown Video",
      lessonTitle: session.videoId?.lessonId?.title || "Unknown Lesson",
      userName: session.userId?.fullName || "Unknown User",
      userId: session.userId?._id || session.userId, // Standardize userId
    }));
  }, [videoMetrics]);

  const sortedAndFilteredSessions = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    let filtered = sessions.filter((session: any) => {
      return (
        session.userName?.toLowerCase().includes(lowerCaseSearch) ||
        session.videoTitle?.toLowerCase().includes(lowerCaseSearch) ||
        session.lessonTitle?.toLowerCase().includes(lowerCaseSearch) ||
        session.userId?.toLowerCase().includes(lowerCaseSearch) ||
        (session.ipAddress &&
          session.ipAddress.toLowerCase().includes(lowerCaseSearch))
      );
    });

    filtered.sort((a, b) => {
      let valA: any, valB: any;
      if (sortBy === "timestamp") {
        valA = new Date(a.timestamp || 0).getTime();
        valB = new Date(b.timestamp || 0).getTime();
      } else if (sortBy === "userName") {
        valA = a.userName.toLowerCase();
        valB = b.userName.toLowerCase();
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      } else {
        valA = a[sortBy] || 0;
        valB = b[sortBy] || 0;
      }

      if (sortOrder === "asc") {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

    return filtered;
  }, [sessions, searchTerm, sortBy, sortOrder]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndFilteredSessions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedAndFilteredSessions.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Re-select first item on search/sort/page change if current selection is not on new page
  useEffect(() => {
    if (
      selectedSession &&
      !currentItems.some((item) => item._id === selectedSession._id)
    ) {
      // If the selected session is no longer in the current view, clear selection
      // Or you could attempt to re-select the first item of the new page
      setSelectedSession(null);
    }
    // If the current page changes due to filtering/sorting, go back to page 1
    // This is important to ensure consistency when filters/sorts change
    setCurrentPage(1);
  }, [sortedAndFilteredSessions, selectedSession]);

  // Aggregate Metrics for Dashboard Cards (same as before)
  const totalSessions = sessions.length;
  const totalWatchTime = sessions.reduce(
    (sum, s) => sum + (s.totalWatchTime || 0),
    0
  );
  const uniqueUsers = new Set(sessions.map((s) => s.userId)).size;
  const averageSessionWatchTime =
    totalSessions > 0 ? totalWatchTime / totalSessions : 0;

  const handleRowClick = useCallback((session: any) => {
    setSelectedSession(session);
  }, []);

  const handleSort = useCallback(
    (column: typeof sortBy) => {
      if (sortBy === column) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(column);
        setSortOrder("desc"); // Default sort order for new column
      }
      setCurrentPage(1); // Reset to first page on sort change
    },
    [sortBy]
  );

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy === column) {
      return sortOrder === "asc" ? (
        <ChevronUp size={14} />
      ) : (
        <ChevronDown size={14} />
      );
    }
    return null;
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    // Show a limited range of page numbers around the current page for better UX
    const maxPageNumbersToShow = 5;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxPageNumbersToShow / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

    if (endPage - startPage + 1 < maxPageNumbersToShow) {
      startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages, currentPage]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-white/[0.03] text-blue-700">
        <div className="flex flex-col items-center p-6 bg-white dark:bg-white/[0.06] rounded-lg shadow-xl">
          <Loader className="animate-spin h-10 w-10 text-blue-600 mb-4" />
          <p className="text-xl font-medium text-gray-700 dark:text-white/90">
            Loading Video Session Analytics...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This might take a moment depending on data volume.
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-white/[0.03] text-red-600">
        <div className="flex flex-col items-center p-6 bg-white dark:bg-white/[0.06] rounded-lg shadow-xl">
          <XCircle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-xl font-medium text-gray-700 dark:text-white/90">
            Error Loading Data
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {error}. Please try again later.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-white/[0.03] text-gray-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white/90 border-b-4 border-blue-600 pb-4 flex items-center gap-3">
          <BarChart2 className="text-blue-600" size={32} /> Video Engagement
          Dashboard
        </h1>

        {/* Overview Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-blue-200 flex sm:flex-row items-center sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                Total Sessions
              </p>
              <p className="text-3xl font-bold text-blue-700 mt-1">
                {totalSessions}
              </p>
            </div>
            <Video size={40} className="text-blue-400 opacity-70" />
          </div>

          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-green-200 flex sm:flex-row items-center sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                Unique Users
              </p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {uniqueUsers}
              </p>
            </div>
            <Users size={40} className="text-green-400 opacity-70" />
          </div>

          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-purple-200 flex sm:flex-row items-center sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                Total Watch Time
              </p>
              <p className="text-3xl font-bold text-purple-700 mt-1">
                {formatWatchTime(totalWatchTime)}
              </p>
            </div>
            <Clock size={40} className="text-purple-400 opacity-70" />
          </div>

          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-orange-200 flex sm:flex-row items-center sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-white/80  ">
                Avg. Session Watch Time
              </p>
              <p className="text-3xl font-bold text-orange-700 mt-1">
                {formatWatchTime(averageSessionWatchTime)}
              </p>
            </div>
            <Activity size={40} className="text-orange-400 opacity-70" />
          </div>
        </div>

        {/* Master-Detail Section */}
        <section className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Session List */}
          <div className="flex-1 bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-lg border border-gray-200 lg:min-h-[70vh] lg:max-w-[70%]">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white/90 border-b border-gray-200 pb-3 flex items-center gap-2">
              <Film className="text-indigo-600" size={24} /> Session Log
            </h2>

            {/* Search and Sort */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-300 focus-within:border-blue-500 transition-colors duration-200 shadow-sm overflow-hidden">
                  <Search className="text-gray-500 ml-3" size={20} />
                  <input
                    type="text"
                    placeholder="Search sessions by user name, video, lesson, or user ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-gray-700 dark:text-white/90 px-3 py-2.5 focus:outline-none placeholder-gray-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mr-2 p-1 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                      aria-label="Clear search"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/90">
                <span className="font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                  className="p-2 border border-gray-300 rounded-md bg-white dark:bg-white/[0.03] focus:ring-blue-500 focus:border-blue-500"
                >
                  <option className="dark:text-black" value="timestamp">
                    Date
                  </option>
                  <option className="dark:text-black" value="userName">
                    User Name
                  </option>
                  <option className="dark:text-black" value="totalWatchTime">
                    Watch Time
                  </option>
                  <option
                    className="dark:text-black"
                    value="completionPercentage"
                  >
                    Completion %
                  </option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  className="p-2 border border-gray-300 rounded-md bg-white dark:bg-white/[0.03] hover:bg-gray-100 transition-colors"
                  aria-label={`Sort order ${
                    sortOrder === "asc" ? "ascending" : "descending"
                  }`}
                >
                  {sortOrder === "asc" ? (
                    <TrendingUp size={20} />
                  ) : (
                    <TrendingDown size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Session Table */}
            {currentItems.length === 0 ? (
              <p className="text-gray-500 text-center py-10 text-lg">
                No video sessions match your criteria for the current page.
              </p>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-white/[0.06]">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/90 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("userName")}
                      >
                        <div className="flex items-center gap-1">
                          User {getSortIcon("userName")}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/90 uppercase tracking-wider"
                      >
                        Video / Lesson
                      </th>
                      {/* <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('totalWatchTime')}
                      >
                        <div className="flex items-center gap-1">
                          Watch Time {getSortIcon('totalWatchTime')}
                        </div>
                      </th> */}
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/90 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("completionPercentage")}
                      >
                        <div className="flex items-center gap-1">
                          Progress {getSortIcon("completionPercentage")}
                        </div>
                      </th>
                      {/* <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('timestamp')}
                      >
                        <div className="flex items-center gap-1">
                          Last Activity {getSortIcon('timestamp')}
                        </div>
                      </th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-white/[0.03] divide-y divide-gray-200">
                    {currentItems.map((session: any) => (
                      <tr
                        key={session._id}
                        className={`hover:bg-blue-50 dark:hover:bg-white/[0.06] cursor-pointer transition-colors duration-150 ${
                          selectedSession?._id === session._id
                            ? "bg-blue-100 dark:bg-white/[0.09] border-l-4 border-blue-600"
                            : ""
                        }`}
                        onClick={() => handleRowClick(session)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <User className="h-8 w-8 text-gray-500 dark:text-white/90" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {session.userName}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-[100px] dark:text-white/70">
                                {session.userId?.substring(0, 12)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white/80 truncate max-w-[200px]">
                            {session.videoTitle}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-white/60">
                            {session.lessonTitle}
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatWatchTime(session.totalWatchTime || 0)}
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    session.completionPercentage || 0,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-white/90">
                              {session.completionPercentage?.toFixed(1) ?? 0}%
                            </span>
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          {session.isActive ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                              Inactive
                            </span>
                          )}
                        </td> */}
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.timestamp ? new Date(session.timestamp).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {sortedAndFilteredSessions.length > 0 && (
              <nav
                className="flex sm:flex-row items-center sm:items-center justify-between gap-4 border-t border-gray-200 bg-white dark:bg-white/[0.03] px-4 py-3 sm:px-6 mt-4 rounded-b-lg"
                aria-label="Pagination"
              >
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700 dark:text-white/90">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        indexOfLastItem,
                        sortedAndFilteredSessions.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {sortedAndFilteredSessions.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div className="flex-1 flex justify-between sm:justify-end items-center gap-x-2">
                  <div className="flex gap-x-2 items-center">
                    <label
                      htmlFor="itemsPerPage"
                      className="text-sm text-gray-700 dark:text-white/90  sr-only md:not-sr-only"
                    >
                      Items per page:
                    </label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Reset to first page when items per page changes
                      }}
                      className="px-2 py-1 border dark:text-white/90 border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option className="dark:text-black" value={5}>
                        5
                      </option>
                      <option className="dark:text-black" value={10}>
                        10
                      </option>
                      <option className="dark:text-black" value={20}>
                        20
                      </option>
                      <option className="dark:text-black" value={50}>
                        50
                      </option>
                    </select>
                  </div>
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />{" "}
                    Previous
                  </button>
                  <div className="hidden sm:flex space-x-1">
                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        aria-current={
                          currentPage === number ? "page" : undefined
                        }
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md ${
                          currentPage === number
                            ? "z-10 bg-blue-600 text-white dark:text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            : "text-gray-900 dark:text-white/90 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    {totalPages > pageNumbers[pageNumbers.length - 1] && (
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold dark:text-white/90 text-gray-700 ring-1 ring-inset ring-gray-300">
                        ...
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </nav>
            )}
          </div>

          {/* Right Column: Session Details Sidebar */}
          <div className="flex-1 lg:flex-[0_0_30%] lg:max-w-[30%] bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-lg border border-gray-200 lg:sticky lg:top-4 lg:self-start max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white/90 border-b border-gray-200 pb-3 flex items-center gap-2">
              <Info className="text-teal-600" size={24} /> Session Details
            </h2>

            {selectedSession ? (
              <div>
                <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 dark:text-white/80 mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <User
                      size={16}
                      className="text-gray-600 dark:text-white/80"
                    />
                    <strong>User:</strong> {selectedSession.userName} (
                    {selectedSession.userId?.substring(0, 8)}...)
                  </div>
                  <div className="flex items-center gap-2">
                    <Film
                      size={16}
                      className="text-gray-600 dark:text-white/80 "
                    />
                    <strong>Video:</strong> {selectedSession.videoTitle}
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart2
                      size={16}
                      className="text-gray-600 dark:text-white/80"
                    />
                    <strong>Lesson:</strong> {selectedSession.lessonTitle}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock
                      size={16}
                      className="text-gray-600 dark:text-white/80  "
                    />
                    <strong>Session Start:</strong>{" "}
                    {selectedSession.timestamp
                      ? new Date(selectedSession.timestamp).toLocaleString()
                      : "N/A"}
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <Globe size={16} className="text-gray-600" />
                    <strong>IP Address:</strong> {selectedSession.ipAddress || 'N/A'}
                  </div> */}
                  {/* <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-600" />
                    <strong>Max Watched Time:</strong> {formatWatchTime(selectedSession.maxWatchedTime || 0)}
                  </div> */}
                  <div className="flex items-center gap-2">
                    <Play size={16} className="text-gray-600 dark:text-white/80" />
                    <strong>Playback Speed:</strong>{" "}
                    {selectedSession.playbackSpeed || "1x"}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSession.isActive ? (
                      <Activity size={16} className="text-green-500" />
                    ) : (
                      <EyeOff size={16} className="text-gray-500 dark:text-white/80 " />
                    )}
                    <strong>Status:</strong>{" "}
                    {selectedSession.isActive ? "Active" : "Inactive"}
                  </div>
                  {selectedSession.completed && (
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-blue-500" />
                      <strong>Completed:</strong> Yes
                    </div>
                  )}
                  {/* Add more session-specific details here as needed */}
                </div>
                <InteractionDetails
                  interactions={selectedSession.interactions || []}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-20">
                <Info size={40} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg">
                  Select a session from the list to view its detailed analytics.
                </p>
              </div>
            )}
          </div>
        </section>

        {!sessions.length && !loading && !error && (
          <div className="text-center text-gray-500 py-16 text-xl">
            <Video size={50} className="mx-auto mb-4 text-gray-400" />
            <p>No video session data available yet.</p>
            <p className="text-sm mt-2">
              Start tracking video interactions to see analytics here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Session;
