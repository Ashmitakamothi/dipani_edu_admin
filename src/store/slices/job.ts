import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosConfig';

interface JobPayload {
    title: string;
    description: string;
    budget: {
        min: number;
        max: number;
        currency: string;
    };
    category: string;
    skillsRequired: string[];
    experienceLevel: string;
    estimatedDuration: {
        value: number;
        unit: string;
    };
    mode: string;
    location: {
        type: string;
        address: string;
    };
    status?: boolean;
    thumbnail?: File;
}

interface ProposalUser {
    _id: string;
    fullName: string;
    email: string;
    profilePicture: string;
}

interface Proposal {
    _id: string;
    userId: ProposalUser;
    coverLetter: string;
    cv: string;
    proposedAmount: number;
    status: 'pending' | 'accepted' | 'rejected';
    submittedAt: string;
}

export interface JobResponse {
    _id: string;
    title: string;
    description: string;
    budget: {
        min: number;
        max: number;
        currency: string;
    };
    category: string;
    skillsRequired: string[];
    experienceLevel: string;
    estimatedDuration: {
        value: number;
        unit: string;
    };
    mode: string;
    location: {
        type: string;
        address: string | {
            street?: string;
        };
    };
    status: boolean;
    thumbnail?: string;
    createdAt: string;
    updatedAt?: string;
    proposals?: Proposal[];
    createdBy?: {
        _id: string;
        fullName: string;
        email: string;
    };
    isAdminApproved?: boolean; // <-- Add this line
}

export interface JobState {
    loading: boolean;
    error: string | null;
    job: JobPayload | null;
    jobs: JobResponse[];
    totalJobs: number;
    currentPage: number;
    totalPages: number;
}

const initialState: JobState = {
    loading: false,
    error: null,
    job: null,
    jobs: [],
    totalJobs: 0,
    currentPage: 1,
    totalPages: 0,
};

export const createJob = createAsyncThunk(
    'job/createJob',
    async (
        { job, token }: { job: JobPayload; token: string },
        { rejectWithValue }
    ) => {
        try {
            const formData = new FormData();
            
            // Handle nested objects by flattening into separate fields
            if (job.budget) {
                formData.append('budget[min]', job.budget.min.toString());
                formData.append('budget[max]', job.budget.max.toString());
                formData.append('budget[currency]', job.budget.currency);
            }
            if (job.estimatedDuration) {
                formData.append('estimatedDuration[value]', job.estimatedDuration.value.toString());
                formData.append('estimatedDuration[unit]', job.estimatedDuration.unit);
            }
            if (job.location) {
                formData.append('location[type]', job.location.type);
                formData.append('location[address]', job.location.address);
            }
            
            // Handle simple properties
            const simpleFields = ['title', 'description', 'category', 'experienceLevel', 'mode', 'status'];
            simpleFields.forEach(field => {
                if (job[field as keyof typeof job] !== undefined && job[field as keyof typeof job] !== null) {
                    formData.append(field, job[field as keyof typeof job] as string);
                }
            });
            
            // Handle arrays
            if (job.skillsRequired && Array.isArray(job.skillsRequired)) {
                formData.append('skillsRequired', JSON.stringify(job.skillsRequired));
            }
            
            // Handle file
            if (job.thumbnail && job.thumbnail instanceof File) {
                formData.append('thumbnail', job.thumbnail);
            }

            const response = await axiosInstance.post(
                '/jobs',
                formData,
                {
                    headers: {
                        "content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("Create job response:", response.data);
            return response.data;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

export const fetchJobs = createAsyncThunk(
    'job/fetchJobs',
    async (
        { 
            page = 1, 
            limit = 10, 
            category, 
            minBudget, 
            maxBudget, 
            experienceLevel, 
            search 
        }: { 
            page?: number; 
            limit?: number; 
            category?: string; 
            minBudget?: number; 
            maxBudget?: number; 
            experienceLevel?: string; 
            search?: string; 
        },
        { rejectWithValue }
    ) => {
        try {
            const params = new URLSearchParams();
            if (page) params.append('page', page.toString());
            if (limit) params.append('limit', limit.toString());
            if (category) params.append('category', category);
            if (minBudget) params.append('minBudget', minBudget.toString());
            if (maxBudget) params.append('maxBudget', maxBudget.toString());
            if (experienceLevel) params.append('experienceLevel', experienceLevel);
            if (search) params.append('search', search);


            const response = await axiosInstance.get(`/jobs?${params.toString()}`);
            console.log("Fetched jobs response:", response.data);

            return {
                jobs: response.data.data?.data || [],
                totalJobs: response.data.data.total || 0,
                currentPage: response.data.data.page || 1,
                totalPages: response.data.data.totalPages || 1
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateJob = createAsyncThunk(
    'job/updateJob',
    async (
        { jobId, jobData, token }: { jobId: string; jobData: Partial<JobPayload>; token: string },
        { rejectWithValue }
    ) => {
        try {
            console.log('updateJob called with jobData:', jobData);
            const formData = new FormData();

            // Handle nested objects by flattening into separate fields
            if (jobData.budget) {
                formData.append('budget[min]', jobData.budget.min.toString());
                formData.append('budget[max]', jobData.budget.max.toString());
                formData.append('budget[currency]', jobData.budget.currency);
            }
            if (jobData.estimatedDuration) {
                formData.append('estimatedDuration[value]', jobData.estimatedDuration.value.toString());
                formData.append('estimatedDuration[unit]', jobData.estimatedDuration.unit);
            }
            if (jobData.location) {
                formData.append('location[type]', jobData.location.type);
                formData.append('location[address]', jobData.location.address);
            }

            // Handle simple properties
            const simpleFields = ['title', 'description', 'category', 'experienceLevel', 'mode', 'status'];
            simpleFields.forEach(field => {
                if (jobData[field as keyof typeof jobData] !== undefined && jobData[field as keyof typeof jobData] !== null) {
                    formData.append(field, jobData[field as keyof typeof jobData] as string);
                }
            });

            // Handle arrays
            if (jobData.skillsRequired && Array.isArray(jobData.skillsRequired)) {
                formData.append('skillsRequired', JSON.stringify(jobData.skillsRequired));
            }

            // Handle file
            console.log('jobData.thumbnail:', jobData.thumbnail);
            if (jobData.thumbnail && jobData.thumbnail instanceof File) {
                console.log('appending thumbnail file:', jobData.thumbnail.fileName);
                formData.append('thumbnail', jobData.thumbnail);
            }

            // Debug: Log FormData contents
            console.log('FormData entries:');
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            const response = await axiosInstance.put(
                `/jobs/${jobId}`,
                formData,
                {
                    headers: {
                        "content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

export const deleteJob = createAsyncThunk(
    'job/deleteJob',
    async (
        { jobId, token }: { jobId: string; token: string },
        { rejectWithValue }
    ) => {
        try {
            await axiosInstance.delete(`/jobs/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return jobId;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateJobStatus = createAsyncThunk(
    'job/updateJobStatus',
    async (
        { jobId, status }: { jobId: string; status: boolean },
        { rejectWithValue }
    ) => {
        try {
            // Convert boolean status to 'open'/'closed' string format expected by the API
            const statusValue = status ? 'open' : 'closed';
            
            const response = await axiosInstance.patch(
                `/jobs/${jobId}/status`,
                { status: statusValue },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return { ...response.data, _id: jobId, status };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

export const approveJobByAdmin = createAsyncThunk(
  'job/approveJobByAdmin',
  async (
    { jobId, isAdminApproved, token }: { jobId: string; isAdminApproved: boolean; token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/jobs/${jobId}/admin-approval`,
        { isAdminApproved },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return { jobId, isAdminApproved, ...response.data };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error.message || "Failed to approve job"
      );
    }
  }
);

export const jobSlice = createSlice({
    name: 'job',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createJob.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.job = null;
            })
            .addCase(createJob.fulfilled, (state, action) => {
                state.loading = false;
                state.job = action.payload;
            })
            .addCase(createJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchJobs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.jobs = action.payload.jobs || [];
                state.totalJobs = action.payload.totalJobs || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 0;
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.jobs = [];
            })
            .addCase(updateJob.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateJob.fulfilled, (state, action) => {
                state.loading = false;
                // Update the job in the jobs array
                const updatedJob = action.payload;
                const index = state.jobs.findIndex(job => job._id === updatedJob._id);
                if (index !== -1) {
                    state.jobs[index] = updatedJob;
                }
            })
            .addCase(updateJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteJob.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteJob.fulfilled, (state, action) => {
                state.loading = false;
                // Remove the job from the jobs array
                state.jobs = state.jobs.filter(job => job._id !== action.payload);
                state.totalJobs = Math.max(0, state.totalJobs - 1);
            })
            .addCase(deleteJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateJobStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateJobStatus.fulfilled, (state, action) => {
                state.loading = false;
                // Update the job status in the jobs array
                const { _id, status } = action.payload;
                const index = state.jobs.findIndex(job => job._id === _id);
                if (index !== -1) {
                    state.jobs[index].status = status;
                }
            })
            .addCase(updateJobStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(approveJobByAdmin.fulfilled, (state, action) => {
                // Update the job in the jobs array if present
                const idx = state.jobs.findIndex(job => job._id === action.payload.jobId);
                if (idx !== -1) {
                    state.jobs[idx] = {
                        ...state.jobs[idx],
                        isAdminApproved: action.payload.isAdminApproved,
                    };
                }
                // Optionally update the single job if loaded
                if (state.job && state.job._id === action.payload.jobId) {
                    state.job = {
                        ...state.job,
                        isAdminApproved: action.payload.isAdminApproved,
                    };
                }
            })
            .addCase(approveJobByAdmin.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const selectJobState = (state: { job: JobState }) => state.job;
export const selectJobLoading = (state: { job: JobState }) => state.job.loading;
export const selectJobError = (state: { job: JobState }) => state.job.error;
export const selectJob = (state: { job: JobState }) => state.job.job;
export const selectJobs = (state: { job: JobState }) => state.job.jobs;
export const selectTotalJobs = (state: { job: JobState }) => state.job.totalJobs;
export const selectCurrentPage = (state: { job: JobState }) => state.job.currentPage;
export const selectTotalPages = (state: { job: JobState }) => state.job.totalPages;

export default jobSlice.reducer;