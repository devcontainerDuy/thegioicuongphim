import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	items: JSON.parse(localStorage.getItem("favorites")) || [],
};

export const favoritesSlice = createSlice({
	name: "favorites",
	initialState,
	reducers: {
		addFavorite: (state, action) => {
			const newFavorite = action.payload;
			if (!state.items.some((film) => film.id === newFavorite.id)) {
				state.items.push(newFavorite);
				localStorage.setItem("favorites", JSON.stringify(state.items));
			}
		},
		removeFavorite: (state, action) => {
			const id = action.payload;
			state.items = state.items.filter((film) => film.id !== id);
			localStorage.setItem("favorites", JSON.stringify(state.items));
		},
	},
});

export const { addFavorite, removeFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
