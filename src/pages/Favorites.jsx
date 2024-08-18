import React from "react";
import { useSelector } from "react-redux";
import { Container } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Product from "../containers/Product";

function Favorites() {
	const favoriteList = useSelector((state) => state.favorites.items);
	console.log("favoriteList", favoriteList);

	return (
		<>
			<Header />
			<main className="pt-5">
				<Container className="py-4">
					<h3 className="py-2 text-center text-danger border-bottom border-danger fw-bold">Danh Sách Phim Yêu Thích</h3>
					{favoriteList.length > 0 ? (
						<div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-2">
							{favoriteList.map((p, i) => (
								<Product key={i} name={p.name} slug={p.slug} image={p.thumb_url} totalEpisodes={p.total_episodes} currentEpisode={p.current_episode} time={p.time} />
							))}
						</div>
					) : (
						<p className="text-center">Bạn chưa thêm phim nào vào danh sách yêu thích.</p>
					)}
				</Container>
			</main>
			<Footer />
		</>
	);
}

export default Favorites;
