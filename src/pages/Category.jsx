import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pagination } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Product from "../containers/Product";

function Category() {
	const { slug } = useParams();
	const [products, setProducts] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPage, setTotalPage] = useState(1);

	useEffect(() => {
		let url = `https://phim.nguonc.com/api/films/danh-sach/${slug}`;
		url += `?page=${currentPage}`;

		axios
			.get(url)
			.then((res) => {
				if (res.data && res.data.items) {
					setProducts(res.data.items);
					setCurrentPage(res.data.paginate.current_page);
					setTotalPage(res.data.paginate.total_page);
				} else {
					setProducts([]);
				}
			})
			.catch((error) => {
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
			<section className="container py-5">
				<h3 className="py-4 text-danger border-bottom border-danger">Danh sách phim</h3>
				<div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-2">
					{products.length > 0 ? (
						products.map((p, i) => <Product key={i} name={p.name} slug={p.slug} image={p.thumb_url} totalEpisodes={p.total_episodes} currentEpisode={p.current_episode} time={p.time} />)
					) : (
						<p>Không có phim nào được tìm thấy.</p>
					)}
				</div>
				<Pagination className="justify-content-center mt-2">
					<Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
					<Pagination.Prev onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)} disabled={currentPage === 1} />
					{currentPage > 3 && (
						<>
							<Pagination.Item onClick={() => handlePageChange(1)}>1</Pagination.Item>
							<Pagination.Ellipsis />
						</>
					)}

					{currentPage > 1 && <Pagination.Item onClick={() => handlePageChange(currentPage - 1)}>{currentPage - 1}</Pagination.Item>}
					<Pagination.Item active>{currentPage}</Pagination.Item>
					{currentPage < totalPage && <Pagination.Item onClick={() => handlePageChange(currentPage + 1)}>{currentPage + 1}</Pagination.Item>}

					{currentPage < totalPage - 2 && (
						<>
							<Pagination.Ellipsis />
							<Pagination.Item onClick={() => handlePageChange(totalPage)}>{totalPage}</Pagination.Item>
						</>
					)}
					<Pagination.Next onClick={() => handlePageChange(currentPage < totalPage ? currentPage + 1 : totalPage)} disabled={currentPage === totalPage} />
					<Pagination.Last onClick={() => handlePageChange(totalPage)} disabled={currentPage === totalPage} />
				</Pagination>
			</section>
			<Footer />
		</>
	);
}

export default Category;
