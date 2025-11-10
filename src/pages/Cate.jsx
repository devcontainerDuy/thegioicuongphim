import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Badge, Button, Col, Container, Form, Row } from "react-bootstrap";
import Pagi from "containers/Pagi";
import Template from "components/layout/Template";
import Breadcrumbs from "containers/Breadcrumbs";
import Cards from "containers/Cards";
import { categories } from "utils/categories";
import { getFilms } from "services/getFilms";
import { useSearchParams } from "react-router-dom";

const SORT_OPTIONS = [
  { value: "recent", label: "Mới cập nhật" },
  { value: "name", label: "Tên (A-Z)" },
  { value: "episodes", label: "Số tập nhiều" },
];

function Cate() {
  const [films, setFilms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [sortOption, setSortOption] = useState("recent");

  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || categories[0].slug;
  const sub = searchParams.get("sub") || "";
  const page = Number(searchParams.get("page")) || 1;

  const selectedCategory = useMemo(() => categories.find((item) => item.slug === category) || categories[0], [category]);
  const selectedSub = useMemo(() => selectedCategory?.item?.find((item) => item.slug === sub), [selectedCategory, sub]);

  useEffect(() => {
    setLoading(true);
    setHasError(false);

    getFilms(`${category}${sub ? "/" + sub : ""}`, page)
      .then((res) => {
        setFilms(res.items || []);
        setCurrentPage(res.paginate.current_page);
        setTotalPage(res.paginate.total_page);
      })
      .catch((error) => {
        console.error("Không thể tải danh sách phim:", error);
        setFilms([]);
        setHasError(true);
      })
      .finally(() => setLoading(false));
  }, [category, sub, page]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const params = { category, page: pageNumber };
    if (sub) {
      params.sub = sub;
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (slug) => {
    setCurrentPage(1);
    const targetCategory = categories.find((item) => item.slug === slug);
    const firstSub = targetCategory?.item?.[0]?.slug;
    const params = { category: slug, page: 1 };
    if (firstSub) {
      params.sub = firstSub;
    }
    setSearchParams(params);
  };

  const handleSubChange = (parentSlug, childSlug) => {
    setCurrentPage(1);
    setSearchParams({ category: parentSlug, sub: childSlug, page: 1 });
  };

  const gridTitle = selectedSub?.name || selectedCategory?.name || "Danh sách phim";
  const breadcrumbItems = useMemo(() => {
    const build = (name, params = {}) => {
      const query = new URLSearchParams(params);
      const queryString = query.toString();
      return {
        name,
        path: "/danh-sach-phim",
        params,
        href: queryString ? `/danh-sach-phim?${queryString}` : "/danh-sach-phim",
      };
    };

    const items = [build("Danh sách phim")];
    if (selectedCategory) {
      items.push(
        build(selectedCategory.name, {
          category: selectedCategory.slug,
          page: currentPage,
        })
      );
    }
    if (selectedSub) {
      items.push(
        build(selectedSub.name, {
          category: selectedCategory.slug,
          sub: selectedSub.slug,
          page: currentPage,
        })
      );
    }
    return items;
  }, [selectedCategory, selectedSub, currentPage]);

  const handleResetFilters = () => {
    setSortOption("recent");
    const params = { category: categories[0].slug, page: 1 };
    setSearchParams(params);
  };

  useEffect(() => {
    if (!sub && selectedCategory?.item?.length) {
      const firstSub = selectedCategory.item[0].slug;
      setSearchParams({ category: selectedCategory.slug, sub: firstSub, page: 1 });
    }
  }, [sub, selectedCategory, setSearchParams]);

  const displayFilms = useMemo(() => {
    if (sortOption === "recent") {
      return films;
    }

    const sorted = [...films];

    if (sortOption === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortOption === "episodes") {
      sorted.sort((a, b) => (parseInt(b.total_episodes || 0, 10) || 0) - (parseInt(a.total_episodes || 0, 10) || 0));
    }

    return sorted;
  }, [films, sortOption]);

  return (
    <>
      <Template>
        <section className="pt-5">
          <Container as="aside" className="pt-4 pb-2">
            <Breadcrumbs props={breadcrumbItems} />
          </Container>
        </section>
        <Container as="section" className="pb-4">
          <Row className="g-4">
            <Col xs={12} md={4} lg={3}>
              <aside className="filter-panel">
                <div className="filter-panel__header d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">Bộ lọc</h5>
                    <p className="text-body-secondary mb-0">Sắp xếp theo thể loại</p>
                  </div>
                  <Button variant="link" className="p-0 text-decoration-none" onClick={handleResetFilters}>
                    Làm mới
                  </Button>
                </div>

                <div className="filter-stack">
                  {categories.map((item) => {
                    const isActive = item.slug === category;
                    const subItems = item.item || [];

                    return (
                      <Fragment key={item.slug}>
                        <button
                          type="button"
                          className={`filter-stack__category ${isActive ? "active" : ""}`}
                          onClick={() => handleCategoryChange(item.slug)}
                        >
                          <span>{item.name}</span>
                          {isActive ? <i className="bi bi-arrow-return-right" /> : <i className="bi bi-chevron-right" />}
                        </button>

                        {isActive && subItems.length > 0 && (
                          <div className="filter-stack__chips">
                            {subItems.map((child) => (
                              <Button
                                key={child.slug}
                                size="sm"
                                variant={child.slug === sub ? "danger" : "outline-secondary"}
                                className={`filter-chip ${child.slug === sub ? "active" : ""}`}
                                onClick={() => handleSubChange(item.slug, child.slug)}
                              >
                                {child.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </aside>
            </Col>
            <Col xs={12} md={8} lg={9}>
              <div className="catalog-toolbar">
                <div>
                  <p className="text-uppercase text-body-secondary mb-1">Đang xem</p>
                  <h3 className="fw-bold mb-0 text-danger">{gridTitle}</h3>
                  <span className="text-body-secondary small">Trang {currentPage}/{totalPage} • Tối đa 10 phim mỗi lượt</span>
                </div>
                <div className="catalog-toolbar__filters">
                  <Form.Group controlId="sortOption">
                    <Form.Label className="small text-uppercase text-body-secondary mb-1">Sắp xếp</Form.Label>
                    <Form.Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Badge bg="dark" className="rounded-pill align-self-start">
                    {loading ? "Đang tải..." : `${Math.min(films.length, 10)} / 10`}
                  </Badge>
                </div>
              </div>

              {hasError && (
                <div className="alert alert-warning" role="alert">
                  Không thể tải dữ liệu. Hãy thử lại sau ít phút nhé.
                </div>
              )}

              <Row xs={2} sm={2} md={3} lg={4} xl={4} className="row-hover g-4 align-items-stretch">
                {loading
                  ? Array.from({ length: 10 }).map((_, i) => <Cards key={i} loader />)
                  : displayFilms.length > 0
                    ? displayFilms.map((p, i) => (
                        <Cards
                          key={i}
                          name={p.name}
                          slug={p.slug}
                          image={p.thumb_url}
                          totalEpisodes={p.total_episodes}
                          currentEpisode={p.current_episode}
                          time={p.time}
                          quality={p.quality}
                          loader={false}
                        />
                      ))
                    : <p className="text-danger mb-0">Không có phim nào được tìm thấy.</p>}
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
