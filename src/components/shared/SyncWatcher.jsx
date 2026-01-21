import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/contexts/AuthContext';
import { fetchFavorites } from '@/store/reducers/favoritesSlice';

/**
 * SyncWatcher Component
 * - Lắng nghe trạng thái đăng nhập
 * - Khi user đăng nhập thành công, tự động fetch favorites từ cloud
 */
const SyncWatcher = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            console.log('User authenticated, syncing data...');
            dispatch(fetchFavorites());
        }
    }, [isAuthenticated, loading, dispatch]);

    return null; // Component này không render gì cả
};

export default SyncWatcher;
