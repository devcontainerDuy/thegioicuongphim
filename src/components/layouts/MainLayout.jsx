import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "@/components/common/Footer";
import ScrollToTop from "@/components/common/ScrollToTop";

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <ScrollToTop /> 
        </div>
    );
};

export default MainLayout;
