import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Home from "@/pages/Home";
import Detail from "@/pages/Detail";
import Watch from "@/pages/Watch";
import Cate from "@/pages/Cate";
import Category from "@/pages/Category";
import SignUp from "@/pages/SignUp";
import Favorites from "@/pages/Favorites";
import Search from "@/pages/Search";
import Profile from "@/pages/Profile";
import ErrorPage from "@/pages/errors/Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "dang-ky", element: <SignUp /> },
      { path: "danh-sach-phim", element: <Cate /> },
      { path: "danh-sach-phim/:slug", element: <Category /> },
      { path: "phim/:slug", element: <Detail /> },
      { path: "xem-phim/:slug/:episode", element: <Watch /> },
      { path: "tim-kiem", element: <Search /> },
      { path: "danh-sach-yeu-thich", element: <Favorites /> },
      { path: "ca-nhan", element: <Profile /> },
    ],
  },
]);

export default router;
