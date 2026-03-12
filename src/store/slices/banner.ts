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

export interface PageBannerData {
    _id?: string;
    pageKey?: string;
    badge: {
        text: string;
        iconName: string;
    };
    title: {
        main: string;
        accent: string;
        sub: string;
    };
    description: string;
    primaryCTA: {
        text: string;
        link: string;
    };
    secondaryCTA: {
        text: string;
        link: string;
    };
    image: {
        src: string;
        alt: string;
    };
    tags: {
        top: string;
        bottom: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface BannerState {
    banners: Banner[];
    banner?: Banner | null;
    pageBanners: Record<string, PageBannerData>;
    loading: boolean;
    error: string | null;
}

const initialState: BannerState = {
    banners: [],
    banner: null,
    pageBanners: {},
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
                        "Content-Type": undefined,
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

// UPDATE PAGE BANNER (UPSERT)
export const updatePageBanner = createAsyncThunk(
    "banner/updatePageBanner",
    async ({ pageKey, formData }: { pageKey: string; formData: FormData }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/page-banners", formData, {
                headers: {
                    "Content-Type": undefined,
                },
            });
            return { pageKey, data: res.data.data }; // res.data.data is now an array
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// BULK UPDATE PAGE BANNERS (UPSERT ALL)
export const bulkUpdatePageBanners = createAsyncThunk(
    "banner/bulkUpdatePageBanners",
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/page-banners/bulk", formData, {
                headers: {
                    "Content-Type": undefined,
                },
            });
            return res.data.data; // Array of all banners
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// FETCH ALL PAGE BANNERS
export const fetchAllPageBanners = createAsyncThunk(
    "banner/fetchAllPageBanners",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/page-banners");
            return res.data.data; // Array of PageBannerData
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// FETCH PAGE BANNER
export const fetchPageBanner = createAsyncThunk(
    "banner/fetchPageBanner",
    async (pageKey: string, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/page-banners/${pageKey}`);
            return { pageKey, data: res.data.data };
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
            })
            // UPDATE PAGE BANNER
            .addCase(updatePageBanner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePageBanner.fulfilled, (state, action: PayloadAction<{ pageKey: string; data: any }>) => {
                state.loading = false;
                // Handle bulk data returned from server
                if (Array.isArray(action.payload.data)) {
                    action.payload.data.forEach((banner: any) => {
                        if (banner.pageKey) {
                            state.pageBanners[banner.pageKey] = banner;
                        }
                    });
                } else {
                    // Fallback to single update if backend changes
                    state.pageBanners[action.payload.pageKey] = action.payload.data;
                }
            })
            .addCase(updatePageBanner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // BULK UPDATE PAGE BANNERS
            .addCase(bulkUpdatePageBanners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkUpdatePageBanners.fulfilled, (state, action: PayloadAction<PageBannerData[]>) => {
                state.loading = false;
                action.payload.forEach((banner: any) => {
                    if (banner.pageKey) {
                        state.pageBanners[banner.pageKey] = banner;
                    }
                });
            })
            .addCase(bulkUpdatePageBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // FETCH PAGE BANNER
            .addCase(fetchPageBanner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPageBanner.fulfilled, (state, action: PayloadAction<{ pageKey: string; data: PageBannerData }>) => {
                state.loading = false;
                if (action.payload.data) {
                    state.pageBanners[action.payload.pageKey] = action.payload.data;
                }
            })
            .addCase(fetchPageBanner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // FETCH ALL PAGE BANNERS
            .addCase(fetchAllPageBanners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPageBanners.fulfilled, (state, action: PayloadAction<PageBannerData[]>) => {
                state.loading = false;
                action.payload.forEach((banner: any) => {
                    if (banner.pageKey) {
                        state.pageBanners[banner.pageKey] = banner;
                    }
                });
            })
            .addCase(fetchAllPageBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default bannerSlice.reducer;