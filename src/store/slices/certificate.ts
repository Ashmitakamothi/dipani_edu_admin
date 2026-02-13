import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface CertificateState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: CertificateState = {
  loading: false,
  error: null,
  data: null,
};

// Create certificate
export const createCertificate = createAsyncThunk(
  "certificate/createCertificate",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/certificate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      window.location.reload();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch all certificates
export const fetchCertificates = createAsyncThunk(
  "certificate/fetchCertificates",
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
        `/certificate-templates/?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch certificate by ID
export const fetchCertificateById = createAsyncThunk(
  "certificate/fetchCertificateById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/certificate-templates/${id}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update certificate
export const updateCertificate = createAsyncThunk(
  "certificate/updateCertificate",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(`/certificate/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      window.location.reload();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete certificate
export const deleteCertificate = createAsyncThunk(
  "certificate/deleteCertificate",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/certificate/${id}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Download certificate as PDF
export const fetchCertificatePdf = createAsyncThunk(
  "certificate/fetchCertificatePdf",
  async (
    { certificateId }: { certificateId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        `/certificates/${certificateId}/pdf`,
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/pdf",
          },
        }
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const certificateSlice = createSlice({
  name: "certificate",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearData: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCertificateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertificateById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCertificateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(deleteCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCertificatePdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertificatePdf.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCertificatePdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearData } = certificateSlice.actions;
export default certificateSlice.reducer;
