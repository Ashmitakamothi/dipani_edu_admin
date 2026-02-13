import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface CourseState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: CourseState = {
  loading: false,
  error: null,
  data: null,
};

export const createCourse = createAsyncThunk(
  "course/createCourse",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      // Ensure the formData is properly formatted

      formData.append("instructerId", "684088dfef718469d2bbcb62");
      const response = await axiosInstance.post("/courses/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

interface PaginationData {
  courses: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchCourses = createAsyncThunk<
  PaginationData,
  { page?: number; limit?: number } | undefined
>(
  "course/fetchCourses",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await axiosInstance.get("/courses/", {
        params: { page, limit },
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = response.data?.data;
      return {
        courses: data?.data || [],
        total: data?.total || 0,
        page: data?.page || 1,
        limit: data?.limit || 10,
        totalPages: data?.totalPages || 0,
      };
    } catch (error: any) {
      console.error('Fetch courses error:', error);
      // Return empty data instead of rejecting to prevent blocking the form
      return {
        courses: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  "course/fetchCourseById",
  async (
    { courseId, token }: { courseId: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        `/courses/${courseId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data?.data?.course;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  "course/updateCourse",
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      // Remove any existing 'instructorId' entries before appending the correct one
      data.delete("instructorId");
      data.append("instructorId", "68b69334dffbe2b24ed4f059");

      const response = await axiosInstance.put(`/courses/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



export const fetchCourseAttachments = createAsyncThunk(
  "course/fetchCourseAttachments",
  async (
    { courseId, type }: { courseId: string; type: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        `/courses/${courseId}/attachments`,
        {
          params: { type },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCourseEnrollments = createAsyncThunk<
  any,
  { courseId: string },
  { rejectValue: string }
>("course/fetchCourseEnrollments", async ({ courseId }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") || "";
    const response = await axiosInstance.get(
      `/enrollment/courses/${courseId}/enrollments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data?.data || [];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch enrollments");
  }
});

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourseAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseAttachments.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming you want to store attachments in the data field
        if (state.data) {
          state.data.attachments = action.payload;
        } else {
          state.data = { attachments: action.payload };
        }
      })
      .addCase(fetchCourseAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourseEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming you want to store enrollments in the data field
        if (state.data) {
          state.data.enrollments = action.payload;
        } else {
          state.data = { enrollments: action.payload };
        }
      })
      .addCase(fetchCourseEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      
  },
});

export default courseSlice.reducer;

// Selector to get all courses (array)
export const getAllCourses = (state: any) =>
  state.course?.data?.courses || [];
