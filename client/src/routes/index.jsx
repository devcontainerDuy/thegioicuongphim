import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PrivateRoute from "@/components/common/PrivateRoute";
import Home from "@/pages/Home";
import Detail from "@/pages/Detail";
import Watch from "@/pages/Watch";
import Cate from "@/pages/Cate";
import Category from "@/pages/Category";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import Favorites from "@/pages/Favorites";
import Search from "@/pages/Search";
import Profile from "@/pages/Profile";
import SessionManager from "@/pages/SessionManager";
import Pricing from "@/pages/Pricing";
import ErrorPage from "@/pages/errors/Error";
import Maintenance from "@/pages/Maintenance";

// Admin imports
import AdminLayout from "@/admin/AdminLayout";
import Dashboard from "@/admin/pages/Dashboard";
import MovieList from "@/admin/pages/MovieList";
import MovieEdit from "@/admin/pages/MovieEdit";
import UserList from "@/admin/pages/UserList";
import RoleManager from "@/admin/pages/RoleManager";
import Settings from "@/admin/pages/Settings";
import { MaintenanceProvider } from "@/context/MaintenanceContext";
import { Outlet } from "react-router-dom";

// Wrapper to provide Maintenance Context to all routes
const AppWrapper = () => (
    <MaintenanceProvider>
        <Outlet />
    </MaintenanceProvider>
); 

const router = createBrowserRouter([
  // Wrap everything in AppWrapper to check maintenance status
  {
    element: <AppWrapper />,
    children: [
        // Public routes
        {
            path: "/",
            element: <MainLayout />,
            errorElement: <ErrorPage />,
            children: [
      { index: true, element: <Home /> },
      { path: "dang-ky", element: <SignUp /> },
      { path: "dang-nhap", element: <Login /> },
      { path: "bao-tri", element: <Maintenance /> }, // New Route
      { path: "danh-sach-phim", element: <Cate /> },
      { path: "danh-sach-phim/:slug", element: <Category /> },
      { path: "phim/:slug", element: <Detail /> },
      { path: "xem-phim/:slug/:episode", element: <Watch /> },
      { path: "tim-kiem", element: <Search /> },
      { path: "bang-gia", element: <Pricing /> },
      // Protected routes - require authentication
      { path: "danh-sach-yeu-thich", element: <PrivateRoute><Favorites /></PrivateRoute> },
      { path: "ca-nhan", element: <PrivateRoute><Profile /></PrivateRoute> },
      { path: "quan-ly-phien", element: <PrivateRoute><SessionManager /></PrivateRoute> },
      { path: "*", element: <ErrorPage /> },
    ],
  },
  
  // Admin routes
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "movies", element: <MovieList /> },
      { path: "movies/new", element: <MovieEdit /> },
      { path: "movies/:id", element: <MovieEdit /> },
      { path: "users", element: <UserList /> },
      { path: "roles", element: <RoleManager /> },
      { path: "settings", element: <Settings /> },
    ],
  },
    ],
  },
]);

export default router;

