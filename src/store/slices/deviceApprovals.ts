import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

export interface DeviceApproval {
  _id: string;
  userId?: { _id: string; fullName: string; email: string };
  user?: { _id: string; fullName: string; email: string };
  deviceId: string;
  deviceInfo: any;
  status: "pending" | "approved" | "rejected";
  isFirstDevice: boolean;
  isActive: boolean;
  requestedAt: string;
  rejectionReason?: string;
  approvedBy?: string;
  rejectedBy?: string;
  processedAt?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DeviceApprovalsState {
  requests: DeviceApproval[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
}

const initialState: DeviceApprovalsState = {
  requests: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const fetchDeviceApprovals = createAsyncThunk(
  "deviceApprovals/fetchAll",
  async (
    { page = 1, limit = 10, status, search }: { page?: number; limit?: number; status?: string; search?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const params: any = { page, limit, sort: "desc" };
      if (status) params.status = status;
      if (search) params.search = search;
      const response = await axiosInstance.get("/device-approvals", {
        params,
      });
      const data = response.data?.data;
      return {
        requests: data?.deviceApprovals || [],
        pagination: {
          total: data?.total || 0,
          page: data?.page || 1,
          limit: data?.limit || 10,
          totalPages: data?.totalPages || 1,
        },
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateDeviceApproval = createAsyncThunk(
  "deviceApprovals/updateStatus",
  async (
    { id, status, rejectionReason }: { id: string; status: "approved" | "rejected"; rejectionReason?: string },
    { rejectWithValue }
  ) => {
    try {
      const payload: any = {
        deviceApprovalId: id,
        status: status === "approved" ? "approve" : "reject",
      };
      if (status === "rejected" && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }
      const response = await axiosInstance.post("/device-approvals/manage", payload);
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const deviceApprovalsSlice = createSlice({
  name: "deviceApprovals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeviceApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeviceApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDeviceApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateDeviceApproval.fulfilled, (state, action) => {
        const updated = action.payload;
        state.requests = state.requests.map((req) =>
          req._id === updated._id ? updated : req
        );
      });
  },
});

export default deviceApprovalsSlice.reducer;
