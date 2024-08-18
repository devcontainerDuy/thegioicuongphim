import { configureStore } from "@reduxjs/toolkit";
import favoritesSlice from "./reducers/favoritesSlice";

const store = configureStore({
	reducer: {
		favorites: favoritesSlice,
	},
});

export default store;
