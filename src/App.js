import { Analytics } from "@vercel/analytics/react";
import React, { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "@/routes";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import SyncWatcher from "@/components/shared/SyncWatcher";
import { migrateFavoritesToWatchlist, cleanupOldBackup } from "@/utils/migrateStorage";

import { HelmetProvider } from "react-helmet-async";

// Optional: Global loading fallback
const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

function App() {
    // Run localStorage migration on first load
    useEffect(() => {
        const result = migrateFavoritesToWatchlist();
        if (result.migrated && result.count > 0) {
            console.log(`🔄 Favorites migration completed: ${result.count} items`);
        }
        cleanupOldBackup();
    }, []);

    return (
        <React.StrictMode>
            <AuthProvider>
                <HelmetProvider>
                    <SyncWatcher />
                    <Analytics debug={false} mode="production" />
                    <Suspense fallback={<LoadingFallback />}>
                        <RouterProvider router={router} />
                    </Suspense>
                    <Toaster />
                </HelmetProvider>
            </AuthProvider>
        </React.StrictMode>
    );
}

export default App;

