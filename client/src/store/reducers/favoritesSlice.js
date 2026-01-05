import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "@/services/userService";

// Thunks
export const fetchFavorites = createAsyncThunk(
	"favorites/fetch",
	async (_, { rejectWithValue }) => {
		try {
			const data = await userService.getFavorites(1, 100); // Get first 100 for now
			return data.items;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const addFavorite = createAsyncThunk(
	"favorites/add",
	async (film, { rejectWithValue }) => {
		// Always return the film for local state update
		// Backend sync will happen only if authenticated
		try {
			const token = document.cookie.match(/access_token=([^;]+)/)?.[1];
			if (token) {
				await userService.addFavorite(film.id);
			}
		} catch (error) {
			console.warn("Failed to sync favorite to backend:", error);
			// Don't reject - local favorite still works
		}
		return film;
	}
);

export const removeFavorite = createAsyncThunk(
	"favorites/remove",
	async (filmId, { rejectWithValue }) => {
		// Always return the filmId for local state update
		try {
			const token = document.cookie.match(/access_token=([^;]+)/)?.[1];
			if (token) {
				await userService.removeFavorite(filmId);
			}
		} catch (error) {
			console.warn("Failed to remove favorite from backend:", error);
			// Don't reject - local removal still works
		}
		return filmId;
	}
);

const initialState = {
	items: JSON.parse(localStorage.getItem("favorites")) || [],
	loading: false,
	error: null
};

export const favoritesSlice = createSlice({
	name: "favorites",
	initialState,
	reducers: {
		// Keep local actions for non-logged in users or quick UI updates
		addFavoriteLocal: (state, action) => {
			const newFavorite = action.payload;
			if (!state.items.some((film) => film.id === newFavorite.id)) {
				state.items.push(newFavorite);
				localStorage.setItem("favorites", JSON.stringify(state.items));
			}
		},
		removeFavoriteLocal: (state, action) => {
			const id = action.payload;
			state.items = state.items.filter((film) => film.id !== id);
			localStorage.setItem("favorites", JSON.stringify(state.items));
		},
		setFavorites: (state, action) => {
			state.items = action.payload;
			localStorage.setItem("favorites", JSON.stringify(state.items));
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchFavorites.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchFavorites.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
				state.error = null;
				localStorage.setItem("favorites", JSON.stringify(state.items));
			})
			.addCase(fetchFavorites.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			.addCase(addFavorite.fulfilled, (state, action) => {
				const film = action.payload;
				if (!state.items.some((f) => f.id === film.id)) {
					state.items.push(film);
					localStorage.setItem("favorites", JSON.stringify(state.items));
				}
			})
			.addCase(removeFavorite.fulfilled, (state, action) => {
				const id = action.payload;
				state.items = state.items.filter((film) => film.id !== id);
				localStorage.setItem("favorites", JSON.stringify(state.items));
			});
	}
});

export const { addFavoriteLocal, removeFavoriteLocal, setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
