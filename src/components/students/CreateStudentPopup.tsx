import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { createStudent } from "../../store/slices/students";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface CreateStudentPopupProps {
  open: boolean;
  onClose: () => void;
}

const CreateStudentPopup: React.FC<CreateStudentPopupProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch<any>();
  const { loading, error } = useAppSelector((state: any) => state.students);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({ type: "", text: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage({ type: "", text: "" });
    try {
      const result = await dispatch(createStudent(form));
      // Handle undefined/null result or payload
      console.log("Create Student Result:", result);
      if (result?.meta?.requestStatus === "fulfilled") {
        setMessage({ type: "success", text: "Student created successfully!" });
        setForm({ fullName: "", email: "", password: "" });
        setSubmitted(false);
        window.location.reload(); // Reload to reflect changes
        setTimeout(() => {
          setMessage({ type: "", text: "" });
          onClose();
        }, 2000);

      } else {
        let errMsg = error || result?.payload || "Failed to create student.";
        setMessage({ type: "error", text: typeof errMsg === "string" ? errMsg : "Failed to create student." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to create student." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  useEffect(() => {
    if (!open) {
      setForm({ fullName: "", email: "", password: "" });
      setSubmitted(false);
      setMessage({ type: "", text: "" });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative transform transition-all duration-300 scale-100 hover:scale-[1.02]">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Form Header */}
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New Student</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} id="create-student-form" className="flex flex-col gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Full Name
            </label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              placeholder="Enter full name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              placeholder="Enter email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password
            </label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              placeholder="Enter password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              Create
            </button>
          </div>
        </form>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm transition-all duration-300 transform ${
            message.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          } animate-slide-in`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>
            {message.text || (message.type === "success"
              ? "Student created successfully!"
              : "Failed to create student.")}
          </span>
        </div>
      )}
    </div>
  );
};

export default CreateStudentPopup;