/* eslint-disable */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Product from "../containers/Product";
import Pagi from "../containers/Pagi";

function Category() {
	const { slug } = useParams();
	const [isLoading, setIsLoading] = useState(false);
	const [products, setProducts] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPage, setTotalPage] = useState(1);

	useEffect(() => {
		setIsLoading(true);
		let url = `https://phim.nguonc.com/api/films/danh-sach/${slug}`;
		url += `?page=${currentPage}`;

		axios
			.get(url)
			.then((res) => {
				setIsLoading(false);
				if (res.data && res.data.items) {
					setProducts(res.data.items);
					setCurrentPage(res.data.paginate.current_page);
					setTotalPage(res.data.paginate.total_page);
				} else {
					setProducts([]);
				}
			})
			.catch((error) => {
				setIsLoading(false);
				console.error("Có lỗi xảy ra:", error);
				setProducts([]);
			});
	}, [slug, currentPage]);

	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	return (
		<>
			<Header />
			<section className="container py-5 mt-4">
				<h3 className="text-danger border-bottom border-danger">Danh sách phim</h3>
				<div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-2">
					{isLoading && <div>Đang tải...</div>}
					{!isLoading && products.length > 0 ? (
						products.map((p, i) => <Product key={i} name={p.name} slug={p.slug} image={p.thumb_url} totalEpisodes={p.total_episodes} currentEpisode={p.current_episode} time={p.time} />)
					) : (
						<p>Không có phim nào được tìm thấy.</p>
					)}
				</div>
				<Pagi current={currentPage} total={totalPage} handle={handlePageChange} />
			</section>
			<Footer />
		</>
	);
}

export default Category;
