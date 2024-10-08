import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Nav from "../containers/Nav";
import Product from "../containers/Product";
import axios from "axios";

function Home() {
  const [products, setProducts] = useState([]);
  const [vietnam, setVietnam] = useState([]);
  //   const [page, setPage] = useState(1);

  useEffect(() => {
    axios
      .get("https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=" + 1)
      .then((res) => {
        setProducts(res.data.items);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get("https://phim.nguonc.com/api/films/quoc-gia/viet-nam?page=" + 1)
      .then((res) => {
        setVietnam(res.data.items);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <>
      <Header />
      <Nav />
      <main className="py-3">
        <section className="container">
          <h3 className="py-2 text-danger border-bottom border-danger fw-bold">Phim mới cập nhật</h3>
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-2">{products.length > 0 ? products.map((p, i) => <Product key={i} name={p.name} slug={p.slug} image={p.thumb_url} totalEpisodes={p.total_episodes} currentEpisode={p.current_episode} time={p.time} />) : <p className="text-danger">Không có phim nào được tìm thấy.</p>}</div>
        </section>
        <section className="container py-3">
          <h3 className="py-2 text-danger border-bottom border-danger">Phim Việt Nam</h3>
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-2">{vietnam.length > 0 ? vietnam.map((p, i) => <Product key={i} name={p.name} slug={p.slug} image={p.thumb_url} totalEpisodes={p.total_episodes} currentEpisode={p.current_episode} time={p.time} />) : <p>Không có phim nào được tìm thấy.</p>}</div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;
