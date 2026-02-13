// src/store/slices/salesAnalyticsSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface SalesAnalyticsState {
  loading: boolean;
  error: string | null;
  data: any;
  userData: any;
  bundleData: any; // Added for bundle analytics
}

const initialState: SalesAnalyticsState = {
  loading: false,
  error: null,
  data: null,
  userData: null,
  bundleData: null, // Added for bundle analytics
};

// Async thunk to fetch course sales analytics
export const fetchCourseSalesAnalytics = createAsyncThunk(
  "salesAnalytics/fetchCourseSalesAnalytics",
  async ({ token }: { token: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/sales-analytics/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    
      // Only return the array of courses
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to fetch user sales analytics
export const fetchUserSalesAnalytics = createAsyncThunk(
  "salesAnalytics/fetchUserSalesAnalytics",
  async (
    { token, per }: { token: string; per?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get("/sales-analytics/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: per ? { per } : {},
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to fetch bundle sales analytics
export const fetchBundleSalesAnalytics = createAsyncThunk(
  "salesAnalytics/fetchBundleSalesAnalytics",
  async (
    { token, bundle }: { token: string; bundle?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get("/sales-analytics/bundles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: bundle ? { bundle } : {},
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const salesAnalyticsSlice = createSlice({
  name: "salesAnalytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseSalesAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseSalesAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCourseSalesAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserSalesAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSalesAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(fetchUserSalesAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBundleSalesAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBundleSalesAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.bundleData = action.payload;
      })
      .addCase(fetchBundleSalesAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default salesAnalyticsSlice.reducer;
