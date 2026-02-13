import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";
import axios from "axios";

export interface News {
  _id: string;
  title: string;
  slug?: string;
  summary?: string;
  content: string | object;
  source?: {
    id?: string;
    name: string;
    url?: string;
  };
  author?: {
    name?: string;
    profileUrl?: string;
  };
  url: string;
  imageUrl?: string;
  videoUrl?: string;
  publishedAt: string;
  fetchedAt?: string;
  language?: string;
  country?: string;
  categories?: string[];
  tags?: string[];
  sentiment?: {
    score?: number;
    label?: "positive" | "neutral" | "negative";
  };
  entities?: {
    persons?: string[];
    organizations?: string[];
    locations?: string[];
  };
  stats?: {
    views?: number;
    likes?: number;
    shares?: number;
  };
  isBreaking?: boolean;
  isPremium?: boolean;
  status?: "active" | "deleted" | "blocked";
  createdAt?: string;
  updatedAt?: string;
  userInteraction?: {
    hasLiked?: boolean;
    hasViewed?: boolean;
    hasShared?: boolean;
  };
}

export interface NewsState {
  news: News[];
  currentNews: News | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

const initialState: NewsState = {
  news: [],
  currentNews: null,
  loading: false,
  error: null,
  pagination: null,
};

// CREATE NEWS
export const createNews = createAsyncThunk(
  "news/createNews",
  async (newsData: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/news", newsData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data?.success === true) {
        setTimeout(() => {
          window.location.href = "/news";
        }, 1000);
      }
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create news"
      );
    }
  }
);

// FETCH ALL NEWS
export const fetchNews = createAsyncThunk(
  "news/fetchNews",
  async (
    params: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      search?: string;
      category?: string;
      tag?: string;
      language?: string;
      country?: string;
      isBreaking?: boolean;
      status?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get("/news", { params });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch news"
      );
    }
  }
);

// FETCH NEWS BY ID
export const fetchNewsById = createAsyncThunk(
  "news/fetchNewsById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/news/${id}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch news"
      );
    }
  }
);

// UPDATE NEWS
export const updateNews = createAsyncThunk(
  "news/updateNews",
  async (
    { id, newsData }: { id: string; newsData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(`/news/${id}`, newsData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update news"
      );
    }
  }
);

// DELETE NEWS
export const deleteNews = createAsyncThunk(
  "news/deleteNews",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/news/${id}`);
      return { id, ...response.data };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete news"
      );
    }
  }
);

// FETCH CATEGORIES
export const fetchCategories = createAsyncThunk(
  "news/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/news/all/categories");
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch categories"
      );
    }
  }
);

// VIEW NEWS (Track view)
export const viewNews = createAsyncThunk(
  "news/viewNews",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/news/${id}/view`);
      return response.data;
    } catch (err: any) {
      // Don't fail if view tracking fails, just log it
      console.error("Failed to track view:", err);
      return rejectWithValue(null);
    }
  }
);

// SHARE NEWS (Track share)
export const shareNews = createAsyncThunk(
  "news/shareNews",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/news/${id}/share`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to share news"
      );
    }
  }
);

// LIKE NEWS (Toggle like/unlike)
export const likeNews = createAsyncThunk(
  "news/likeNews",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/news/${id}/toggle-like`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to like news"
      );
    }
  }
);

// CHECK USER INTERACTION STATUS
export const checkInteractionStatus = createAsyncThunk(
  "news/checkInteractionStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/news/${id}/interaction-status`);
      return response.data;
    } catch (err: any) {
      // Don't fail if check fails, just return null
      return rejectWithValue(null);
    }
  }
);

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentNews: (state) => {
      state.currentNews = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNews.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload?.data) {
          state.news.unshift(action.payload.data);
        }
      })
      .addCase(createNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // FETCH ALL
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload?.data) {
          // Ensure categories are always arrays
          const newsData = (action.payload.data.data || []).map((item: News) => ({
            ...item,
            categories: Array.isArray(item.categories)
              ? item.categories
              : typeof item.categories === "string" && item.categories
              ? item.categories.split(",").map((c: string) => c.trim()).filter((c: string) => c)
              : [],
          }));
          state.news = newsData;
          state.pagination = {
            total: action.payload.data.total || 0,
            page: action.payload.data.page || 1,
            limit: action.payload.data.limit || 10,
            totalPages: action.payload.data.totalPages || 1,
          };
        }
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // FETCH BY ID
      .addCase(fetchNewsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.currentNews = action.payload?.data || null;
      })
      .addCase(fetchNewsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // UPDATE
      .addCase(updateNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNews.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = null;
        const updated = action.payload?.data;
        if (updated) {
          // Update in news list
          state.news = state.news.map((n) =>
            n._id === updated._id ? updated : n
          );
          // Update currentNews if it's the same news
          if (state.currentNews && state.currentNews._id === updated._id) {
            state.currentNews = updated;
          }
        }
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // DELETE
      .addCase(deleteNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNews.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.news = state.news.filter((n) => n._id !== action.payload.id);
        if (state.currentNews && state.currentNews._id === action.payload.id) {
          state.currentNews = null;
        }
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // VIEW NEWS
      .addCase(viewNews.fulfilled, (state, action: PayloadAction<any>) => {
        // Update stats if available
        if (action.payload?.data?.stats && state.currentNews) {
          state.currentNews.stats = action.payload.data.stats;
        }
      })
      // SHARE NEWS
      .addCase(shareNews.fulfilled, (state, action: PayloadAction<any>) => {
        // Update stats if available
        if (action.payload?.data?.stats && state.currentNews) {
          state.currentNews.stats = action.payload.data.stats;
        }
        // Update in list if available
        if (action.payload?.data) {
          const updatedNews = action.payload.data;
          state.news = state.news.map((n) =>
            n._id === updatedNews._id ? { ...n, stats: updatedNews.stats } : n
          );
        }
      })
      // LIKE NEWS
      .addCase(likeNews.fulfilled, (state, action: PayloadAction<any>) => {
        // Update stats and interaction status
        if (action.payload?.data) {
          const updatedNews = action.payload.data;
          // Update current news
          if (state.currentNews && state.currentNews._id === updatedNews._id) {
            state.currentNews.stats = updatedNews.stats;
            state.currentNews.userInteraction = {
              hasLiked: action.payload.isLiked,
            };
          }
          // Update in list
          state.news = state.news.map((n) =>
            n._id === updatedNews._id
              ? {
                  ...n,
                  stats: updatedNews.stats,
                  userInteraction: {
                    hasLiked: action.payload.isLiked,
                  },
                }
              : n
          );
        }
      })
      // CHECK INTERACTION STATUS
      .addCase(
        checkInteractionStatus.fulfilled,
        (state, action: PayloadAction<any>) => {
          if (action.payload?.data && state.currentNews) {
            state.currentNews.userInteraction = action.payload.data;
          }
        }
      );
  },
});

export const { clearError, clearCurrentNews } = newsSlice.actions;
export default newsSlice.reducer;

