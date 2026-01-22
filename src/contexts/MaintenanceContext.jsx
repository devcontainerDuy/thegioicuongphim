import React, { createContext, useContext, useState, useEffect } from 'react';
import { backendApiClient } from '../config/apiClient';
import { useLocation, useNavigate } from 'react-router-dom';

const MaintenanceContext = createContext();

export const MaintenanceProvider = ({ children }) => {
    const [maintenance, setMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const checkMaintenanceStatus = async () => {
        try {
            // This endpoint is whitelisted in MaintenanceGuard
            const response = await backendApiClient.get('/status');
            const isMaintenance = response.data.maintenance;
            setMaintenance(isMaintenance);
            return isMaintenance;
        } catch (error) {
            console.error('Failed to check maintenance status', error);
            // If API fails completely, assume no maintenance or let interceptor handle it
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial check
        checkMaintenanceStatus();
    }, []);

    useEffect(() => {
        if (loading) return;

        // Enforce Maintenance Mode
        // Conditions:
        // 1. Maintenance is ON
        // 2. Route is NOT /admin or /bao-tri or /dang-nhap or /dang-ky (maybe?)
        // 3. No bypass token (local logic checked here or rely on API?)
        // Since we want to block UI *rendering*, we should check context state.
        
        // But wait! If I have a bypass token, the API /status might still say maintenance=true
        // But the *other* APIs will work.
        // So we need to know if we are "bypassed".
        
        // Strategy: 
        // If maintenance=true, we redirect to /bao-tri.
        // BUT if user has token, they shouldn't be redirected.
        // How do we know if token is valid? Backend knows. Frontend "guesses" if token exists.
        
        const hasToken = localStorage.getItem('maintenance_token') || document.cookie.includes('maintenance_token');
        const isAdminRoute = location.pathname.startsWith('/admin');
        const isAuthRoute = location.pathname.startsWith('/dang-nhap') || location.pathname.startsWith('/dang-ky');
        const isMaintenancePage = location.pathname === '/bao-tri';

        // Case 1: Maintenance ON -> Redirect to Maintenance Page
        if (maintenance && !hasToken && !isAdminRoute && !isAuthRoute && !isMaintenancePage) {
            navigate('/bao-tri');
        }

        // Case 2: Maintenance OFF -> Redirect AWAY from Maintenance Page
        if (!maintenance && isMaintenancePage) {
             navigate('/');
        }

    }, [maintenance, location.pathname, navigate, loading]);

    // Listen to 503 errors from interceptor (Optional, if we want shared state, 
    // but interceptor does direct redirect which handles cases where polling status is too slow)

    return (
        <MaintenanceContext.Provider value={{ maintenance, checkMaintenanceStatus, loading }}>
            {children}
        </MaintenanceContext.Provider>
    );
};

export const useMaintenance = () => useContext(MaintenanceContext);
