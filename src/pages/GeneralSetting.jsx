import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosConfig";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { Link2, Save, Globe, Info } from "lucide-react";

export default function GeneralSetting() {
    const [googleFormLink, setGoogleFormLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axiosInstance.get("/settings");
                if (response.data && response.data.settings) {
                    setGoogleFormLink(response.data.settings.googleFormLink || "");
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await axiosInstance.post("/settings/update", {
                key: "googleFormLink",
                value: googleFormLink,
                description: "Link to the Google Form for student feedback/help"
            });
            setSuccess("Settings updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Failed to update settings. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <PageMeta title="General Settings" description="Configure general site settings" />
            <PageBreadcrumb pageTitle="General Settings" />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">General Configuration</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage global website links and configuration</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Globe className="w-5 h-5 text-brand-500" />
                                External Links
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Link2 className="w-4 h-4" />
                                    Google Form Link (Feedback/Help)
                                </label>
                                <input
                                    type="url"
                                    value={googleFormLink}
                                    onChange={(e) => setGoogleFormLink(e.target.value)}
                                    placeholder="https://forms.google.com/..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                                    required
                                />
                                <div className="mt-2 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                    <Info className="w-3.5 h-3.5 mt-0.5" />
                                    This link will appear in the website footer as "Feedback Form".
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 font-medium">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                            <span className="text-lg">✓</span> {success}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? "Saving..." : <><Save className="w-5 h-5" /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
