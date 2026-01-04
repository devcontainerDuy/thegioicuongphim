import { Analytics } from "@vercel/analytics/react";
import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import router from "@/routes";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import SyncWatcher from "@/components/shared/SyncWatcher";

// Optional: Global loading fallback
const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

function App() {
    return (
        <React.StrictMode>
            <AuthProvider>
                <SyncWatcher />
                <Analytics debug={false} mode="production" />
                <Suspense fallback={<LoadingFallback />}>
                    <RouterProvider router={router} />
                </Suspense>
                <Toaster />
            </AuthProvider>
        </React.StrictMode>
    );
}

export default App;

