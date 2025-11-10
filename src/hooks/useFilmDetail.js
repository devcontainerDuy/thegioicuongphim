import { useCallback, useEffect, useState } from "react";
import { getFilm } from "services/getFilm";

export function useFilmDetail(slug, { enabled = true } = {}) {
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!slug || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getFilm(slug);
      setFilm(response.movie || null);
    } catch (err) {
      setFilm(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [slug, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    film,
    loading,
    error,
    refetch: fetchData,
  };
}
