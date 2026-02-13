import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../services/axiosConfig';

interface Event {
    _id: string;
    title: string;
    description: string;
    type: 'online' | 'offline' | 'hybrid';
    category: string;
    startDate: string;
    endDate: string;
    venue?: {
        name: string;
        address: string;
        city: string;
        country: string;
    };
    onlineLink?: {
        platform: string;
        url: string;
        meetingId?: string;
        password?: string;
    };
    capacity: number;
    price: number | { $numberDecimal: string };
    currency: string;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    thumbnail?: string;
    isPublic: boolean;
    tags: string[];
}

type EventPayload = FormData;

interface EventState {
    loading: boolean;
    error: string | null;
    data: {
        success: boolean;
        message: string;
        data: {
            data: Event[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    } | null;
}

const initialState: EventState = {
    loading: false,
    error: null,
    data: null,
};

export const createEvent = createAsyncThunk(
    'event/createEvent',
    async (eventData: EventPayload, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                '/events',
                eventData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            }
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);


export const fetchEvents = createAsyncThunk(
    'event/fetchEvents',
    async (
        params: {
            page?: number;
            limit?: number;
            sortBy?: string;
            sortOrder?: 'asc' | 'desc';
            type?: string;
            category?: string;
            search?: string;
            status?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axiosInstance.get('/events', {
                params,
            });
            if (!response.data) {
                throw new Error('No data received from server');
            }
            console.log('Fetched events:', response.data);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const fetchEventById = createAsyncThunk(
    'event/fetchEventById',
    async (eventId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/events/${eventId}`);
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            }
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const updateEvent = createAsyncThunk(
    'event/updateEvent',
    async ({ eventId, eventData }: { eventId: string; eventData: FormData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/events/${eventId}`, eventData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            }
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const deleteEvent = createAsyncThunk(
    'event/deleteEvent',
    async (eventId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/events/${eventId}`);
            console.log('Delete response:', response.data);
           if (response.data.success) {
               setTimeout(() => {
                    window.location.href = "/banner";
                }, 1000);
           }

            return { eventId, ...response.data };
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            }
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

const eventSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchEventById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEventById.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchEventById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEvent.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(updateEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.loading = false;
                if (state.data?.data) {
                    state.data.data.data = state.data.data.data.filter(
                        (event) => event._id !== action.payload.eventId
                    );
                }
            })
            .addCase(deleteEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default eventSlice.reducer;