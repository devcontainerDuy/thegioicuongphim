import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Bookmark } from "lucide-react";
import { SavedMoviesLayout } from "@/components/layouts/SavedMoviesLayout";
import { SuggestionsSidebar } from "@/components/shared/SuggestionsSidebar";
import { useFilmsList } from "@/hooks/useFilmsList";
import { fetchWatchlist } from "@/store/reducers/watchlistSlice";
import { useAuth } from "@/contexts/AuthContext";

const Favorites = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const watchlist = useSelector((state) => state.watchlist.items);
  const loading = useSelector((state) => state.watchlist.loading);
  const { films: suggestions, loading: suggestionsLoading } = useFilmsList(1, 6);

  useEffect(() => {
    // Fetch from backend if authenticated
    if (isAuthenticated) {
      dispatch(fetchWatchlist());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <SavedMoviesLayout
              title="Danh Sách Của Tôi"
              icon={Bookmark}
              items={watchlist}
              emptyMessage="Chưa có phim nào trong danh sách"
              emptyDescription="Khám phá và lưu những bộ phim bạn muốn xem"
              isLoading={loading}
            />
          </div>

          <SuggestionsSidebar
            suggestions={suggestions}
            loading={suggestionsLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Favorites;
