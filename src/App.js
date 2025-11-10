import { Analytics } from "@vercel/analytics/react";
import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import "./css/App.css";

const Home = lazy(() => import("./pages/Home"));
const Cate = lazy(() => import("./pages/Cate"));
const Detail = lazy(() => import("./pages/Detail"));
const Watch = lazy(() => import("./pages/Watch"));
const Category = lazy(() => import("./pages/Category"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Favorites = lazy(() => import("./pages/Favorites"));
const ErrorPage = lazy(() => import("./pages/errors/Error"));

function App() {
    return (
        <>
            <Analytics debug={false} mode="production" />
            <Suspense fallback={<div className="py-5 text-center">Đang tải...</div>}>
                <Routes>
                    <Route path="/dang-ky" element={<SignUp />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/danh-sach-phim" element={<Cate />} />
                    <Route path="/danh-sach-phim/:slug" element={<Category />} />
                    <Route path="/phim/:slug" element={<Detail />} />
                    <Route path="/xem-phim/:slug/:episode" element={<Watch />} />
                    <Route path="/danh-sach-yeu-thich" element={<Favorites />} />
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </Suspense>
        </>
    );
}

export default App;
