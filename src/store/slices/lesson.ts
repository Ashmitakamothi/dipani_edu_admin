import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../services/axiosConfig";

interface LessonState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: LessonState = {
  loading: false,
  error: null,
  data: null,
};

export const createLesson = createAsyncThunk(
  "lesson/createLesson",
  async (
    lessonData: {
      language: string;
      section: string;
      moduleId: string;
      title: string;
      description: string;
      type: string;
      order: number;
      isRequired: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      Object.entries(lessonData).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const response = await axiosInstance.post("/lesson", formData, {
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

export const updateLesson = createAsyncThunk(
  "lesson/updateLesson",
  async (
    {
      lessonId,
      lessonData,
      token,
    }: {
      lessonId: string;
      lessonData: {
        language?: string;
        section?: string;
        moduleId?: string;
        title?: string;
        description?: string;
        type?: string;
        order?: number;
        isRequired?: boolean;
        fileUrl?: File;
        image?: File;
      };
      token: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      Object.entries(lessonData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });

      const response = await axiosInstance.put(
        `/lesson/${lessonId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteLesson = createAsyncThunk(
  "lesson/deleteLesson",
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/lesson/${lessonId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateLessonMobileOnly = createAsyncThunk(
  "lesson/updateLessonMobileOnly",
  async (
    {
      lessonId,
      ismobileOnly,
      token,
    }: { lessonId: string; ismobileOnly: boolean; token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/lesson/${lessonId}/mobile-only`,
        { ismobileOnly },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // window.location.reload();

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateLessonMobileOnly.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLessonMobileOnly.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming the payload contains the updated lesson data
        state.data = { ...state.data, ...action.payload };
      })
      .addCase(updateLessonMobileOnly.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLesson.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming the payload contains the updated lesson data
        state.data = { ...state.data, ...action.payload };
      })
      .addCase(updateLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.loading = false;
        // Clear the data if this lesson was deleted
        state.data = null;
      })
      .addCase(deleteLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default lessonSlice.reducer;
