import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosConfig';

interface DashboardState {
    overview: any;
    loading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    overview: null,
    loading: false,
    error: null,
};

// Async thunk to fetch overview data
const fetchOverview = createAsyncThunk(
    'dashboard/fetchOverview',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/overview', {
                headers: {
"Content-Type": 'application/json',
                },
            });
            return response.data?.data || {};
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch overview');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOverview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOverview.fulfilled, (state, action) => {
                state.loading = false;
                state.overview = action.payload;
            })
            .addCase(fetchOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});
export { fetchOverview };

export default dashboardSlice.reducer;