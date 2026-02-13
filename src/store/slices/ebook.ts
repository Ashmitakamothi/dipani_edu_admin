import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface EbookState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: EbookState = {
  loading: false,
  error: null,
  data: null,
};

export const createEbook = createAsyncThunk(
  "ebook/createEbook",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/ebooks/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

interface PaginationData {
  ebooks: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchEbooks = createAsyncThunk<
  PaginationData,
  { page?: number; limit?: number; search?: string } | undefined
>(
  "ebook/fetchEbooks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = "" } = params;
      const response = await axiosInstance.get("/ebooks/", {
        params: { page, limit, search },
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = response.data?.data;
      return {
        ebooks: data?.data || [],
        total: data?.total || 0,
        page: data?.page || 1,
        limit: data?.limit || 10,
        totalPages: data?.totalPages || 0,
      };
    } catch (error: any) {
      console.error('Fetch ebooks error:', error);
      return {
        ebooks: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  }
);

export const fetchEbookById = createAsyncThunk(
  "ebook/fetchEbookById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/ebooks/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateEbook = createAsyncThunk(
  "ebook/updateEbook",
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/ebooks/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteEbook = createAsyncThunk(
  "ebook/deleteEbook",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/ebooks/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const ebookSlice = createSlice({
  name: "ebook",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createEbook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEbook.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createEbook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEbooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEbooks.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchEbooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEbookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEbookById.fulfilled, (state, action) => {
        state.loading = false;
        // Optimization: could store single ebook details separately if needed
      })
      .addCase(fetchEbookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateEbook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEbook.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateEbook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteEbook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEbook.fulfilled, (state, action) => {
        state.loading = false;
        if (state.data && state.data.ebooks) {
          state.data.ebooks = state.data.ebooks.filter((e: any) => e._id !== action.payload);
          state.data.total -= 1;
        }
      })
      .addCase(deleteEbook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default ebookSlice.reducer;
