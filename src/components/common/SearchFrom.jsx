import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Image, InputGroup, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { searchFilms } from "services/search";

const SearchForm = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showResults, setShowResults] = useState(false);
    const debounceRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!searchTerm.trim() || searchTerm.trim().length < 2) {
            setFilms([]);
            setShowResults(false);
            setLoading(false);
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
                    setFilms(response.data?.items || []);
                    setShowResults(true);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (films[0]) {
            navigate(`/phim/${films[0].slug}`);
            setShowResults(false);
        } else {
            setShowResults(true);
        }
    };

    const handleSelectFilm = () => {
        setShowResults(false);
        setSearchTerm("");
    };

    return (
        <Form className="search-form" onSubmit={handleSubmit} autoComplete="off">
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
                    {!error && films.length > 0 && (
                        <ul className="list-unstyled mb-0">
                            {films.slice(0, 6).map((film) => (
                                <li key={film.slug}>
                                    <Link to={`/phim/${film.slug}`} className="search-result" onClick={handleSelectFilm}>
                                        <div className="search-result__thumb">{film.thumb_url ? <Image src={film.thumb_url} rounded className="w-100 h-100 object-fit-cover" /> : <Col className="rounded bg-secondary w-100 h-100" />}</div>
                                        <div className="search-result__body">
                                            <h6 className="search-result__title">{film.name}</h6>
                                            <p className="search-result__meta">
                                                {film.current_episode || "Đang cập nhật"} • {film.time || "--"}
                                            </p>
                                        </div>
                                        <i className="bi bi-arrow-up-right" aria-hidden />
                                    </Link>
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
