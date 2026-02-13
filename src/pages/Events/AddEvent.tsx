import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createEvent } from "../../store/slices/event";
import { AppDispatch, RootState } from "../../store";
import QuillEditor from "../../components/QuillEditor";
import PopupAlert from "../../components/popUpAlert";

// Interface matching the MongoDB schema
interface EventFormData {
  title: string;
  description: string;
  type: "online" | "offline" | "hybrid" | "";
  startDate: string;
  endDate: string;
  venue: {
    name: string;
    address: string;
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  onlineLink: {
    platform: "zoom" | "meet" | "teams" | "other" | "";
    url: string;
    meetingId: string;
    password: string;
  };
  capacity: number;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "cancelled" | "completed";
  thumbnail: File | null;
  attachments: Array<{
    name: string;
    file: File;
    type: string;
  }>;
  isPublic: boolean;
}

// Interface matching the API payload
interface EventPayload {
  title: string;
  description: string;
  type: "online" | "offline" | "hybrid";
  startDate: string;
  endDate: string;
  venue: string;
  capacity: number;
  price: number;
  category: string;
  isPublic: boolean;
}

const AddEvent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.event);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    type: "",
    startDate: "",
    endDate: "",
    venue: {
      name: "",
      address: "",
      city: "",
      country: "",
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    onlineLink: {
      platform: "",
      url: "",
      meetingId: "",
      password: "",
    },
    capacity: 0,
    price: 0,
    currency: "INR",
    category: "",
    tags: [],
    status: "draft",
    thumbnail: null,
    attachments: [],
    isPublic: false,
  });

  const [newTag, setNewTag] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (name.includes(".")) {
      const parts = name.split(".");
      setFormData((prev) => {
        let newData = { ...prev };
        let current: any = newData;

        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }

        const lastPart = parts[parts.length - 1];
        current[lastPart] = type === "number" ? Number(value) : value;

        return newData;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleFileChange = (e: { target: { files: FileList | null } }) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFormData((prev) => ({ ...prev, thumbnail: null }));
        // You might want to show an error message here
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setFormData((prev) => ({ ...prev, thumbnail: null }));
        // You might want to show an error message here
        return;
      }

      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      // Validate required fields
      if (
        !formData.title ||
        !formData.description ||
        !formData.type ||
        !formData.startDate ||
        !formData.endDate
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Add basic fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("capacity", String(formData.capacity));
      formDataToSend.append("price", String(formData.price));
      formDataToSend.append("currency", formData.currency);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("isPublic", String(formData.isPublic));

      // Add venue details for offline or hybrid events
      if (formData.type !== "online") {
        formDataToSend.append("venue", JSON.stringify(formData.venue));
      }

      // Add online meeting details for online or hybrid events
      if (formData.type !== "offline") {
        formDataToSend.append(
          "onlineLink",
          JSON.stringify(formData.onlineLink)
        );
      }

      // Add tags
      formDataToSend.append("tags", JSON.stringify(formData.tags));

      // Add thumbnail if exists
      if (formData.thumbnail) {
        const thumbnailFile = formData.thumbnail;
        formDataToSend.append("thumbnail", thumbnailFile);

        // Validate file size (5MB limit)
        if (thumbnailFile.size > 5 * 1024 * 1024) {
          throw new Error("Thumbnail image size should be less than 5MB");
        }

        // Validate file type
        if (!thumbnailFile.type.startsWith("image/")) {
          throw new Error("Please upload a valid image file");
        }
      }

      await dispatch(createEvent(formDataToSend)).unwrap();
      setPopup({
        isVisible: true,
        message: "Event created successfully!",
        type: "success",
      });
      // Reset form after successful submission
      setFormData({
        title: "",
        description: "",
        type: "",
        startDate: "",
        endDate: "",
        venue: {
          name: "",
          address: "",
          city: "",
          country: "",
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
        },
        onlineLink: {
          platform: "",
          url: "",
          meetingId: "",
          password: "",
        },
        capacity: 0,
        price: 0,
        currency: "INR",
        category: "",
        tags: [],
        status: "draft",
        thumbnail: null,
        attachments: [],
        isPublic: false,
      });
    } catch (err) {
      setPopup({
        isVisible: true,
        message: err instanceof Error ? err.message : "Failed to create event",
        type: "error",
      });

      console.log("Failed to create event:", err);
    }
  };

  return (
    <>
      <PopupAlert
        isVisible={popup.isVisible}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ isVisible: false, message: "", type: "" })}
      />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Event</h2>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <QuillEditor
                value={formData.description}
                onChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, description: value }))
                }
                placeholder="Event description..."
                height="200px"
                toolbar="full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Venue Information */}
            {(formData.type === "offline" || formData.type === "hybrid") && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Venue Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      name="venue.name"
                      value={formData.venue.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="venue.address"
                      value={formData.venue.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="venue.city"
                      value={formData.venue.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="venue.country"
                      value={formData.venue.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      name="venue.coordinates.latitude"
                      value={formData.venue.coordinates.latitude}
                      onChange={handleInputChange}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      name="venue.coordinates.longitude"
                      value={formData.venue.coordinates.longitude}
                      onChange={handleInputChange}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Online Meeting Details */}
            {(formData.type === "online" || formData.type === "hybrid") && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Online Meeting Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <select
                      name="onlineLink.platform"
                      value={formData.onlineLink.platform}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Platform</option>
                      <option value="zoom">Zoom</option>
                      <option value="meet">Google Meet</option>
                      <option value="teams">Microsoft Teams</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting URL
                    </label>
                    <input
                      type="url"
                      name="onlineLink.url"
                      value={formData.onlineLink.url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting ID
                    </label>
                    <input
                      type="text"
                      name="onlineLink.meetingId"
                      value={formData.onlineLink.meetingId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="text"
                      name="onlineLink.password"
                      value={formData.onlineLink.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Additional Settings
              </h3>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Make this event public
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter a tag"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add Tag
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 focus:outline-none"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail Image
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
                    formData.thumbnail
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      const fileList = new DataTransfer();
                      fileList.items.add(file);
                      handleFileChange({ target: { files: fileList.files } });
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label htmlFor="thumbnail-upload" className="cursor-pointer">
                    {formData.thumbnail ? (
                      <div className="space-y-3">
                        <img
                          src={URL.createObjectURL(formData.thumbnail)}
                          alt="Thumbnail preview"
                          className="mx-auto h-32 w-32 object-cover rounded-md"
                        />
                        <p className="text-sm text-gray-500">
                          {formData.thumbnail.name}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData((prev) => ({
                              ...prev,
                              thumbnail: null,
                            }));
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                          </svg>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="text-blue-600 hover:text-blue-700">
                            Upload a file
                          </span>{" "}
                          or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating Event..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddEvent;
