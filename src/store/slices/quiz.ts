import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../services/axiosConfig";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizPayload {
  course: string;
  lesson: string;
  questions: Question[];
  passMark: number;
}

interface QuizState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: QuizState = {
  loading: false,
  error: null,
  data: null,
};

export const createQuiz = createAsyncThunk(
  "quiz/createQuiz",
  async (payload: QuizPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/quiz",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if needed
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );
      window.location.reload();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchQuiz = createAsyncThunk(
  "quiz/fetchQuiz",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/quiz", {
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        // withCredentials: true, // Uncomment if cookies are needed
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const fetchQuizById = createAsyncThunk(
  "quiz/fetchQuiz",
  async (quizId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/quiz/${quizId}`,
        {
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if needed
            // 'Authorization': `Bearer ${token}`,
          },
          // withCredentials: true, // Uncomment if cookies are needed
        }
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const upadateQuiz = createAsyncThunk(
  "quiz/updateQuiz",
  async (payload: QuizPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/quiz/${payload.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if needed
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );
      window.location.reload();

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(upadateQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upadateQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(upadateQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default quizSlice.reducer;
