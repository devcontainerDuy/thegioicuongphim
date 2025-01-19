import React, { useEffect, useState } from "react";
import Nav from "containers/Nav";
import Template from "components/layout/Template";
import { getFilms } from "services/getFilms";
import { categories } from "utils/categories";
import Cards from "containers/Cards";
import { Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);
  const [vietnam, setVietnam] = useState([]);

  useEffect(() => {
    getFilms(categories[0].slug).then((res) => setProducts(res));
    getFilms(categories[3].slug + "/" + categories[3].item[4].slug).then((res) => setVietnam(res));
  }, []);

  return (
    <>
      <Template>
        <Nav />

        <Container as={"section"} className="py-3">
          <div className="py-2 mb-3 d-flex justify-content-between align-items-between border-bottom border-danger">
            <h3 className="m-0 text-danger fw-bold">
              <span>Phim mới cập nhật</span>
            </h3>
            <Link to="/danh-sach-phim" className="m-0 fs-5 text-danger">
              <span>Xem thêm</span>
              <i className="bi bi-chevron-double-right fs-6" />
            </Link>
          </div>
          <Row xs={2} sm={3} md={4} lg={5} className="row-hover g-2">
            {products.length > 0 ? (
              products.map((p, i) => <Cards key={i} name={p.name} slug={p.slug} image={p.thumb_url} totalEpisodes={p.total_episodes} currentEpisode={p.current_episode} time={p.time} />)
            ) : (
              <p className="text-danger">Không có phim nào được tìm thấy.</p>
            )}
          </Row>
        </Container>
        <Container as={"section"} className="py-3">
          <div className="py-2 mb-3 d-flex justify-content-between align-items-between border-bottom border-danger">
            <h3 className="m-0 text-danger fw-bold">
              <span>Phim Việt Nam</span>
            </h3>
            <Link to="/danh-sach-phim" className="m-0 fs-5 text-danger">
              <span>Xem thêm</span>
              <i className="bi bi-chevron-double-right fs-6" />
            </Link>
          </div>
          <Row xs={2} sm={3} md={4} lg={5} className="row-hover g-2">
            {vietnam.length > 0 ? (
              vietnam.map((p, i) => <Cards key={i} name={p.name} slug={p.slug} image={p.thumb_url} totalEpisodes={p.total_episodes} currentEpisode={p.current_episode} time={p.time} />)
            ) : (
              <p>Không có phim nào được tìm thấy.</p>
            )}
          </Row>
        </Container>
      </Template>
    </>
  );
}

export default Home;
