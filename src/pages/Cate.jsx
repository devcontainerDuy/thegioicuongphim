/* eslint-disable */
import React, { Fragment, useEffect, useState } from "react";
import { Col, Collapse, Container, Nav, Row } from "react-bootstrap";
import Pagi from "containers/Pagi";
import Template from "components/layout/Template";
import Breadcrumbs from "containers/Breadcrumbs";
import Cards from "containers/Cards";
import { categories } from "utils/categories";
import NavLink from "components/ui/NavLink";
import { getFilms } from "services/getFilms";
import { useSearchParams } from "react-router-dom";
import { useIsActive } from "lib/navigation";

function Cate() {
  const [open, setOpen] = useState({});
  const [films, setFilms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || categories[0].slug;
  const sub = searchParams.get("sub") || "";
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    setLoading(true);
    getFilms(`${category}${sub ? "/" + sub : ""}`, page).then((res) => {
      setFilms(res.items);
      setCurrentPage(res.paginate.current_page);
      setTotalPage(res.paginate.total_page);
      setLoading(false);
    });
  }, [category, sub, page]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSearchParams({ category, sub, page: pageNumber });
  };

  const toggleCollapse = (index) => {
    setOpen((prevOpen) => ({ ...prevOpen, [index]: !prevOpen[index] }));
  };

  return (
    <>
      <Template>
        <section className="pt-5">
          <Container as={"aside"} className="pt-4 pb-2">
            <Breadcrumbs props={[{ name: "Danh sách phim", url: "/danh-sach-phim" }]} />
          </Container>
        </section>
        <Container as={"section"} className="pb-4">
          <Row className="g-4">
            <Col xs={12} md={4} lg={3}>
              <div className="position-sticky" style={{ top: "6rem" }}>
                <div className="p-4 my-3 bg-body-tertiary rounded">
                  <aside className="my-2">
                    <div id="offcanvasCategory" className="offcanvas-collapse w-md-50 ">
                      <div className="ps-lg-2 pt-lg-0 d-flex flex-column offcanvas-body">
                        <div className="mb-3">
                          <h5 className="fst-italic">Thể loại phim</h5>
                          <ul id="categoryCollapseMenu" className="nav nav-category">
                            <div className="border-bottom w-100">
                              {categories.map((item, i) => (
                                <Fragment key={i}>
                                  {item.item.length > 0 ? (
                                    <>
                                      <Nav.Link
                                        className="text-decoration-none d-flex justify-content-between text-body"
                                        aria-expanded={open[i] || false}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => toggleCollapse(i)}
                                        aria-controls={`categoryFlush${i}`}
                                      >
                                        <p className="mb-0">{item.name}</p>
                                        <i className={`bi bi-chevron-${open[i] ? "up" : "down"}`} width="12" height="12"></i>
                                      </Nav.Link>
                                      <Collapse in={open[i] || false} id={`categoryFlush${i}`} className="accordion-collapse collapse" aria-labelledby="flush-heading0">
                                        <Nav className="flex-column ms-3 " id={`categoryFlush${i}`} role="tabpanel" aria-labelledby="flush-heading0">
                                          {item.item.map((sub, j) => (
                                            <Nav.Item key={j}>
                                              <NavLink to={`/danh-sach-phim?category=${item.slug}&sub=${sub.slug}&page=${currentPage}`} className="d-flex justify-content-between text-body">
                                                <span className="mb-0">{sub.name}</span>
                                              </NavLink>
                                            </Nav.Item>
                                          ))}
                                        </Nav>
                                      </Collapse>
                                    </>
                                  ) : (
                                    <NavLink
                                      to={`/danh-sach-phim?category=${item.slug}&page=${currentPage}`}
                                      className="text-decoration-none d-flex justify-content-between text-body"
                                      active={useIsActive("/danh-sach-phim" + (item.slug === category ? "" : `?category=${item.slug}`) + (page === 1 ? "" : `&page=${page}`))}
                                    >
                                      <span className="mb-0">{item.name}</span>
                                    </NavLink>
                                  )}
                                </Fragment>
                              ))}
                            </div>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </Col>
            <Col xs={12} md={8} lg={9}>
              <h3 className="py-2 text-danger border-bottom border-danger">Danh sách phim</h3>

              <Row xs={2} sm={2} md={2} lg={4} xl={4} className="row-hover g-2">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <Cards key={i} loading={true} />)
                ) : films.length > 0 ? (
                  films.map((p, i) => <Cards key={i} name={p.name} slug={p.slug} image={p.thumb_url} totalEpisodes={p.total_episodes} currentEpisode={p.current_episode} time={p.time} />)
                ) : (
                  <p className="text-danger">Không có phim nào được tìm thấy.</p>
                )}
              </Row>

              <Pagi current={currentPage} total={totalPage} handle={handlePageChange} />
            </Col>
          </Row>
        </Container>
      </Template>
    </>
  );
}

export default Cate;
