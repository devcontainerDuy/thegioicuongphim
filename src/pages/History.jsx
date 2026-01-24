import React, { useState, useEffect } from "react";
import userService from "@/services/userService";
import MovieListingLayout from "@/components/layouts/MovieListingLayout";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

function History() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState("grid");

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                // limit=24 to match other grids
                const data = await userService.getWatchHistory(page, 24);
                setItems(data.items || []);
                setTotalPages(data.meta?.totalPages || 1);
            } catch (err) {
                console.error("Failed to fetch history:", err);
                setError(err);
                toast.error("Không thể tải lịch sử xem");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
        window.scrollTo(0, 0);
    }, [page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // Transform history items to match MovieCard expected props
    // History API usually returns { movie: {...}, episode: {...}, ... }
    // We need to flatten it for MovieCard or pass movie object
    const displayItems = items.map(item => ({
        ...item.movie,
        // Override properties if needed, e.g. using episode info?
        // For now just showing movie info is fine.
        // Maybe append episode info to name?
        name: `${item.movie?.name} - ${item.episode?.name || ''}`,
    }));

    return (
        <>
            <Helmet>
                <title>Lịch Sử Xem Phim | Thế Giới Cuồng Phim</title>
            </Helmet>
            <MovieListingLayout
                title="Lịch Sử Xem"
                description="Danh sách các phim bạn đã xem gần đây"
                items={displayItems}
                loading={loading}
                error={error}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                currentPage={page}
                totalPage={totalPages}
                onPageChange={handlePageChange}
                showSidebar={false} // History page doesn't need category sidebar
                emptyMessage="Bạn chưa xem phim nào."
            />
        </>
    );
}

export default History;
