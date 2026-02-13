import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { postLeaderboardSettings, getLeaderboardSettings } from "../store/slices/leaderboard";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

const defaultActions = {
  course_complete: 100,
  quiz_pass: 50,
  forum_post: 10,
  like_post: 10,
  daily_login: 10,
};

const defaultRanks = [
  { minXP: 0, maxXP: 99, levelName: "Beginner" },
  { minXP: 100, maxXP: 499, levelName: "Intermediate" },
  { minXP: 500, maxXP: 9999, levelName: "Expert" },
];

const actionIcons = {
  course_complete: "🎓",
  quiz_pass: "✅",
  quiz_fail_retry: "🔄",
  forum_post: "💬",
  discussion_reply: "💡",
  assignment_submit: "📄",
  peer_review: "👥",
  daily_login: "📅",
  video_watch: "🎥",
  streak_bonus: "🔥",
  like_post: "❤️",
};

const actionLabels = {
  course_complete: "Course Complete",
  quiz_pass: "Quiz Pass",
  quiz_fail_retry: "Quiz Fail Retry",
  forum_post: "Forum Post",
  discussion_reply: "Discussion Reply",
  assignment_submit: "Assignment Submit",
  peer_review: "Peer Review",
  daily_login: "Daily Login",
  video_watch: "Video Watch",
  streak_bonus: "Streak Bonus",
  like_post: "Like Post",
};

export default function LeaderboardSetting() {
  const dispatch = useAppDispatch();
  const { loading, error, settings } = useAppSelector((state) => state.leaderboard);

  // Bind initial state from API response if available, otherwise fallback to empty/defaults
  const [actionXP, setActionXP] = useState({});
  const [levelRanks, setLevelRanks] = useState([]);
  const [success, setSuccess] = useState("");

  // Fetch settings on mount
  useEffect(() => {
    dispatch(getLeaderboardSettings());
  }, [dispatch]);

  useEffect(() => {
    // Accept settings from API response, including extra keys
    if (settings?.actionXP) setActionXP(settings.actionXP);
    if (settings?.levelRanks) setLevelRanks(settings.levelRanks);
    // If API returns keys not present in defaults, add them
    if (settings?.actionXP) {
      setActionXP((prev) => {
        const merged = { ...settings.actionXP };
        // Add any missing keys from previous/defaults
        Object.keys(prev).forEach((k) => {
          if (!(k in merged)) merged[k] = prev[k];
        });
        return merged;
      });
    }
  }, [settings]);

  const handleActionChange = (key, value) => {
    setActionXP({ ...actionXP, [key]: Number(value) });
  };

  const handleRankChange = (idx, field, value) => {
    const updated = [...levelRanks];
    updated[idx][field] = field === "levelName" ? value : Number(value);
    setLevelRanks(updated);
  };

  const handleAddRank = () => {
    setLevelRanks([...levelRanks, { minXP: 0, maxXP: 0, levelName: "" }]);
  };

  const handleRemoveRank = (idx) => {
    setLevelRanks(levelRanks.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(postLeaderboardSettings({ actionXP, levelRanks }));
    setSuccess("Leaderboard settings updated!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PageMeta title="Leaderboard Settings" description="Configure leaderboard XP and ranks" />
      <PageBreadcrumb pageTitle="Leaderboard Settings" />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Leaderboard Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage XP rewards and ranking levels for your platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* XP per Action Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                XP Per Action
              </h2>
              <p className="text-indigo-100 text-sm mt-1">Set experience points for user activities</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(actionXP).map((key) => (
                  <div 
                    key={key} 
                    className="group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">{actionIcons[key] || "🔹"}</span>
                        <label className="font-medium text-gray-700 dark:text-gray-200">
                          {actionLabels[key] || key}
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={actionXP[key]}
                          min={0}
                          onChange={(e) => handleActionChange(key, e.target.value)}
                          className="w-24 px-4 py-2 text-center text-lg font-bold bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 transition-all outline-none"
                        />
                        <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          XP
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Level Ranks Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                Level Ranks
              </h2>
              <p className="text-purple-100 text-sm mt-1">Define XP thresholds and rank names</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {levelRanks.map((rank, idx) => (
                  <div 
                    key={idx} 
                    className="group relative bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-gray-700 dark:via-gray-750 dark:to-gray-700 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">MIN</span>
                        <input
                          type="number"
                          value={rank.minXP}
                          min={0}
                          onChange={(e) => handleRankChange(idx, "minXP", e.target.value)}
                          className="w-20 px-2 py-1 text-center font-bold border border-gray-300 dark:border-gray-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500 bg-white dark:bg-gray-900 outline-none"
                          placeholder="0"
                        />
                      </div>
                      
                      <span className="text-gray-400 font-bold">→</span>
                      
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">MAX</span>
                        <input
                          type="number"
                          value={rank.maxXP}
                          min={0}
                          onChange={(e) => handleRankChange(idx, "maxXP", e.target.value)}
                          className="w-20 px-2 py-1 text-center font-bold border border-gray-300 dark:border-gray-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500 bg-white dark:bg-gray-900 outline-none"
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="text"
                          value={rank.levelName}
                          onChange={(e) => handleRankChange(idx, "levelName", e.target.value)}
                          className="w-full px-4 py-2 font-semibold border-2 border-purple-200 dark:border-purple-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500 bg-white dark:bg-gray-900 outline-none"
                          placeholder="Level Name"
                        />
                      </div>
                      
                      <button 
                        type="button" 
                        onClick={() => handleRemoveRank(idx)} 
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors shadow-sm hover:shadow"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                type="button" 
                onClick={handleAddRank} 
                className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
              >
                + Add New Rank
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg animate-pulse">
              <p className="text-green-700 dark:text-green-400 font-medium flex items-center gap-2">
                <span>✓</span> {success}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </span>
              ) : (
                "💾 Save Settings"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}