/* eslint-disable */
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Product from "../containers/Product";
import Pagi from "../containers/Pagi";

function Cate() {
  let data = [
    {
      id: 1,
      name: "Phim mới cập nhật",
      slug: "phim-moi-cap-nhat",
      item: [],
    },
    {
      id: 2,
      name: "Danh sách",
      slug: "danh-sach",
      item: [
        {
          id: 1,
          name: "TV shows",
          slug: "tv-shows",
        },
        {
          id: 2,
          name: "Phim lẻ",
          slug: "phim-le",
        },
        {
          id: 3,
          name: "Phim bộ",
          slug: "phim-bo",
        },
        {
          id: 4,
          name: "Phim đang chiếu",
          slug: "phim-dang-chieu",
        },
      ],
    },
    {
      id: 3,
      name: "Thể loại",
      slug: "the-loai",
      item: [
        { id: 1, name: "Hành Động", slug: "hanh-dong" },
        { id: 2, name: "Phiêu Lưu", slug: "phieu-luu" },
        { id: 3, name: "Hoạt Hình", slug: "hoat-hinh" },
        { id: 4, name: "Hài", slug: "hai" },
        { id: 5, name: "Hình Sự", slug: "hinh-su" },
        { id: 6, name: "Tài Liệu", slug: "tai-lieu" },
        { id: 7, name: "Chính Kịch", slug: "chinh-kich" },
        { id: 8, name: "Gia Đình", slug: "gia-dinh" },
        { id: 9, name: "Giả Tưởng", slug: "gia-tuong" },
        { id: 10, name: "Lịch Sử", slug: "lich-su" },
        { id: 11, name: "Kinh Dị", slug: "kinh-di" },
        { id: 12, name: "Nhạc", slug: "nhac" },
        { id: 13, name: "Bí Ẩn", slug: "bi-an" },
        { id: 14, name: "Lãng Mạn", slug: "lang-man" },
        { id: 15, name: "Khoa Học Viễn Tưởng", slug: "khoa-hoc-vien-tuong" },
        { id: 16, name: "Gây Cấn", slug: "gay-can" },
        { id: 17, name: "Chiến Tranh", slug: "chien-tranh" },
        { id: 18, name: "Tâm Lý", slug: "tam-ly" },
        { id: 19, name: "Tình Cảm", slug: "tinh-cam" },
        { id: 20, name: "Cổ Trang", slug: "co-trang" },
        { id: 21, name: "Miền Tây", slug: "mien-tay" },
        { id: 22, name: "Phim 18+", slug: "phim-18" },
      ],
    },
    {
      id: 4,
      name: "Quốc Gia",
      slug: "quoc-gia",
      item: [
        { id: 1, name: "Âu Mỹ", slug: "au-my" },
        { id: 2, name: "Anh", slug: "anh" },
        { id: 3, name: "Trung Quốc", slug: "trung-quoc" },
        { id: 4, name: "Indonesia", slug: "indonesia" },
        { id: 5, name: "Việt Nam", slug: "viet-nam" },
        { id: 6, name: "Pháp", slug: "phap" },
        { id: 7, name: "Hồng Kông", slug: "hong-kong" },
        { id: 8, name: "Hàn Quốc", slug: "han-quoc" },
        { id: 9, name: "Nhật Bản", slug: "nhat-ban" },
        { id: 10, name: "Thái Lan", slug: "thai-lan" },
        { id: 11, name: "Đài Loan", slug: "dai-loan" },
        { id: 12, name: "Nga", slug: "nga" },
        { id: 13, name: "Hà Lan", slug: "ha-lan" },
        { id: 14, name: "Philippines", slug: "philippines" },
        { id: 15, name: "Ấn Độ", slug: "an-do" },
        { id: 16, name: "Quốc gia khác", slug: "quoc-gia-khac" },
      ],
    },
    {
      id: 5,
      name: "Năm phát hành",
      slug: "nam-phat-hanh",
      item: [
        { id: 1, name: "2004", slug: "2004" },
        { id: 2, name: "2005", slug: "2005" },
        { id: 3, name: "2006", slug: "2006" },
        { id: 4, name: "2007", slug: "2007" },
        { id: 5, name: "2008", slug: "2008" },
        { id: 6, name: "2009", slug: "2009" },
        { id: 7, name: "2010", slug: "2010" },
        { id: 8, name: "2011", slug: "2011" },
        { id: 9, name: "2012", slug: "2012" },
        { id: 10, name: "2013", slug: "2013" },
        { id: 11, name: "2014", slug: "2014" },
        { id: 12, name: "2015", slug: "2015" },
        { id: 13, name: "2016", slug: "2016" },
        { id: 14, name: "2017", slug: "2017" },
        { id: 15, name: "2018", slug: "2018" },
        { id: 16, name: "2019", slug: "2019" },
        { id: 17, name: "2020", slug: "2020" },
        { id: 18, name: "2021", slug: "2021" },
        { id: 19, name: "2022", slug: "2022" },
        { id: 20, name: "2023", slug: "2023" },
        { id: 21, name: "2024", slug: "2024" },
      ],
    },
  ];

  const [category, setCategory] = useState("phim-moi-cap-nhat");
  const [isLoading, setIsLoading] = useState(false);
  const [subcategory, setSubcategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  useEffect(() => {
    const selectedData = data.find((d) => d.slug === category);
    setSubcategories(selectedData ? selectedData.item : []);
    setSubcategory("");
  }, [category]);

  useEffect(() => {
    // Gọi handleSubmit khi component lần đầu tiên được render
    handleSubmit();
  }, []);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSubcategoryChange = (e) => {
    setSubcategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmit = (e, page) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    let url = `https://phim.nguonc.com/api/films/${category}`;
    if (subcategory && subcategory !== "0") {
      url += `/${subcategory}`;
    }
    url += `?page=${page}`;

    axios
      .get(url)
      .then((res) => {
        setIsLoading(false);
        if (res.data && res.data.items) {
          setProducts(res.data.items);
          setCurrentPage(res.data.paginate.current_page || 1);
          setTotalPage(res.data.paginate.total_page || 1);
        } else {
          setProducts([]);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Có lỗi xảy ra:", error);
        setProducts([]);
      });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    handleSubmit(null, pageNumber); // Gọi lại hàm lọc khi người dùng thay đổi trang
  };

  return (
    <>
      <Header />
      <section className="pt-5">
        <aside className="container py-4">
          <Form onSubmit={handleSubmit}>
            <Container className="bg-body-tertiary border border-1 rounded rounded-1">
              <Row className="py-3">
                <Col xs={5} sm={5} md={4} lg={3}>
                  <Form.Select aria-label="Chọn danh mục chính" value={category} onChange={handleCategoryChange}>
                    {data.map((d, i) => (
                      <option key={i} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={5} sm={5} md={4} lg={3}>
                  <Form.Select aria-label="Chọn mục con" value={subcategory} onChange={handleSubcategoryChange}>
                    {subcategories && subcategories.length > 0 ? (
                      subcategories.map((item, i) => (
                        <option key={i} value={item.slug}>
                          {item.name}
                        </option>
                      ))
                    ) : (
                      <option value="0">Không có mục con</option>
                    )}
                  </Form.Select>
                </Col>
                <Col xs={2}>
                  <Button variant="danger" type="submit">
                    Lọc
                  </Button>
                </Col>
              </Row>
            </Container>
          </Form>
        </aside>
      </section>
      <section className="container pb-4">
        <h3 className="py-2 text-danger border-bottom border-danger">Danh sách phim</h3>
        <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-2">
          {isLoading && (
            <>
              <Spinner animation="border" variant="danger" />
              <span>Đang tải dữ liệu...</span>
            </>
          )}
          {!isLoading && products.length > 0 ? products.map((p, i) => <Product key={i} name={p.name} slug={p.slug} image={p.thumb_url} totalEpisodes={p.total_episodes} currentEpisode={p.current_episode} time={p.time} />) : <p>Không có phim nào được tìm thấy.</p>}
        </div>
        <Pagi current={currentPage} total={totalPage} handle={handlePageChange} />
      </section>

      <Footer />
    </>
  );
}

export default Cate;
