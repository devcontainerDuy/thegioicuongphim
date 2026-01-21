import { configureStore } from "@reduxjs/toolkit";
import favoritesSlice from "./reducers/favoritesSlice";
import watchlistSlice from "./reducers/watchlistSlice";

const store = configureStore({
	reducer: {
		favorites: favoritesSlice,
		watchlist: watchlistSlice,
	},
});

export default store;
