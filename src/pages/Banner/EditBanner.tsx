import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchBannerById, updateBanner } from "../../store/slices/banner";
import { fetchCourses } from "../../store/slices/course";
import { fetchEvents } from "../../store/slices/event";
import { fetchJobs } from "../../store/slices/job";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const typeOptions = [
  { value: "course", label: "Course" },
  { value: "event", label: "Event" },
  { value: "job", label: "Job" },
  { value: "announcement", label: "Announcement" },
  { value: "all_courses", label: "All Courses" },
  { value: "all_events", label: "All Events" },
  { value: "all_jobs", label: "All Jobs" },
];

const formatDateForInput = (dateStr: string | undefined) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const EditBanner: React.FC = () => {
  const navigate = useNavigate();
  const [updateRequested, setUpdateRequested] = useState(false);
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { banner, loading } = useAppSelector((state) => state.banner);
  console.log("Current banner data:", banner);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<string | File>("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [referenceId, setReferenceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const courseList = useAppSelector(
    (state) => state.course.data?.courses || []
  );
  const eventList = useAppSelector(
    (state) => state.event.data?.data?.data || []
  );
  const jobList = useAppSelector((state) => state.job.jobs || []);
  const [loadingRef, setLoadingRef] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const prevLoading = React.useRef(loading);

  const ImageBaseURL = import.meta.env.VITE_IMAGE_URL;

  useEffect(() => {
    if (id) dispatch(fetchBannerById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setImage(banner.image || "");
      setMobileImage(banner.mobileImage || null);
      setType(banner.type);
      setPriority(banner.priority);
      setIsActive(banner.isActive);
      setDescription(banner.description || "");
      setReferenceId(banner.referenceId || "");
      setStartDate(formatDateForInput(banner.startDate));
      setEndDate(formatDateForInput(banner.endDate));
    }
  }, [banner]);

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

  useEffect(() => {
    if (updateRequested && prevLoading.current && !loading) {
      toast.success("Banner changed successfully!");
      setUpdateRequested(false);
      setTimeout(() => {
        navigate("/banner");
      }, 1000);
    }
    prevLoading.current = loading;
  }, [loading, updateRequested, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (image && typeof image !== "string") formData.append("image", image);
      formData.append("type", type);
      if (mobileImage) formData.append("mobileImage", mobileImage);
      if (referenceId) formData.append("referenceId", referenceId);
      formData.append("priority", String(priority));
      formData.append("isActive", String(isActive));
      if (startDate) formData.append("startDate", startDate);
      if (endDate) formData.append("endDate", endDate);
      setUpdateRequested(true);
      dispatch(updateBanner({ id, bannerData: formData }));
    }
  };

  return (
    <div>
      <PageMeta
        title="Edit Banner | LMS Admin"
        description="Edit banner details"
      />
      <PageBreadcrumb pageTitle="Edit Banner" />
      {/* Toast notification will show instead of custom div */}
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
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : "")}
            className="w-full border px-3 py-2 rounded"
          />
          {typeof image === "string" && image && (
            <img
              src={`${ImageBaseURL}/${image}`}
              alt="Current"
              className="w-24 h-16 mt-2 object-cover rounded"
            />
          )}
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
          {mobileImage && (
            <img
              src={`${ImageBaseURL}/${mobileImage}`}
              alt="Current"
              className="w-24 h-16 mt-2 object-cover rounded"
            />
          )}
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
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditBanner;
