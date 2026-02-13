import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// POST leaderboard settings
export const postLeaderboardSettings = createAsyncThunk(
  "leaderboard/postSettings",
  async (settings: {
    actionXP: Record<string, number>;
    levelRanks: { minXP: number; maxXP: number; levelName: string }[];
  }) => {
    try {
      const res = await axiosInstance.post(
        "/leaderboard/admin/leaderboard/settings",
        settings
      );
      return res.data;
    } catch (error) {
      throw new Error("Failed to update settings");
    }   
  }
);

// GET leaderboard settings
export const getLeaderboardSettings = createAsyncThunk(
    "leaderboard/getSettings",
    async () => {
        try {
            const res = await axiosInstance.get("/leaderboard/admin/leaderboard/settings");
            return res?.data?.settings;
        } catch (error) {
            throw new Error("Failed to fetch settings");
        }   
    }
);

const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState: {
    loading: false,
    error: null,
    settings: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postLeaderboardSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postLeaderboardSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(postLeaderboardSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update settings";
      })
      .addCase(getLeaderboardSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeaderboardSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(getLeaderboardSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch settings";
      });
  },
});

export default leaderboardSlice.reducer;