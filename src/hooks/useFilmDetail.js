import { useCallback, useEffect, useRef, useState } from "react";
import movieService from "@/services/movieService";

const filmCache = new Map();

export function useFilmDetail(slug, { enabled = true } = {}) {
    const [film, setFilm] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const inFlightRef = useRef(new Set());

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

            if (!force && inFlightRef.current.has(slug)) {
                return;
            }

            inFlightRef.current.add(slug);
            setLoading(true);
            setError(null);

            try {
                const response = await movieService.getFilmDetail(slug);
                const movie = response.movie || null;
                setFilm(movie);
                filmCache.set(slug, movie);
            } catch (err) {
                setFilm(null);
                setError(err);
            } finally {
                inFlightRef.current.delete(slug);
                setLoading(false);
            }
        },
        [slug, enabled]
    );

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback((options) => fetchData({ force: true, ...options }), [fetchData]);

    return {
        film,
        loading,
        error,
        refetch,
    };
}

export function __clearFilmCache() {
    filmCache.clear();
}
