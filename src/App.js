import * as React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Error from "./pages/errors/Error";
import Cate from "./pages/Cate";
import Detail from "./pages/Detail";
import Watch from "./pages/Watch";
import Category from "./pages/Category";
import "./css/App.css";
import SignUp from "./pages/SignUp";
import Favorites from "./pages/Favorites";

function App() {
  return (
    <Routes>
      <Route path="/dang-ky" element={<SignUp />} />
      <Route path="/" element={<Home />} />
      <Route path="/danh-sach-phim" element={<Cate />} />
      <Route path="/danh-sach-phim/:slug" element={<Category />} />
      <Route path="/phim/:slug" element={<Detail />} />
      <Route path="/xem-phim/:slug/:episode" element={<Watch />} />
      <Route path="/danh-sach-yeu-thich" element={<Favorites />} />
      <Route path="*" element={<Error />} />
    </Routes>
  );
}

export default App;
