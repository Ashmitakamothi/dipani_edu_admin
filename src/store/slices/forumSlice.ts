import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

export interface ForumReply {
  _id: string;
  content: string;
  repliedBy: { _id: string; fullName: string; email?: string; role?: string }; // updated from createdBy
  createdAt: string;
  updatedAt?: string;
  parentReplyId?: string | null;
  attachments?: any[];
  likeCount?: number;
  likes?: any[];
  nestedReplies?: ForumReply[];
  threadId?: string;
}

export interface ForumThread {
  _id: string;
  title: string;
  content: string;
  createdBy: { _id: string; fullName: string };
  createdAt: string;
  replies: ForumReply[];
  isApproved?: boolean;      // fixed type
  Is_openSource?: boolean;   // backend naming kept as-is
  tags?: string[];           // add tags as array
  attachments?: any[];       // add attachments
}

export interface ThreadReplies {
  replies: ForumReply[];
  total: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ForumState {
  threads: ForumThread[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  statusFilter: string;
  selectedThread?: ForumThread | null;
  threadReplies: ForumReply[];
  repliesLoading: boolean;
  repliesError: string | null;
}

const initialState: ForumState = {
  threads: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  statusFilter: "",
  selectedThread: null,
  threadReplies: [],
  repliesLoading: false,
  repliesError: null,
};

/**
 * Fetch all forum threads (with replies)
 */
export const fetchForumThreads = createAsyncThunk(
  "forum/fetchThreads",
  async (
    { page = 1, limit = 10, token, status }: { page?: number; limit?: number; token: string; status?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        `/forum/all-threads-with-replies?isApproved=${status || "all"}&page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data?.data || {};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Approve / Reject a thread
 */
export const updateForumThreadStatus = createAsyncThunk(
  "forum/updateStatus",
  async (
    { threadId, token, status }: { threadId: string; token: string; status: "approved" | "rejected" },
    { rejectWithValue }
  ) => {
    try {
      const isApproved = status === "approved";
      const response = await axiosInstance.patch(
        `/forum/thread/${threadId}/approve`,
        { isApproved },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return { threadId, isApproved: status === "approved", ...response.data?.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Update Open Source status
 */
export const updateForumThreadOpenSource = createAsyncThunk(
  "forum/updateOpenSource",
  async (
    { threadId, token, Is_openSource }: { threadId: string; token: string; Is_openSource: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(
        `/forum/thread/${threadId}/open-source`,
        { Is_openSource },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return { threadId, Is_openSource, ...response.data?.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Fetch single thread by ID
 */
export const fetchForumThreadById = createAsyncThunk(
  "forum/fetchThreadById",
  async ({ threadId, token }: { threadId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/forum/admin/thread/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data?.data || {};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Fetch replies for a specific thread
 */
export const fetchThreadReplies = createAsyncThunk(
  "forum/fetchReplies",
  async ({ threadId, token }: { threadId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/forum/thread/${threadId}/replies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // ensure always array
      return Array.isArray(response.data?.data) ? response.data.data : [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Create a new forum thread
 */
export const createForumThread = createAsyncThunk(
  "forum/createThread",
  async (
    { data, token }: { data: { title: string; content: string; tags: string[]; files?: File[] }; token: string },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      data.tags.forEach((tag, index) => formData.append(`tags[${index}]`, tag));
      if (data.files && data.files.length > 0) {
        data.files.forEach((file) => formData.append("files", file));
      }

      const response = await axiosInstance.post("/forum/thread", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data?.data || {};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Update Forum Thread with file uploads and tags as array
 */
export const updateForumThread = createAsyncThunk(
  "forum/updateThread",
  async (
    {
      threadId,
      data,
      token
    }: {
      threadId: string;
      data: {
        title: string;
        content: string;
        tags: string[];
        files?: File[];
      };
      token: string
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);

      // Handle tags as array
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });

      // Handle multiple file attachments
      if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await axiosInstance.put(
        `/forum/thread/${threadId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return { threadId, ...response.data?.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Delete a forum thread
 */
export const deleteForumThread = createAsyncThunk(
  "forum/deleteThread",
  async ({ threadId, token }: { threadId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/forum/thread/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { threadId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Update a forum reply
 */
export const updateForumReply = createAsyncThunk(
  "forum/updateReply",
  async (
    { replyId, content, token }: { replyId: string; content: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(
        `/forum/reply/${replyId}`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data?.data || {};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Delete a forum reply
 */
export const deleteForumReply = createAsyncThunk(
  "forum/deleteReply",
  async ({ replyId, token }: { replyId: string; token: string }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/forum/reply/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { replyId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const forumSlice = createSlice({
  name: "forum",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      state.pagination.page = 1;
    },
    clearSelectedThread: (state) => {
      state.selectedThread = null;
    },
    setSelectedThread: (state, action: PayloadAction<ForumThread>) => {
      state.selectedThread = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all threads
      .addCase(fetchForumThreads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForumThreads.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.threads = action.payload.threads || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 1,
        };
      })
      .addCase(fetchForumThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update approval status
      .addCase(updateForumThreadStatus.fulfilled, (state, action: PayloadAction<any>) => {
        const { threadId, isApproved } = action.payload;
        const thread = state.threads.find((t) => t._id === threadId);
        if (thread) thread.isApproved = isApproved;
      })

      // Update open source flag
      .addCase(updateForumThreadOpenSource.fulfilled, (state, action: PayloadAction<any>) => {
        const { threadId, Is_openSource } = action.payload;
        const thread = state.threads.find((t) => t._id === threadId);
        if (thread) thread.Is_openSource = Is_openSource;
      })

      // Fetch single thread
      .addCase(fetchForumThreadById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedThread = null;
      })
      .addCase(fetchForumThreadById.fulfilled, (state, action: PayloadAction<ForumThread>) => {
        state.loading = false;
        state.selectedThread = action.payload;
      })
      .addCase(fetchForumThreadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.selectedThread = null;
      })

      // Fetch replies
      .addCase(fetchThreadReplies.pending, (state) => {
        state.repliesLoading = true;
        state.repliesError = null;
      })
      .addCase(fetchThreadReplies.fulfilled, (state, action: PayloadAction<ForumReply[]>) => {
        state.repliesLoading = false;
        state.threadReplies = action.payload; // now it's always an array
      })

      .addCase(fetchThreadReplies.rejected, (state, action) => {
        state.repliesLoading = false;
        state.repliesError = action.payload as string;
      })

      // Update thread
      .addCase(updateForumThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateForumThread.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const { threadId } = action.payload;
        const threadIndex = state.threads.findIndex((t) => t._id === threadId);
        if (threadIndex !== -1) {
          // Update the thread in the list
          state.threads[threadIndex] = { ...state.threads[threadIndex], ...action.payload };
        }
        // Update selected thread if it matches
        if (state.selectedThread?._id === threadId) {
          state.selectedThread = { ...state.selectedThread, ...action.payload };
        }
      })
      .addCase(updateForumThread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete thread
      .addCase(deleteForumThread.fulfilled, (state, action: PayloadAction<any>) => {
        const { threadId } = action.payload;
        state.threads = state.threads.filter((t) => t._id !== threadId);
        if (state.selectedThread?._id === threadId) {
          state.selectedThread = null;
        }
      })

      // Update reply
      .addCase(updateForumReply.fulfilled, (state, action: PayloadAction<any>) => {
        const updatedReply = action.payload;
        const index = state.threadReplies.findIndex((r) => r._id === updatedReply._id);
        if (index !== -1) {
          state.threadReplies[index] = { ...state.threadReplies[index], ...updatedReply };
        }
      })

      // Delete reply
      .addCase(deleteForumReply.fulfilled, (state, action: PayloadAction<any>) => {
        const { replyId } = action.payload;
        state.threadReplies = state.threadReplies.filter((r) => r._id !== replyId);
      });
  },
});

export const { setPage, setLimit, setStatusFilter, clearSelectedThread, setSelectedThread } = forumSlice.actions;
export default forumSlice.reducer;
