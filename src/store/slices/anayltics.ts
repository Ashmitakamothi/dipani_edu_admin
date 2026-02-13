import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../services/axiosConfig';

interface DashboardData {
    // Define the structure based on your backend response
    [key: string]: any;
}

interface VideoMetrics {
    [key: string]: any;
}

interface UserAnalytics {
    [key: string]: any;
}

interface ProjectAnalytics {
    [key: string]: any;
}

interface AnalyticsState {
    dashboard: DashboardData | null;
    videoMetrics: Record<string, VideoMetrics>;
    userAnalytics: Record<string, UserAnalytics>;
    projectAnalytics?: ProjectAnalytics | null;
    loading: boolean;
    error: string | null;
}

const initialState: AnalyticsState = {
    dashboard: null,
    videoMetrics: {},
    userAnalytics: {},
    projectAnalytics: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchDashboard = createAsyncThunk(
    'analytics/fetchDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/analytics/dashboard',
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
                
            );
            return response.data?.data || {};
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchVideoMetrics = createAsyncThunk(
    'analytics/fetchVideoMetrics',
    async (videoId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/analytics/videos/${videoId}/metrics`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return { videoId, data: response.data };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchUserAnalytics = createAsyncThunk(
    'analytics/fetchUserAnalytics',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/analytics/users/${userId}/analytics`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return { userId, data: response.data };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);


export const fetchVideoSessions = createAsyncThunk(
    'analytics/fetchVideoSessions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/analytics/videos/sessions', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Video Sessions Response:', response.data);
            return response.data?.data || [];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
        
    }
);

export const fetchProjectAnalytics = createAsyncThunk(
    'analytics/fetchProjectAnalytics',
    async (_, { rejectWithValue, getState }) => {
        try {
            // Get token from somewhere (e.g., auth state or localStorage)
            const token = localStorage.getItem('accessToken');
            const response = await axiosInstance.get('/project-analytics/full', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log('Project Analytics Response:', response.data);
            return response.data?.data || {};
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Dashboard
            .addCase(fetchDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboard = action.payload;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Video Metrics
            .addCase(fetchVideoMetrics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVideoMetrics.fulfilled, (state, action) => {
                state.loading = false;
                state.videoMetrics[action.payload.videoId] = action.payload.data;
            })
            .addCase(fetchVideoMetrics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // User Analytics
            .addCase(fetchUserAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.userAnalytics[action.payload.userId] = action.payload.data;
            })
            .addCase(fetchUserAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Video Sessions
            .addCase(fetchVideoSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVideoSessions.fulfilled, (state, action) => {
                state.loading = false;
                // Assuming action.payload is an array of video sessions
                state.videoMetrics = action.payload;
            })
            .addCase(fetchVideoSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Project Analytics
            .addCase(fetchProjectAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.projectAnalytics = action.payload;
            })
            .addCase(fetchProjectAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });


    },
});

export default analyticsSlice.reducer;