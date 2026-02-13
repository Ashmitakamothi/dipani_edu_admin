import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../services/axiosConfig";

interface DripRulePayload {
  dripType: string;
  referenceType: string;
  referenceId: string;
  delayDays: number;
  targetType: string;
  targetId: string | string[]; // <-- allow array for multi-select
}

interface DripState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: DripState = {
  loading: false,
  error: null,
  data: null,
};

export const createDripRule = createAsyncThunk(
  "drip/createDripRule",
  async (payload: DripRulePayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/drip/drip-rule", payload, {
        headers: {
          "Content-Type": "application/json",
          // You may want to set cookies via withCredentials or manually if needed
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDripRules = createAsyncThunk(
  "drip/fetchDripRules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/drip/drip-rules", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateDripRuleByReferenceId = createAsyncThunk(
  "drip/updateDripRuleByReferenceId",
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/drip/drip-rules/by-target/${updateData.targetId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteDripRule = createAsyncThunk(
  "drip/deleteDripRule",
  async (dripRuleId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/drip/drip-rule/${dripRuleId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCourseContents = createAsyncThunk(
  "drip/fetchCourseContents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/courses/contents", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console?.log("Fetched course contents:", response.data);
      return response.data?.data || response.data; // Adjust based on your API response structure
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const dripSlice = createSlice({
  name: "drip",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createDripRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDripRule.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createDripRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDripRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDripRules.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDripRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteDripRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDripRule.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally handle the deletion in the state
        // For example, you might want to filter out the deleted rule from the data array
        state.data = state.data.filter(
          (rule: any) => rule.id !== action.payload.id
        );
      })
      .addCase(deleteDripRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourseContents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseContents.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(fetchCourseContents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateDripRuleByReferenceId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDripRuleByReferenceId.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the state with the updated rule
        // const updatedRule = action.payload;
        // if (state.data) {
        //   const index = state.data.findIndex(
        //     (rule: any) => rule.referenceId === updatedRule.referenceId
        //   );
        //   if (index !== -1) {
        //     state.data[index] = updatedRule;
        //   } else {
        //     state.data.push(updatedRule);
        //   }
        // }
      })
      .addCase(updateDripRuleByReferenceId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dripSlice.reducer;
