import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchEventById,
  updateEvent,
  deleteEvent,
} from "../../store/slices/event";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import QuillEditor from "../../components/QuillEditor";
import PopupAlert from "../../components/popUpAlert";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Venue {
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates?: Coordinates;
}

interface OnlineLink {
  platform: "zoom" | "meet" | "teams" | "other";
  url: string;
  meetingId?: string;
  password?: string;
}

interface Attachment {
  name: string;
  url: string;
  type: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  type: "online" | "offline" | "hybrid";
  category: string;
  startDate: string;
  endDate: string;
  venue?: Venue;
  onlineLink?: OnlineLink;
  capacity: number;
  price: number | { $numberDecimal: string };
  currency: string;
  tags: string[];
  status: "draft" | "published" | "cancelled" | "completed";
  thumbnail?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

interface EventFormData {
  title: string;
  description: string;
  type: "online" | "offline" | "hybrid";
  category: string;
  startDate: string;
  endDate: string;
  venue?: Venue;
  onlineLink?: OnlineLink;
  capacity: number;
  price: number | { $numberDecimal: string };
  currency: string;
  tags: string;
  status: "draft" | "published" | "cancelled" | "completed";
  thumbnail?: string;
  attachments?: Attachment[];
}

// Custom Popup Component for success/error messages
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
    <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          {popup.type === "success" ? (
            <svg
              className="w-6 h-6 text-green-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-red-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <h3
            className={`text-lg font-semibold ${
              popup.type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {popup.title}
          </h3>
        </div>
        <p className="text-gray-600 mb-6">{popup.message}</p>
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

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, data } = useAppSelector((state) => state.event);
  const [formData, setFormData] = useState<EventFormData | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // Use only one popup state for all popups

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  const [files, setFiles] = useState({
    thumbnail: null as File | null,
    attachments: [] as File[],
  });

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

  useEffect(() => {
    if (data && data?.data) {
      const event = data?.data as Event;
      // Convert price from MongoDB decimal or number to a regular number
      const initialPrice =
        typeof event.price === "object" && "$numberDecimal" in event.price
          ? parseFloat(event.price.$numberDecimal)
          : typeof event.price === "number"
          ? event.price
          : 0;

      setFormData({
        title: event.title || "",
        description: event.description || "",
        type: event.type || "online",
        category: event.category || "",
        startDate: event.startDate
          ? new Date(event.startDate).toISOString().split("T")[0]
          : "",
        endDate: event.endDate
          ? new Date(event.endDate).toISOString().split("T")[0]
          : "",
        venue: event.venue || {
          name: "",
          address: "",
          city: "",
          country: "",
          coordinates: { latitude: 0, longitude: 0 },
        },
        onlineLink: event.onlineLink || {
          platform: "zoom",
          url: "",
          meetingId: "",
          password: "",
        },
        capacity: event.capacity || 0,
        price: initialPrice,
        currency: event.currency || "INR",
        tags: Array.isArray(event.tags) ? event.tags.join(", ") : "",
        status: event.status || "draft",
        thumbnail: typeof event.thumbnail === "string" ? event.thumbnail : "",
        attachments: [],
      });
    }
  }, [data]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      if (!prev) return null;

      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        const parentObj = prev[parent as keyof EventFormData];

        if (typeof parentObj === "object" && parentObj !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value,
            },
          };
        }
      }

      // Handle number inputs separately
      if (type === "number") {
        const numValue = value === "" ? 0 : parseFloat(value);
        return {
          ...prev,
          [name]: numValue,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === "thumbnail" && files?.[0]) {
      setFiles((prev) => ({
        ...prev,
        thumbnail: files[0],
      }));
    } else if (name === "attachments" && files) {
      setFiles((prev) => ({
        ...prev,
        attachments: [...Array.from(files)],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData) return;

    try {
      const formDataToSend = new FormData();

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tags") {
          const tagsArray = (value as string)
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean);
          tagsArray.forEach((tag: string) =>
            formDataToSend.append("tags[]", tag)
          );
        } else if (key === "venue" || key === "onlineLink") {
          if (value && Object.keys(value).length > 0) {
            formDataToSend.append(key, JSON.stringify(value));
          }
        } else if (key === "thumbnail") {
          // Skip thumbnail if it's empty or not changed
          if (
            value &&
            typeof value === "string" &&
            !value.startsWith("data:")
          ) {
            formDataToSend.append(key, value);
          }
        } else if (value !== null && value !== undefined && value !== "") {
          formDataToSend.append(key, value.toString());
        }
      });

      // Add files
      if (files.thumbnail) {
        formDataToSend.append("thumbnail", files.thumbnail);
      }

      files.attachments.forEach((file, index) => {
        formDataToSend.append(`attachments[${index}]`, file);
      });

      // Send FormData directly to the API
      await dispatch(
        updateEvent({ eventId: id, eventData: formDataToSend })
      ).unwrap();

      setPopup({
        show: true,
        type: "success",
        title: "Success!",
        message: "Event updated successfully!",
      });

      setTimeout(() => {
        navigate("/events");
      }, 2000);
    } catch (error: unknown) {
      setPopup({
        show: true,
        type: "error",
        title: "Error!",
        message: error.message || "Failed to update event",
      });
    }
  };

  const handleDelete = async () => {
    if (id) {
      try {
        await dispatch(deleteEvent(id)).unwrap();
        setIsDeleteModalOpen(false);
        setPopup({
          show: true,
          title: "Success!",
          message: "Event deleted successfully!",
          type: "success",
        });
        // Show popup, redirect only after user closes it
      } catch (error) {
        setIsDeleteModalOpen(false);
        setPopup({
          show: true,
          title: "Error!",
          message: "Failed to delete event",
          type: "error",
        });
        console.error("Failed to delete event:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!formData) {
    return <div>Event not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Edit Event
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 mb-4 rounded">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Description *
              </label>
              <QuillEditor
                value={formData.description}
                onChange={(value: string) =>
                  setFormData((prev) =>
                    prev ? { ...prev, description: value } : null
                  )
                }
                placeholder="Enter event description..."
                height="200px"
                toolbar="full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Start Date *
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                End Date *
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Event Type and Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Event Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {(formData.type === "offline" || formData.type === "hybrid") && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Venue Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    name="venue.name"
                    value={formData.venue?.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="venue.address"
                    value={formData.venue?.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="venue.city"
                    value={formData.venue?.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="venue.country"
                    value={formData.venue?.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    name="venue.coordinates.latitude"
                    value={formData.venue?.coordinates?.latitude}
                    onChange={handleInputChange}
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    name="venue.coordinates.longitude"
                    value={formData.venue?.coordinates?.longitude}
                    onChange={handleInputChange}
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {(formData.type === "online" || formData.type === "hybrid") && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Online Meeting Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Platform *
                  </label>
                  <select
                    name="onlineLink.platform"
                    value={formData.onlineLink?.platform}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="zoom">Zoom</option>
                    <option value="meet">Google Meet</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Meeting URL *
                  </label>
                  <input
                    type="url"
                    name="onlineLink.url"
                    value={formData.onlineLink?.url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Meeting ID
                  </label>
                  <input
                    type="text"
                    name="onlineLink.meetingId"
                    value={formData.onlineLink?.meetingId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    name="onlineLink.password"
                    value={formData.onlineLink?.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Currency *
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter comma-separated tags (e.g. event, workshop, webinar)"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Separate multiple tags with commas
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Status and Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  name="thumbnail"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:text-sm file:font-medium file:border-gray-300 file:text-gray-700 dark:file:text-gray-200 dark:file:border-gray-600 dark:file:bg-gray-700 hover:file:bg-gray-100 dark:hover:file:bg-gray-600"
                />
                {(files.thumbnail || formData.thumbnail) && (
                  <div className="mt-2">
                    <img
                      src={
                        files.thumbnail
                          ? URL.createObjectURL(files.thumbnail)
                          : `${import.meta.env.VITE_BASE_URL}/${
                              formData.thumbnail
                            }`
                      }
                      alt="Thumbnail preview"
                      className="w-32 h-20 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Attachments</label>
            <input
              type="file"
              name="attachments"
              onChange={handleFileChange}
              multiple
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{attachment.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div> */}

          <div className="flex justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Event
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[999] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/10 bg-opacity-30 backdrop-blur-xs transition-opacity"></div>

            {/* Modal */}
            <div className="relative z-50 mx-auto w-full max-w-sm rounded-lg  bg-white dark:bg-gray-800/10 p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-center text-gray-900 dark:text-white">
                Delete Event
              </h3>
              <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this event? This action cannot
                be undone.
              </p>

              <div className="mt-4 flex justify-center space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Popup */}
      {/* <CustomPopup popup={popup} onClose={() => setPopup(prev => ({ ...prev, show: false }))} /> */}

      <PopupAlert
        isVisible={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={() => {
          setPopup({ show: false, title: "", message: "", type: "success" });
          if (
            popup.type === "success" &&
            popup.message === "Event deleted successfully!"
          ) {
            navigate("/events");
          }
        }}
      />
    </div>
  );
};

export default EditEvent;
