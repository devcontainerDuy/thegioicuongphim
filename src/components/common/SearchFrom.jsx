import Dropdowns from "components/ui/Dropdowns";
import React, { useState } from "react";
import { Form, InputGroup, Image, Col } from "react-bootstrap";
import { searchFilms } from "services/search";

const SearchForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [films, setFilms] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    searchFilms(searchTerm)
      .then((response) => {
        setFilms(response.data.items);
      })
      .catch((error) => {
        console.error("Error fetching the films:", error);
      });
  };

  return (
    <Form className="d-flex" onSubmit={handleSubmit}>
      <InputGroup aria-label="Tìm kiếm">
        <Form.Control type="search" placeholder="Tìm kiếm phim..." aria-label="Search" list="films" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <datalist id="films">
          <option value="Nhà bà nữ"></option>
          <option value="Black Adam"></option>
          <option value="Kẻ Trộm Mặt Trăng 4"></option>
          <option value="Re:Zero kara Hajimeru Isekai Seikatsu 3rd Season"></option>
        </datalist>

        <Dropdowns className="dropdown-custom" variant="danger" type="submit" align="start" trigger={<i className="bi bi-search" />}>
          {films.length > 0 ? (
            films.map((film) => (
              <Dropdowns.Item key={film.slug} href={`/phim/${film.slug}`}>
                <div className="d-flex flex-grow-1">
                  <div className="me-2">
                    {film.thumb_url ? (
                      <Image src={film.thumb_url} className="rounded" style={{ width: "80px", height: "120px" }} />
                    ) : (
                      <Col className="rounded bg-secondary" style={{ width: "80px", height: "120px" }} />
                    )}
                  </div>
                  <div className="d-flex flex-column">
                    <h6 className="fw-bold text-truncate">{film.name}</h6>
                    <span className="text-truncate">{new Date(film.created).toLocaleDateString()}</span>
                    <p className="text-truncate">{film.current_episode}</p>
                  </div>
                </div>
              </Dropdowns.Item>
            ))
          ) : (
            <Dropdowns.Item disabled>Không có kết quả trùng khớp</Dropdowns.Item>
          )}
        </Dropdowns>
      </InputGroup>
    </Form>
  );
};

export default SearchForm;
