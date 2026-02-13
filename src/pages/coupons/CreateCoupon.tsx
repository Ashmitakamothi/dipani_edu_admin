import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks/redux";
import { createCoupon } from "../../store/slices/couponsSlice";
import { fetchCourses } from "../../store/slices/course";
import { CheckCircle, XCircle, BookOpen } from "lucide-react";

const CreateCoupon: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "flat" as "flat" | "percentage",
    discountAmount: 0,
    discountPercent: 0,
    minOrderAmount: 0,
    usageLimit: 0,
    usageLimitPerUser: 0,
    isActive: true,
    startDate: "",
    endDate: "",
    courseId: "", // Selected course ID
  });

  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({ show: false, type: "success", title: "", message: "" });

  // Fetch courses on component mount (non-blocking - don't fail if courses can't be loaded)
  useEffect(() => {
    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        // Use smaller limit to avoid parsing issues
        const result = await dispatch(fetchCourses({ page: 1, limit: 100 })).unwrap();
        if (result?.courses && Array.isArray(result.courses)) {
          setCourses(result.courses);
        }
      } catch (error: any) {
        console.error("Failed to fetch courses:", error);
        // Don't show error to user - course dropdown is optional
        // Just set empty array so dropdown still works
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };
    loadCourses();
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: any = { ...formData };
    if (formData.discountType === "flat") {
      payload.discountPercent = undefined;
    } else {
      payload.discountAmount = undefined;
    }

    // Convert courseId to applicableCourses array format
    if (formData.courseId) {
      payload.applicableCourses = [formData.courseId];
    } else {
      payload.applicableCourses = [];
    }
    delete payload.courseId; // Remove courseId from payload as backend expects applicableCourses

    try {
      await dispatch(createCoupon(payload)).unwrap();
      setPopup({
        show: true,
        type: "success",
        title: "Success!",
        message: `Coupon "${formData.code}" created successfully!`,
      });
      setLoading(false);

      setTimeout(() => navigate("/coupons/all"), 1500);
    } catch (error: any) {
      setPopup({
        show: true,
        type: "error",
        title: "Error!",
        message: error || "Failed to create coupon",
      });
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6 bg-white dark:bg-white/[0.03] shadow-lg rounded-lg max-w-6xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white/90">
        Create Coupon
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Coupon Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
            Coupon Code *
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white/90 rounded-md focus:ring-2 focus:ring-indigo-500"
            placeholder="SAVE20"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white/90 rounded-md focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief description of the coupon"
          />
        </div>

        {/* Discount Config */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Discount Type
            </label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white/90"
            >
              <option value="flat">Fixed Amount (₹)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>

          {formData.discountType === "flat" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
                Discount Amount (₹)
              </label>
              <input
                type="number"
                name="discountAmount"
                value={formData.discountAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white/90"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                name="discountPercent"
                value={formData.discountPercent}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white/90"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Min Order (₹)
            </label>
            <input
              type="number"
              name="minOrderAmount"
              value={formData.minOrderAmount}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white/90"
            />
          </div>
        </div>

        {/* Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Usage Limit
            </label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white/90"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Usage Limit per User
            </label>
            <input
              type="number"
              name="usageLimitPerUser"
              value={formData.usageLimitPerUser}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white/90"
            />
          </div>
        </div>

        {/* Course Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
            <BookOpen className="w-4 h-4 inline mr-1" />
            Apply to Course (Optional)
          </label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white/90 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Courses (Apply to any course)</option>
            {coursesLoading ? (
              <option disabled>Loading courses...</option>
            ) : (
              courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.courseId
              ? "This coupon will only be applicable to the selected course."
              : "Leave empty to make this coupon applicable to all courses."}
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white/90"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white/90"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/coupons")}
            className="px-6 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white/90 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {loading ? "Creating..." : "Create Coupon"}
          </button>
        </div>
      </form>

      {/* Popup */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-lg">
            <div className="flex items-center mb-4">
              {popup.type === "success" ? (
                <CheckCircle className="text-green-600 mr-2" />
              ) : (
                <XCircle className="text-red-600 mr-2" />
              )}
              <h3
                className={`text-lg font-semibold ${
                  popup.type === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                {popup.title}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{popup.message}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setPopup({ ...popup, show: false })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCoupon;
