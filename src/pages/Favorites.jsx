import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Heart } from "lucide-react";
import { SavedMoviesLayout } from "@/components/layouts/SavedMoviesLayout";
import { SuggestionsSidebar } from "@/components/shared/SuggestionsSidebar";
import { useFilmsList } from "@/hooks/useFilmsList";
import { fetchFavorites } from "@/store/reducers/favoritesSlice";
import { useAuth } from "@/contexts/AuthContext";

function Favorites() {
    const dispatch = useDispatch();
    const { isAuthenticated } = useAuth();
    const favoriteList = useSelector((state) => state.favorites.items);
    const [viewMode, setViewMode] = React.useState("grid");

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchFavorites());
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
                    title="Bộ Sưu Tập Của Tôi"
                    icon={<Heart className="w-6 h-6 md:w-8 md:h-8 text-red-500 fill-red-500 animate-pulse-slow" />}
                    items={favoriteList}
                    emptyMessage="Chưa có phim nào"
                    emptyDescription="Danh sách yêu thích của bạn đang trống. Hãy khám phá và thêm những bộ phim hay vào đây nhé!"
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
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

export default Favorites;
