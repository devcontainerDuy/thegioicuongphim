import { useCallback, useEffect, useMemo, useState } from "react";
import movieService from "@/services/movieService";

export function useFilmsList({ endpoint, page = 1, enabled = true, isInfinite = false } = {}) {
  const [items, setItems] = useState([]);
  const [paginate, setPaginate] = useState({ current_page: page, total_page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset items when endpoint changes (important for switching categories)
  useEffect(() => {
    if (isInfinite) {
      setItems([]);
    }
  }, [endpoint, isInfinite]);

  const fetchData = useCallback(async () => {
    if (!endpoint || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await movieService.getFilms(endpoint, page);

      setItems(prevItems => {
        // If infinite scroll, append. 
        // NOTE: If page is 1, strictly replace (reset) to avoid duplication logic issues on category switch
        if (isInfinite && page > 1) {
          // Basic de-duplication could be added here if needed, but endpoint reliance is usually enough
          return [...prevItems, ...(response.items || [])];
        }
        return response.items || [];
      });

      setPaginate(response.paginate || { current_page: page, total_page: 1 });
    } catch (err) {
      if (!isInfinite || page === 1) setItems([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, enabled, isInfinite]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const meta = useMemo(
    () => ({
      currentPage: paginate.current_page || page,
      totalPage: paginate.total_page || 1,
    }),
    [paginate, page]
  );

  return {
    items,
    paginate,
    loading,
    error,
    refetch: fetchData,
    meta,
  };
}
