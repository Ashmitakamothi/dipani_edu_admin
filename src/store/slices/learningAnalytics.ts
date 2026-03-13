import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface OverviewStats {
    totalEnrollments: number;
    totalCourses: number;
    activeStudentsCount: number;
    averageCompletionRate: number;
}

interface PopularCourse {
    _id: string;
    title: string;
    enrollmentCount: number;
}

interface CompletionRate {
    _id: string;
    title: string;
    avgProgress: number;
    studentCount: number;
}

interface StudentProgress {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
        profilePicture?: string;
    };
    courseId: {
        _id: string;
        title: string;
    };
    progressPercentage: number;
    status: string;
    updatedAt: string;
}

interface LearningAnalyticsState {
    overview: OverviewStats | null;
    popularCourses: PopularCourse[];
    completionRates: CompletionRate[];
    studentProgress: StudentProgress[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const initialState: LearningAnalyticsState = {
    overview: null,
    popularCourses: [],
    completionRates: [],
    studentProgress: [],
    loading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    },
};

export const fetchLearningOverview = createAsyncThunk(
    "learningAnalytics/fetchOverview",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/learning-analytics/overview");
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchPopularCourses = createAsyncThunk(
    "learningAnalytics/fetchPopular",
    async (limit: number = 5, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/learning-analytics/popular-courses?limit=${limit}`);
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchCompletionRates = createAsyncThunk(
    "learningAnalytics/fetchCompletionRates",
    async (limit: number = 10, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/learning-analytics/completion-rates?limit=${limit}`);
            return response.data?.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchStudentProgress = createAsyncThunk(
    "learningAnalytics/fetchStudentProgress",
    async ({ page = 1, limit = 10, search = "" }: { page?: number, limit?: number, search?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/learning-analytics/student-progress?page=${page}&limit=${limit}&search=${search}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const learningAnalyticsSlice = createSlice({
    name: "learningAnalytics",
    initialState,
    reducers: {
        setCurrentPage: (state, action) => {
            state.pagination.page = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Overview
            .addCase(fetchLearningOverview.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLearningOverview.fulfilled, (state, action) => {
                state.loading = false;
                state.overview = action.payload;
            })
            .addCase(fetchLearningOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Popular Courses
            .addCase(fetchPopularCourses.fulfilled, (state, action) => {
                state.popularCourses = action.payload;
            })
            // Completion Rates
            .addCase(fetchCompletionRates.fulfilled, (state, action) => {
                state.completionRates = action.payload;
            })
            // Student Progress
            .addCase(fetchStudentProgress.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStudentProgress.fulfilled, (state, action) => {
                state.loading = false;
                state.studentProgress = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchStudentProgress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setCurrentPage } = learningAnalyticsSlice.actions;
export default learningAnalyticsSlice.reducer;
