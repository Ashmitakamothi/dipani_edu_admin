import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../services/axiosConfig";

interface FileUploadPayload {
  language: string;
  fileType: string;
  downloadable: boolean;
  active: boolean;
  isPublic: boolean;
  file: File;
  lessonId: string;
  courseId: string;
}

interface FilesState {
  uploading: boolean;
  error: string | null;
  success: boolean;
  data: any | null;
}

const initialState: FilesState = {
  uploading: false,
  error: null,
  success: false,
  data: null,
};

export const uploadFile = createAsyncThunk(
  "files/uploadFile",
  async (payload: FileUploadPayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("language", payload.language);
      formData.append("fileType", payload.fileType);
      formData.append("downloadable", String(payload.downloadable));
      formData.append("active", String(payload.active));
      formData.append("isPublic", String(payload.isPublic));
      formData.append("file", payload.file);
      formData.append("lessonId", payload.lessonId);
      formData.append("courseId", payload.courseId);


      const response = await axiosInstance.post(
        "/files",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      window.location.reload();

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "File upload failed"
      );
    }
  }
);

export const fetchFiles = createAsyncThunk(
  "files/fetchFiles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/files");
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "File fetch failed"
      );
    }
  }
);

export const fetchFileById = createAsyncThunk(
  "files/fetchFileById",
  async (fileId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/files/${fileId}`);
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Fetch file by ID failed"
      );
    }
  }
);

interface FileUpdatePayload {
  fileId: string;
  language?: string;
  fileType?: string;
  downloadable?: boolean;
  active?: boolean;
  isPublic?: boolean;
  file?: File;
  lessonId?: string;
  courseId?: string;
}

export const updateFile = createAsyncThunk(
  "files/updateFile",
  async (payload: FileUpdatePayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (payload.language !== undefined)
        formData.append("language", payload.language);
      if (payload.fileType !== undefined)
        formData.append("fileType", payload.fileType);
      if (payload.downloadable !== undefined)
        formData.append("downloadable", String(payload.downloadable));
      if (payload.active !== undefined)
        formData.append("active", String(payload.active));
      if (payload.isPublic !== undefined)
        formData.append("isPublic", String(payload.isPublic));
      if (payload.file !== undefined) formData.append("file", payload.file);
      if (payload.lessonId !== undefined)
        formData.append("lessonId", payload.lessonId);
      if (payload.courseId !== undefined)
        formData.append("courseId", payload.courseId);

      const response = await axiosInstance.put(
        `/files/${payload.fileId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      window.location.reload();

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "File update failed"
      );
    }
  }
);

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    clearFileState: (state) => {
      state.error = null;
      state.success = false;
      state.uploading = false;
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.uploading = false;
        state.success = true;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(fetchFiles.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.uploading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(fetchFileById.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchFileById.fulfilled, (state, action) => {
        state.uploading = false;
        state.success = false; // Don't set success for fetch operations
        state.data = action.payload;
      })
      .addCase(fetchFileById.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { clearFileState } = filesSlice.actions;
export default filesSlice.reducer;
