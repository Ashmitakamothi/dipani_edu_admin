import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";


export interface Banner {
    _id: string;
    title: string;
    image: string;
    type: string;
    referenceId?: string;
    isActive: boolean;
    priority: number;
    actionUrl?: string;
    startDate?: string;
    endDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface BannerState {
    banners: Banner[];
    banner?: Banner | null;
    loading: boolean;
    error: string | null;
}

const initialState: BannerState = {
    banners: [],
    banner: null,
    loading: false,
    error: null,
};

// CREATE
export const createBanner = createAsyncThunk(
    "banner/createBanner",
    async (bannerData: Partial<Banner>, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/banners", bannerData,
    {
                headers: {
                    "Content-Type": "mutlipart/form-data",
                },
            }
            );
            if (res.data?.success == true) {
                setTimeout(() => {
                    window.location.href = "/banner";
                }, 1000);
            }
                return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// FETCH ALL
export const fetchBanners = createAsyncThunk(
    "banner/fetchBanners",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/banners");
            console.log("Fetched banners:", res.data?.data?.banners);
            return res.data?.data?.banners || [];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// FETCH BY ID
export const fetchBannerById = createAsyncThunk(
    "banner/fetchBannerById",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/banners/${id}`);
            return res.data?.data?.banner || null;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// UPDATE
export const updateBanner = createAsyncThunk(
    "banner/updateBanner",
    async (
        { id, bannerData }: { id: string; bannerData: Partial<Banner> },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.put(`/banners/${id}`, bannerData);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// DELETE
export const deleteBanner = createAsyncThunk(
    "banner/deleteBanner",
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/banners/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const bannerSlice = createSlice({
    name: "banner",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // CREATE
            .addCase(createBanner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBanner.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.banners.unshift(action.payload.data);
            })
            .addCase(createBanner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // FETCH ALL
            .addCase(fetchBanners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBanners.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.banners = action.payload;
            })
            .addCase(fetchBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // FETCH BY ID
            .addCase(fetchBannerById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBannerById.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.banner = action.payload || null;
            })
            .addCase(fetchBannerById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // UPDATE
            .addCase(updateBanner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBanner.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                const updated = action.payload.data;
                state.banners = state.banners.map((b) =>
                    b._id === updated._id ? updated : b
                );
                if (state.banner && state.banner._id === updated._id) {
                    state.banner = updated;
                }
            })
            .addCase(updateBanner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // DELETE
            .addCase(deleteBanner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBanner.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.banners = state.banners.filter((b) => b._id !== action.payload);
            })
            .addCase(deleteBanner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default bannerSlice.reducer;