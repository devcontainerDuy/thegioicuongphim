import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Col, Form, Image, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { searchFilms } from "services/search";

const SearchForm = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const debounceRef = useRef(null);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    const visibleFilms = useMemo(() => films.slice(0, 6), [films]);

    useEffect(() => {
        if (!searchTerm.trim() || searchTerm.trim().length < 2) {
            setFilms([]);
            setShowResults(false);
            setLoading(false);
            setActiveIndex(-1);
            return;
        }

        setLoading(true);
        setError("");

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            searchFilms(searchTerm.trim())
                .then((response) => {
                    const items = response.data?.items || [];
                    setFilms(items);
                    setShowResults(true);
                    setActiveIndex(items.slice(0, 6).length ? 0 : -1);
                })
                .catch((err) => {
                    console.error("Error fetching the films:", err);
                    setError("Không thể tải kết quả. Thử lại sau nhé.");
                    setFilms([]);
                })
                .finally(() => setLoading(false));
        }, 400);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowResults(false);
                setActiveIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (visibleFilms[0]) {
            handleSelectFilm(visibleFilms[0]);
        } else {
            setShowResults(true);
        }
    };

    const handleSelectFilm = (film) => {
        setShowResults(false);
        setSearchTerm("");
        setActiveIndex(-1);
        if (film?.slug) {
            navigate(`/phim/${film.slug}`);
        }
    };

    const handleKeyDown = (event) => {
        if (!showResults || !visibleFilms.length) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((prev) => (prev + 1) % visibleFilms.length);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((prev) => (prev - 1 + visibleFilms.length) % visibleFilms.length);
        } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            handleSelectFilm(visibleFilms[activeIndex]);
        } else if (event.key === "Escape") {
            setShowResults(false);
            setActiveIndex(-1);
        }
    };

    return (
        <Form className="search-form" onSubmit={handleSubmit} autoComplete="off" ref={wrapperRef}>
            <InputGroup className="search-form__group" hasValidation>
                <InputGroup.Text className="search-form__icon" aria-hidden>
                    {loading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-search" />}
                </InputGroup.Text>
                <Form.Control
                    type="search"
                    placeholder="Tìm kiếm phim, diễn viên..."
                    aria-label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => films.length && setShowResults(true)}
                    onKeyDown={handleKeyDown}
                    className="search-form__input"
                />
                <Button type="submit" variant="danger" className="search-form__submit">
                    Enter
                </Button>
            </InputGroup>

            {showResults && (
                <div className="search-results shadow">
                    {error && <div className="search-results__empty text-danger">{error}</div>}
                    {!error && films.length === 0 && !loading && <div className="search-results__empty">Gõ tối thiểu 2 ký tự để tìm phim bạn thích.</div>}
                    {!error && visibleFilms.length > 0 && (
                        <ul className="list-unstyled mb-0">
                            {visibleFilms.map((film, index) => (
                                <li key={film.slug}>
                                    <button
                                        type="button"
                                        className={`search-result ${activeIndex === index ? "search-result--active" : ""}`}
                                        onClick={() => handleSelectFilm(film)}
                                    >
                                        <div className="search-result__thumb">{film.thumb_url ? <Image src={film.thumb_url} rounded className="w-100 h-100 object-fit-cover" /> : <Col className="rounded bg-secondary w-100 h-100" />}</div>
                                        <div className="search-result__body">
                                            <h6 className="search-result__title">{film.name}</h6>
                                            <p className="search-result__meta">
                                                {film.current_episode || "Đang cập nhật"} • {film.time || "--"}
                                            </p>
                                        </div>
                                        <i className="bi bi-arrow-up-right" aria-hidden />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </Form>
    );
};

export default SearchForm;
