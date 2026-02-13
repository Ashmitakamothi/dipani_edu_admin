import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { createBanner } from "../../store/slices/banner";
import { fetchCourses } from "../../store/slices/course";
import { fetchEvents } from "../../store/slices/event";
import { fetchJobs } from "../../store/slices/job";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import axiosInstance from "../../services/axiosConfig";

const typeOptions = [
  { value: "course", label: "Course" },
  { value: "event", label: "Event" },
  { value: "job", label: "Job" },
  { value: "announcement", label: "Announcement" },
  { value: "all_courses", label: "All Courses" },
  { value: "all_events", label: "All Events" },
  { value: "all_jobs", label: "All Jobs" },
];

const AddBanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [type, setType] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const courseList = useAppSelector(
    (state) => state.course.data?.courses || []
  );
  const eventList = useAppSelector(
    (state) => state.event.data?.data?.data || []
  );
  const jobList = useAppSelector((state) => state.job.jobs || []);
  const bannerLoading = useAppSelector((state) => state.banner.loading);
  const bannerError = useAppSelector((state) => state.banner.error);
  const banners = useAppSelector((state) => state.banner.banners);
  const [loadingRef, setLoadingRef] = useState(false);
  const [lastBannerId, setLastBannerId] = useState<string | null>(null);
  const prevLoading = React.useRef(bannerLoading);

  useEffect(() => {
    if (prevLoading.current && !bannerLoading && !bannerError) {
      const latestBanner = banners && banners.length > 0 ? banners[0] : null;
      if (latestBanner && latestBanner._id !== lastBannerId) {
        toast.success("Banner added successfully!");
        setLastBannerId(latestBanner._id);
        setTimeout(() => setShowSuccess(false), 1000);
      }
    }
    prevLoading.current = bannerLoading;
  }, [bannerLoading, bannerError, banners, lastBannerId]);

  useEffect(() => {
    if (type === "course") {
      if (!courseList.length) {
        setLoadingRef(true);
        dispatch(fetchCourses({ page: 1, limit: 100 })).finally(() =>
          setLoadingRef(false)
        );
      }
    } else if (type === "event") {
      if (!eventList.length) {
        setLoadingRef(true);
        dispatch(fetchEvents({ page: 1, limit: 100 })).finally(() =>
          setLoadingRef(false)
        );
      }
    } else if (type === "job") {
      if (!jobList.length) {
        setLoadingRef(true);
        dispatch(fetchJobs({ page: 1, limit: 100 })).finally(() =>
          setLoadingRef(false)
        );
      }
    } else {
      setReferenceId("");
    }
  }, [type, courseList.length, eventList.length, jobList.length, dispatch]);

  let refOptions: { _id: string; title: string }[] = [];
  if (type === "course") {
    refOptions = courseList.map((c: { _id: string; title: string }) => ({
      _id: c._id,
      title: c.title,
    }));
  } else if (type === "event") {
    refOptions = eventList.map((e: { _id: string; title: string }) => ({
      _id: e._id,
      title: e.title,
    }));
  } else if (type === "job") {
    refOptions = jobList.map((j: { _id: string; title: string }) => ({
      _id: j._id,
      title: j.title,
    }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) formData.append("image", image);
    if (mobileImage) formData.append("mobileImage", mobileImage);
    formData.append("type", type);
    if (referenceId) formData.append("referenceId", referenceId);
    formData.append("priority", String(priority));
    formData.append("isActive", String(isActive));
    if (startDate) formData.append("startDate", startDate);
    if (endDate) formData.append("endDate", endDate);
    dispatch(createBanner(formData));
    // Do not show popup or reset fields here
  };

  return (
    <div>
      <PageMeta title="Add Banner | LMS Admin" description="Add a new banner" />
      <PageBreadcrumb pageTitle="Add Banner" />
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50">
          Banner added successfully!
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white p-6 rounded shadow"
      >
        <div className="mb-4">
          <label className="block mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Mobile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setMobileImage(e.target.files ? e.target.files[0] : null)
            }
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select Type</option>
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {type && ["course", "event", "job"].includes(type) && (
          <div className="mb-4">
            <label className="block mb-1">Reference</label>
            {loadingRef ? (
              <div>Loading...</div>
            ) : (
              <select
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">
                  Select {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
                {refOptions.map((opt) => (
                  <option key={opt._id} value={opt._id}>
                    {opt.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-1">Priority</label>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="mr-2"
          />
          <label>Active</label>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Add Banner
        </button>
      </form>
    </div>
  );
};

export default AddBanner;
