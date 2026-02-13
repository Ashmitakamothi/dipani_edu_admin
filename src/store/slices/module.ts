import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axios from 'axios';
import axiosInstance from '../../services/axiosConfig';

interface ModuleState {
    loading: boolean;
    error: string | null;
    data: any;
}

const initialState: ModuleState = {
    loading: false,
    error: null,
    data: null,
};

export const createModule = createAsyncThunk(
    'module/createModule',
    async (
        {
            courseId,
            title,
            description,
            order,
            estimatedDuration,
            isPublished,
            token,
        }: {
            courseId: string;
            title: string;
            description: string;
            order: number;
            estimatedDuration: number;
            isPublished: boolean;
            token: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axiosInstance.post(
                '/module/',
                {
                    courseId,
                    title,
                    description,
                    order,
                    estimatedDuration,
                    isPublished,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


export const updateModule = createAsyncThunk(
    'module/updateModule',
    async (
        {
            moduleId,
            courseId,
            title,
            description,
            order,
            estimatedDuration,
            isPublished,
        }: {
            moduleId: string;
            courseId: string;
            title: string;
            description: string;
            order: number;
            estimatedDuration: number;
            isPublished: boolean;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axiosInstance.put(
                `/module/${moduleId}`,
                {
                    courseId,
                    title,
                    description,
                    order,
                    estimatedDuration,
                    isPublished,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


export const getModuleById = createAsyncThunk(
    'module/getModuleById',
    async (
        {
            moduleId,
            token,
        }: {
            moduleId: string;
            token: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axiosInstance.get(`/module/${moduleId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Fetched module data:', response.data);
            return response.data?.data?.module;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const moduleSlice = createSlice({
    name: 'module',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createModule.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createModule.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(createModule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateModule.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateModule.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(updateModule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getModuleById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getModuleById.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(getModuleById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default moduleSlice.reducer;