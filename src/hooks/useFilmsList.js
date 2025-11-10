import { useCallback, useEffect, useMemo, useState } from "react";
import { getFilms } from "services/getFilms";

export function useFilmsList({ endpoint, page = 1, enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [paginate, setPaginate] = useState({ current_page: page, total_page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!endpoint || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getFilms(endpoint, page);
      setItems(response.items || []);
      setPaginate(response.paginate || { current_page: page, total_page: 1 });
    } catch (err) {
      setItems([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, enabled]);

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
