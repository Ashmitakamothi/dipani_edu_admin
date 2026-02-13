import React, { useState, useEffect } from "react";
import {
  Award,
  User,
  Clock,
  Target,
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  LayoutTemplate,
} from "lucide-react";
import { useLocation } from "react-router";
import { useDispatch } from "react-redux";
import { fetchCertificates } from "../../store/slices/certificate";
import axiosInstance from "../../services/axiosConfig";
import { issueCertificate } from "../../store/slices/IssuesCertification";
import course from "../../store/slices/course";

// Custom Popup Component
const CustomPopup = ({
  popup,
  onClose,
}: {
  popup: {
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  };
  onClose: () => void;
}) => {
  if (!popup.show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-9999">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          {popup.type === "success" ? (
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 mr-3" />
          )}
          <h3
            className={`text-lg font-semibold ${
              popup.type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {popup.title}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{popup.message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md font-medium ${
              popup.type === "success"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white transition duration-200`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const IssueCertificateForm = () => {
  // Popup state
  const [popup, setPopup] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // Loading state
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  let { search } = useLocation();
  const query = new URLSearchParams(search);

  const dispatch = useDispatch();

  const userId = query.get("user"); // Example user ID, replace with actual logic

  // Form state
  const [formData, setFormData] = useState({
    user_id: userId || "",
    certification_template: "",
    type: "course",
    status: "issued",
    serial_number: "",
    course_id: "",
    remarks: "",
    date: "",
  });

  // Generate serial number automatically
  useEffect(() => {
    const generateSerialNumber = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `CERT-${year}${month}${day}-${random}`;
    };

    setFormData((prev) => ({
      ...prev,
      serial_number: generateSerialNumber(),
      completion_date: new Date().toISOString().split("T")[0],
    }));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // setPopup({
    //   show: true,
    //   type: "error",
    //   title: "Validation Error",
    //   message: `Please fill in all required fields: ${missingFields.join(
    //     ", "
    //   )}`,
    // });

    console.log("Form Data:", formData);
    setLoading(true);

    try {
      // Simulate API call
      const payload = new FormData();

      payload.append("user_id", formData.user_id);
      payload.append("certification_template", formData.certification_template);
      payload.append("type", formData.type);
      payload.append("status", formData.status);
      payload.append("serial_number", formData.serial_number);
      payload.append("course_id", formData.course_id);
      payload.append("remarks", formData.remarks);
      payload.append("date", formData.date);
      payload.append("completion_date", formData.completion_date);
      payload.append("instructor_id", selectedCourse.instructor_id);

      const res = await dispatch(issueCertificate(payload));
      console.log("Response:", res);
      // Show success popup

      if (res.error) {
        setPopup({
          show: true,
          type: "error",
          title: "Error!",
          message: res.payload,
        });

        return;
      }
      setPopup({
        show: true,
        type: "success",
        title: "Certificate Issued!",
        message: `Certificate ${formData.serial_number} has been successfully issued.`,
      });

      // Reset form
      setFormData({
        user_id: userId || "",
        certification_template: "",
        type: "course",
        status: "issued",
        serial_number: "",
        course_id: "",
        remarks: "",
        date: "",
      });

      // Generate new serial number
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");

      setFormData((prev) => ({
        ...prev,
        serial_number: `CERT-${year}${month}${day}-${random}`,
        completion_date: new Date().toISOString().split("T")[0],
      }));
    } catch (error) {
      console.error("Error issuing certificate:", error);

      setPopup({
        show: true,
        type: "error",
        title: "Error!",
        message: "Failed to issue certificate. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getData = async () => {
    try {
      const response = await dispatch(
        fetchCertificates({
          limit: 100,
        })
      );

      setTemplates(response.payload.templates);

      const res = await axiosInstance.get(
        `/checkout/my-enrollments?userid=${userId}`
      );

      const data = res.data.data.filter(
        (item) => item.type === "course" || item.type === "groupCourse"
      );
      console.log("Fetched Courses:", data);
      setAllCourses(res.data.data);
      setFilteredCourses(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      //   setPopup({
      //     show: true,
      //     type: "error",
      //     title: "Error!",
      //     message: "Failed to fetch data. Please try again.",
      //   });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const filterCourses = () => {
      if (formData.type === "course" || formData.type === "groupCourse") {
        setFilteredCourses(
          allCourses.filter(
            (course) =>
              course.type === "course" || course.type === "groupCourse"
          )
        );
      } else if (formData.type === "bundle") {
        setFilteredCourses(
          allCourses.filter((course) => course.type === "courseBundle")
        );
      } else {
        setFilteredCourses(allCourses);
      }
    };
    filterCourses();
  }, [formData.type, formData]);

  return (
    <div className="mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-4xl">
      <div className="flex items-center mb-6">
        <Award className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Issue Certificate
        </h2>
      </div>

      <div className="space-y-6">
        {/* Certificate Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Certificate Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Serial Number *
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CERT-20250707-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="course">Course</option>
                {/* <option value="quiz">Quiz</option> */}
                <option value="bundle">Bundle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="issued">Issued</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Completion Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            User Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User ID *
              </label>
              <input
                type="text"
                name="user_id"
                value={formData.user_id}
                // onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="686ba78b85181158a7c64ba7"
              />
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Submission ID *
                </label>
                <select
                  name="course_id"
                  value={formData.course_id || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Course Submission ID</option>
                  {filteredCourses?.length > 0 &&
                    filteredCourses.map((template) => (
                      <option
                        key={template?.course?._id || template?.bundle?._id}
                        value={template?.course?._id || template?.bundle?._id}
                        onClick={() =>
                          setSelectedCourse(
                            template?.course || template?.bundle
                          )
                        }
                      >
                        {template?.course?.title || template?.bundle?.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructor ID *
              </label>
              <input
                type="text"
                name="instructor_id"
                value={formData.instructor_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="68376865e572d08d7905882d"
              />
            </div> */}
          </div>
        </div>

        {/* Performance Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <LayoutTemplate className="w-5 h-5 mr-2" />
            Template
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Certification Template
              </label>
              <select
                name="certification_template"
                value={formData.certification_template || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Certification Template</option>
                {templates?.length > 0 &&
                  templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Remarks
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Excellent Performance"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-3 rounded-md font-medium flex items-center space-x-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition duration-200`}
          >
            <Award className="w-5 h-5" />
            <span>
              {loading ? "Issuing Certificate..." : "Issue Certificate"}
            </span>
          </button>
        </div>

        {/* Custom Popup */}
        <CustomPopup
          popup={popup}
          onClose={() => setPopup((prev) => ({ ...prev, show: false }))}
        />
      </div>
    </div>
  );
};

export default IssueCertificateForm;
