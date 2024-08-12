import * as React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Error from "./pages/errors/Error";
import Cate from "./pages/Cate";
import Detail from "./pages/Detail";
import Watch from "./pages/Watch";
import Category from "./pages/Category";

function App() {
	return (
		<BrowserRouter className="App" basename="/">
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/danh-sach-phim" element={<Cate />} />
				<Route path="/danh-sach-phim/:slug" element={<Category />} />
				<Route path="/phim/:slug" element={<Detail />} />
				<Route path="/xem-phim/:slug/:episode" element={<Watch />} />
				<Route path="*" element={<Error />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
