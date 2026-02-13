import React from "react";
import { Book, FileText, Upload, Save } from "lucide-react";

// Importing icons from lucide-react (assuming you have the icons as SVGs or components)

const inputClass =
    "border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition";

const labelClass = "block text-sm font-medium mb-1 flex items-center gap-2";

const buttonClass =
    "flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition";

const ScromForm: React.FC = () => {
    return (
        <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Book size={28} /> Add SCORM Course
            </h2>
            <form className="space-y-5">
                <div>
                    <label className={labelClass}>
                        <FileText size={18} />
                        Course Title
                    </label>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Enter course title"
                    />
                </div>
                <div>
                    <label className={labelClass}>
                        <FileText size={18} />
                        Description
                    </label>
                    <textarea
                        className={inputClass}
                        placeholder="Enter course description"
                        rows={3}
                    />
                </div>
                <div>
                    <label className={labelClass}>
                        <Upload size={18} />
                        SCORM Package
                    </label>
                    <input type="file" className={inputClass} />
                </div>
                <button type="submit" className={buttonClass}>
                    <Save size={18} />
                    Save Course
                </button>
            </form>
        </div>
    );
};

export default ScromForm;