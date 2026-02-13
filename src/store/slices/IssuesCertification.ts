import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface IssueCertificateState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: IssueCertificateState = {
  loading: false,
  error: null,
  data: null,
};

// Issue a certificate
export const issueCertificate = createAsyncThunk(
  "issueCertificate/issueCertificate",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/certificates", payload);
      return response.data;
    } catch (err: any) {
      console.error("Error issuing certificate:", err?.message);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch all issued certificates
export const fetchIssuedCertificates = createAsyncThunk(
  "issueCertificate/fetchIssuedCertificates",
  async (
    params?: { page?: number; limit?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);

      const response = await axiosInstance.get(
        `/issued-certificates?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (err: any) {
      console.error("Error fetching issued certificates:", err?.message);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch issued certificate by ID
export const fetchIssuedCertificateById = createAsyncThunk(
  "issueCertificate/fetchIssuedCertificateById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/issued-certificates/${id}`);
      return response.data;
    } catch (err: any) {
      console.error("Error fetching issued certificate by ID:", err?.message);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const issueCertificateSlice = createSlice({
  name: "issueCertificate",
  initialState,
  reducers: {
    clearIssuedError: (state) => {
      state.error = null;
    },
    clearIssuedData: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(issueCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(issueCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(issueCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchIssuedCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssuedCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchIssuedCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchIssuedCertificateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssuedCertificateById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchIssuedCertificateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearIssuedError, clearIssuedData } =
  issueCertificateSlice.actions;
export default issueCertificateSlice.reducer;
