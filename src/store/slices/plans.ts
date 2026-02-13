import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface PricingPlanState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: PricingPlanState = {
  loading: false,
  error: null,
  data: null,
};

// CREATE
export const createPricingPlan = createAsyncThunk(
  "pricing/createPricingPlan",
  async (planData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/pricing-plan-discounts",
        planData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// DELETE
export const deletePricingPlan = createAsyncThunk(
  "pricing/deletePricingPlan",
  async (planId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/pricing-plan-discounts/${planId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// UPDATE
export const updatePricingPlan = createAsyncThunk(
  "pricing/updatePricingPlan",
  async ({ planId, updatedData }, { rejectWithValue }) => {
    try {
      // Ensure status is included in updatedData if present
      const response = await axiosInstance.put(
        `/pricing-plan-discounts/${planId}`,
        updatedData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// FETCH ALL
export const getAllPricingPlansByCourse = createAsyncThunk(
  "pricing/getAllPricingPlansByCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/pricing-plan-discounts?courseId=${courseId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const pricingPlanSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPricingPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPricingPlan.fulfilled, (state, action) => {
        state.loading = false;
        // state.data = action.payload;
      })
      .addCase(createPricingPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deletePricingPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePricingPlan.fulfilled, (state, action) => {
        state.loading = false;
        // state.data = action.payload;
      })
      .addCase(deletePricingPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updatePricingPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePricingPlan.fulfilled, (state, action) => {
        state.loading = false;
        // state.data = { ...state.data, ...action.payload };
      })
      .addCase(updatePricingPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAllPricingPlansByCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPricingPlansByCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getAllPricingPlansByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default pricingPlanSlice.reducer;
