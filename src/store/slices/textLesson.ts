import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../services/axiosConfig";

interface TextLessonState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: TextLessonState = {
  loading: false,
  error: null,
  data: null,
};

export const createTextLesson = createAsyncThunk(
  "textLesson/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      if (formData.has("lessonId")) {
        formData.append("lesson", formData.get("lessonId") as string);
      }
      const response = await axiosInstance.post("/text-lesson", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      window.location.reload();

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchTextLessons = createAsyncThunk(
  "textLesson/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/text-lesson", {
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateTextLesson = createAsyncThunk(
  "textLesson/update",
  async (
    { lessonId, formData }: { lessonId: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(
        `/text-lesson/${lessonId}`,
        formData
      );
      window.location.reload();

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchTextLessonById = createAsyncThunk(
  "textLesson/fetchById",
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/text-lesson/${lessonId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        // withCredentials: true, // Uncomment if you need to send cookies
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const textLessonSlice = createSlice({
  name: "textLesson",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createTextLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTextLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createTextLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTextLessons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTextLessons.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTextLessons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTextLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTextLesson.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the specific lesson in the state
        // state.data = state.data.map((lesson: any) =>
        //   lesson.id === action.payload.id ? action.payload : lesson
        // );
      })
      .addCase(updateTextLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTextLessonById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTextLessonById.fulfilled, (state, action) => {
        state.loading = false;
        // state.data = action.payload;
      })
      .addCase(fetchTextLessonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default textLessonSlice.reducer;
