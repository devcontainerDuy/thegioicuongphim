import { useCallback, useEffect, useState } from "react";
import { getFilm } from "services/getFilm";

const filmCache = new Map();

export function useFilmDetail(slug, { enabled = true } = {}) {
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async ({ force = false } = {}) => {
      if (!slug || !enabled) {
        return;
      }

      if (!force && filmCache.has(slug)) {
        setFilm(filmCache.get(slug));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getFilm(slug);
        const movie = response.movie || null;
        setFilm(movie);
        filmCache.set(slug, movie);
      } catch (err) {
        setFilm(null);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [slug, enabled]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    film,
    loading,
    error,
    refetch: (options) => fetchData({ force: true, ...options }),
  };
}
