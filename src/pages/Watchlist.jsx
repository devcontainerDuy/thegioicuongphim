import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Bookmark } from "lucide-react";
import { SavedMoviesLayout } from "@/components/layouts/SavedMoviesLayout";
import { SuggestionsSidebar } from "@/components/shared/SuggestionsSidebar";
import { useFilmsList } from "@/hooks/useFilmsList";
import { fetchWatchlist } from "@/store/reducers/watchlistSlice";
import { useAuth } from "@/contexts/AuthContext";

function Watchlist() {
    const dispatch = useDispatch();
    const { isAuthenticated } = useAuth();
    const { items: watchlistItems, loading } = useSelector((state) => state.watchlist);
    const [viewMode, setViewMode] = React.useState("grid");

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchWatchlist());
        }
    }, [isAuthenticated, dispatch]);

    // Fetch suggested films
    const { items: suggestedFilms, isLoading: loadingSuggestions } = useFilmsList({ 
        endpoint: "phim-moi-cap-nhat" 
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 container mx-auto px-4 md:px-12 pt-24 pb-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
                <SavedMoviesLayout
                    title="Danh Sách Xem Sau"
                    icon={Bookmark}
                    items={watchlistItems}
                    emptyMessage="Chưa có phim nào"
                    emptyDescription="Bạn chưa lưu bộ phim nào để xem sau. Hãy khám phá và lưu lại những phim thú vị nhé!"
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    isLoading={loading && watchlistItems.length === 0}
                />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
                <SuggestionsSidebar 
                    suggestedFilms={suggestedFilms}
                    loading={loadingSuggestions}
                />
            </div>
        </div>
    );
}

export default Watchlist;
