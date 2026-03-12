import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

export interface SubService {
  _id?: string;
  title: string;
  desc: string;
  items: string[];
}

export interface ServiceCategory {
  _id: string;
  title: string;
  slug: string;
  badge: string;
  description: string;
  colorScheme: string;
  order: number;
  isActive: boolean;
  subServices: SubService[];
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceCategoryState {
  loading: boolean;
  error: string | null;
  categories: ServiceCategory[];
}

const initialState: ServiceCategoryState = {
  loading: false,
  error: null,
  categories: [],
};

export const getAllServiceCategories = createAsyncThunk(
  "serviceCategory/getAll",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/service-categories?admin=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createServiceCategory = createAsyncThunk(
  "serviceCategory/create",
  async ({ data, token }: { data: Partial<ServiceCategory>; token: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/service-categories", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateServiceCategory = createAsyncThunk(
  "serviceCategory/update",
  async (
    { id, data, token }: { id: string; data: Partial<ServiceCategory>; token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(`/service-categories/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteServiceCategory = createAsyncThunk(
  "serviceCategory/delete",
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/service-categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const serviceCategorySlice = createSlice({
  name: "serviceCategory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllServiceCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllServiceCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data || [];
      })
      .addCase(getAllServiceCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createServiceCategory.fulfilled, (state, action) => {
        if (action.payload.data) state.categories.push(action.payload.data);
      })
      .addCase(updateServiceCategory.fulfilled, (state, action) => {
        const updated = action.payload.data;
        if (updated) {
          state.categories = state.categories.map((c) => (c._id === updated._id ? updated : c));
        }
      })
      .addCase(deleteServiceCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c._id !== action.payload);
      });
  },
});

export default serviceCategorySlice.reducer;
