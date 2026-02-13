import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCouponById, updateCoupon, clearData } from "../../store/slices/couponsSlice";
import { fetchCourses } from "../../store/slices/course";
import { CheckCircle, XCircle, BookOpen } from "lucide-react";

const EditCoupon: React.FC = () => {
  console.log("EditCoupon component rendered");
  const { couponId } = useParams<{ couponId: string }>();
  const id = couponId; // Use couponId from route params
  console.log("Coupon ID from params:", id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { singleCoupon, loading, error: couponError } = useAppSelector((state) => state.coupons);
  console.log("Redux state - loading:", loading, "singleCoupon:", singleCoupon, "error:", couponError);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "flat" as "flat" | "percent",
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

  const [popup, setPopup] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({ show: false, type: "success", title: "", message: "" });

  // Fetch coupon details on mount and when id changes
  useEffect(() => {
    let isMounted = true;
    
    if (id) {
      console.log("Fetching coupon with ID:", id);
      // Clear previous coupon data first
      dispatch(clearData());
      setFormData({
        code: "",
        description: "",
        discountType: "flat",
        discountAmount: 0,
        discountPercent: 0,
        minOrderAmount: 0,
        usageLimit: 0,
        usageLimitPerUser: 0,
        isActive: true,
        startDate: "",
        endDate: "",
        courseId: "",
      });
      
      dispatch(fetchCouponById(id))
        .unwrap()
        .then((result) => {
          if (isMounted) {
            console.log("Coupon fetch result:", result);
            console.log("Coupon data:", result?.data?.coupon || result);
          }
        })
        .catch((error) => {
          if (isMounted) {
            console.error("Coupon fetch error:", error);
          }
        });
    }
    
    return () => {
      isMounted = false;
    };
  }, [id, dispatch]);

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

  // Populate form when coupon is loaded
  useEffect(() => {
    if (singleCoupon && singleCoupon._id) {
      console.log("Single coupon data:", singleCoupon);
      console.log("Coupon code:", singleCoupon.code);
      console.log("Coupon description:", singleCoupon.description);
      
      // Helper function to get number value (handles Decimal128, string, number)
      const getNumber = (val: any): number => {
        if (!val && val !== 0) return 0;
        if (typeof val === "number") return val;
        if (typeof val === "string") return parseFloat(val) || 0;
        if (typeof val === "object" && val.$numberDecimal) return parseFloat(val.$numberDecimal);
        if (typeof val === "object" && Object.values(val).length > 0) {
          return parseFloat(Object.values(val)[0] as string) || 0;
        }
        return 0;
      };
      
      // Get first course from applicableCourses array if exists
      let courseId = "";
      if ((singleCoupon as any).applicableCourses && 
          Array.isArray((singleCoupon as any).applicableCourses) && 
          (singleCoupon as any).applicableCourses.length > 0) {
        const firstCourse = (singleCoupon as any).applicableCourses[0];
        // Handle both string and ObjectId formats
        courseId = typeof firstCourse === 'string' ? firstCourse : (firstCourse._id || firstCourse.toString());
      }
      
      // Format dates
      const formatDate = (date: any): string => {
        if (!date) return "";
        if (typeof date === 'string') {
          return date.split("T")[0];
        }
        try {
          return new Date(date).toISOString().split("T")[0];
        } catch (e) {
          return "";
        }
      };
      
      const newFormData = {
        code: singleCoupon.code || "",
        description: singleCoupon.description || "",
        discountType: singleCoupon.discountType === "percentage" ? "percent" : "flat",
        discountAmount: getNumber(singleCoupon.discountAmount),
        discountPercent: getNumber(singleCoupon.discountPercent),
        minOrderAmount: getNumber(singleCoupon.minOrderAmount),
        usageLimit: getNumber(singleCoupon.usageLimit),
        usageLimitPerUser: getNumber(singleCoupon.usageLimitPerUser),
        isActive: singleCoupon.isActive !== undefined ? singleCoupon.isActive : true,
        startDate: formatDate(singleCoupon.startDate),
        endDate: formatDate(singleCoupon.endDate),
        courseId: courseId,
      };
      
      console.log("Setting form data:", newFormData);
      setFormData(newFormData);
    } else {
      console.log("No coupon data available. singleCoupon:", singleCoupon);
    }
  }, [singleCoupon]);

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
    if (!id) return;

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
      await dispatch(updateCoupon({ id, couponData: payload })).unwrap();
      setPopup({
        show: true,
        type: "success",
        title: "Updated!",
        message: `Coupon "${formData.code}" updated successfully!`,
      });

      setTimeout(() => navigate("/coupons"), 1500);
    } catch (error: any) {
      setPopup({
        show: true,
        type: "error",
        title: "Error!",
        message: error || "Failed to update coupon",
      });
    }
  };

  // Debug: Log current form data
  useEffect(() => {
    console.log("Current formData:", formData);
    console.log("Loading state:", loading);
    console.log("Single coupon:", singleCoupon);
    console.log("Coupon error:", couponError);
  }, [formData, loading, singleCoupon, couponError]);

  // Show loading state only if actively loading and no data
  if (loading && !singleCoupon) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-300">Loading coupon...</p>
        </div>
      </div>
    );
  }

  // Show error state only if there's an error and no data
  if (couponError && !singleCoupon && !loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 dark:text-red-400 mb-4">{couponError}</p>
          <button
            onClick={() => navigate("/coupons/all")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Coupons
          </button>
        </div>
      </div>
    );
  }

  // Always render the form, even if data is still loading
  return (
    <div className="mx-auto p-6 bg-white dark:bg-white/[0.03] shadow-lg rounded-lg max-w-4xl">
      {loading && !singleCoupon && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-blue-600 dark:text-blue-400">Loading coupon data...</p>
        </div>
      )}
      {couponError && !singleCoupon && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">Error: {couponError}</p>
          <button
            onClick={() => navigate("/coupons/all")}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Coupons
          </button>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white/90">
        Edit Coupon {id ? `(${id})` : ''}
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
              <option value="percent">Percentage (%)</option>
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

        {/* Is Active */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-white/90">
            Active
          </label>
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
            {loading ? "Updating..." : "Update Coupon"}
          </button>
        </div>
      </form>

      {/* Popup */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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

export default EditCoupon;
