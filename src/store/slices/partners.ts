import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

export interface Partner {
    _id: string;
    name?: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
    isActive: boolean;
    profilePicture?: string;
    image?: string;
    referralCode?: string;
    createdAt: string;
    updatedAt: string;
    isDeleted?: boolean;
    phone?: string;
}

export interface FetchPartnersParams {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
    searchFields?: Record<string, string>;
    sort?: Record<string, "asc" | "desc">;
}

interface PartnerState {
    partners: Partner[];
    payoutRequests: any[];
    partnerDetails: Partner | null;
    loading: boolean;
    error: string | null;
    searchQuery: string;
    filters: Record<string, any>;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export const fetchAllPartners = createAsyncThunk<
    { partners: Partner[]; pagination: PartnerState["pagination"] },
    FetchPartnersParams
>("partners/fetchAll", async (params = {}, { rejectWithValue }) => {
    try {
        const {
            page = 1,
            limit = 10,
            filters = {},
            searchFields,
            sort = { createdAt: "desc" },
        } = params;

        const queryParams = new URLSearchParams();

        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));

        if (Object.keys(filters).length) {
            queryParams.append("filters", JSON.stringify(filters));
        }

        if (
            searchFields &&
            typeof searchFields.search === "string" &&
            searchFields.search.trim()
        ) {
            queryParams.append("search", searchFields.search.trim());
        }

        if (Object.keys(sort).length) {
            queryParams.append("sort", JSON.stringify(sort));
        }

        const response = await axiosInstance.get(
            `${API_BASE_URL}/partners?${queryParams.toString()}`
        );

        const data = response.data?.data;

        return {
            partners: data?.partners || [],
            pagination: {
                total: data?.pagination?.total || 0,
                page: data?.pagination?.page || 1,
                limit: data?.pagination?.limit || 10,
                totalPages: data?.pagination?.totalPages || 1,
            },
        };
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const fetchPartnerById = createAsyncThunk<Partner, string>(
    "partners/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(
                `${API_BASE_URL}/partners/${id}`
            );
            return response.data?.data?.partner;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Using generic user delete endpoint
export const deletePartner = createAsyncThunk<string, string>(
    "partners/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`${API_BASE_URL}/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updatePartner = createAsyncThunk<
    Partner,
    { id: string; data: Partial<Partner> }
>("partners/update", async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`${API_BASE_URL}/partners/${id}`, data);
        return response.data?.data?.partner;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const approvePartner = createAsyncThunk<Partner, string>(
    "partners/approve",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/approve-partner/${id}`);
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchPayoutRequests = createAsyncThunk<any, string | undefined>(
    "partners/fetchPayoutRequests",
    async (status, { rejectWithValue }) => {
        try {
            const url = status ? `/partners/payouts/admin/list?status=${status}` : `/partners/payouts/admin/list`;
            const response = await axiosInstance.get(url);
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

interface UpdatePayoutParams {
    id: string;
    status: 'completed' | 'rejected';
    transactionId?: string;
    adminNotes?: string;
}

export const updatePayoutStatus = createAsyncThunk<any, UpdatePayoutParams>(
    "partners/updatePayoutStatus",
    async ({ id, status, transactionId, adminNotes }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/partners/payouts/admin/${id}/status`, {
                status,
                transactionId,
                adminNotes
            });
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


const initialState: PartnerState = {
    partners: [],
    payoutRequests: [],
    partnerDetails: null,
    loading: false,
    error: null,
    searchQuery: "",
    filters: {},
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    },
};

const partnerSlice = createSlice({
    name: "partners",
    initialState,
    reducers: {
        clearPartnerDetails: (state) => {
            state.partnerDetails = null;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            state.pagination.page = 1;
        },
        setFilters: (state, action) => {
            state.filters = action.payload;
            state.pagination.page = 1;
        },
        resetFilters: (state) => {
            state.searchQuery = "";
            state.filters = {};
            state.pagination.page = 1;
        },
        setCurrentPage: (state, action) => {
            state.pagination.page = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchAll
            .addCase(fetchAllPartners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPartners.fulfilled, (state, action) => {
                state.loading = false;
                state.partners = action.payload.partners;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchAllPartners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // fetchById
            .addCase(fetchPartnerById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPartnerById.fulfilled, (state, action) => {
                state.loading = false;
                state.partnerDetails = action.payload;
            })
            .addCase(fetchPartnerById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // delete
            .addCase(deletePartner.pending, (state) => {
                state.loading = true;
            })
            .addCase(deletePartner.fulfilled, (state, action) => {
                state.loading = false;
                state.partners = state.partners.filter(
                    (p) => p._id !== action.payload
                );
            })
            .addCase(deletePartner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // approve
            .addCase(approvePartner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approvePartner.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.partners.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.partners[index] = action.payload;
                }
            })
            .addCase(approvePartner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Payout Requests
            .addCase(fetchPayoutRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayoutRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.payoutRequests = action.payload;
            })
            .addCase(fetchPayoutRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Payout Status
            .addCase(updatePayoutStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updatePayoutStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.payoutRequests.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.payoutRequests[index] = action.payload;
                }
            })
            .addCase(updatePayoutStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearPartnerDetails,
    setSearchQuery,
    setFilters,
    resetFilters,
    setCurrentPage,
} = partnerSlice.actions;

export default partnerSlice.reducer;
