import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import movieService from "@/services/movieService";
import { getAccessToken } from "@/utils/cookies";

// Thunks
export const fetchWatchlist = createAsyncThunk(
    "watchlist/fetch",
    async (_, { rejectWithValue }) => {
        try {
            return await movieService.getWatchlist();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const toggleWatchlist = createAsyncThunk(
    "watchlist/toggle",
    async (movie, { rejectWithValue }) => {
        try {
            const token = getAccessToken();
            if (token) {
                // User is logged in, sync with backend
                const response = await movieService.toggleWatchlist(movie.id);
                return { movie, added: response.added };
            } else {
                // Guest user, toggle in localStorage only
                const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
                const exists = watchlist.some(f => f.id === movie.id);
                return { movie, added: !exists };
            }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    items: JSON.parse(localStorage.getItem("watchlist")) || [],
    loading: false,
    error: null
};

export const watchlistSlice = createSlice({
    name: "watchlist",
    initialState,
    reducers: {
        setWatchlist: (state, action) => {
            state.items = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWatchlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWatchlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.error = null;
                localStorage.setItem("watchlist", JSON.stringify(state.items));
            })
            .addCase(fetchWatchlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(toggleWatchlist.fulfilled, (state, action) => {
                const { movie, added } = action.payload;
                if (added) {
                    if (!state.items.some(f => f.id === movie.id)) {
                        state.items.unshift(movie);
                    }
                } else {
                    state.items = state.items.filter(f => f.id !== movie.id);
                }
                localStorage.setItem("watchlist", JSON.stringify(state.items));
            });
    }
});

export const { setWatchlist } = watchlistSlice.actions;
export default watchlistSlice.reducer;
