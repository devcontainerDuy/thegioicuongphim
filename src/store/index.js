import { configureStore } from "@reduxjs/toolkit";
import watchlistSlice from "./reducers/watchlistSlice";

const store = configureStore({
	reducer: {
		watchlist: watchlistSlice,
	},
});

export default store;

