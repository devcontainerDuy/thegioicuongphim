/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button, Card, Col, Collapse, Container, Image, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { addFavorite, removeFavorite } from "../store/reducers/favoritesSlice";

function Detail() {
	const { slug } = useParams();
	const [data, setData] = useState(null);

	const dispatch = useDispatch();
	const favoriteList = useSelector((state) => state.favorites.items); // Truy cập state từ slice
	let isFavorite = favoriteList.some((film) => film.id === data?.id);

	const handleFavoriteClick = () => {
		if (data) {
			if (isFavorite) {
				dispatch(removeFavorite(data.id));
			} else {
				dispatch(addFavorite(data));
			}
		}
	};

	const [openContent, setOpenContent] = useState(true);
	const [openEpisodes, setOpenEpisodes] = useState(true);

	useEffect(() => {
		axios
			.get(`https://phim.nguonc.com/api/film/${slug}`)
			.then((res) => {
				setData(res.data.movie);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [slug]);

	if (!data) {
		return <p>Loading...</p>;
	}

	const categoryList = data.category[2]?.list.map((item) => item.name).join(", ") || "N/A";
	const releaseYear = data.category[3]?.list[0]?.name || "N/A";
	const country = data.category[4]?.list[0]?.name || "N/A";
	const episodes =
		data.episodes?.flatMap((episode) =>
			episode.items?.map((item) => ({
				name: item.name,
				slug: item.slug,
				embed: item.embed,
			}))
		) || [];

	return (
		<>
			<Header />
			<main className="pt-5">
				<Container className="pt-2">
					<Row>
						<Col lg={3}>
							<Image className="w-100 h-100 object-fit-contain" src={data.thumb_url} />
						</Col>
						<Col lg={9} className="pt-3">
							<div className="container">
								<div className="text-center rounded">
									<Row>
										<Col>
											<h3 className="text-danger text-lg fw-bold text-primary">{data.name}</h3>
										</Col>
										<Col xs="1" className="text-end">
											<Button type="button" className="float-end" variant="outline-success" title="Thêm yêu thích" onClick={handleFavoriteClick}>
												<i className={`bi ${favoriteList.some((film) => film.id === data.id) ? "bi-bookmark-fill" : "bi-bookmark"}`} />
											</Button>
										</Col>
									</Row>
									<h5 className="fst-italic">{data.original_name}</h5>
								</div>
								<div className="overflow-auto">
									<table className="table table-borderless text-start">
										<tbody>
											<tr className="border-top">
												<td className="py-1 pe-2 text-body fw-bold">Trạng thái</td>
												<td className="py-1 ps-2 text-body">{data.current_episode}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-body fw-bold">Số tập</td>
												<td className="py-1 ps-2 text-body">{data.total_episodes}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-body fw-bold">Thời Lượng</td>
												<td className="py-1 ps-2 text-body">{data.time}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-body fw-bold">Chất Lượng</td>
												<td className="py-1 ps-2 text-body">{data.quality}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-body fw-bold">Ngôn Ngữ</td>
												<td className="py-1 ps-2 text-body">{data.language}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-body fw-bold">Đạo Diễn</td>
												<td className="py-1 ps-2 text-body">{data.director}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-body fw-bold">Diễn Viên</td>
												<td className="py-1 ps-2 text-body">{data.casts}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-body fw-bold">Danh sách</td>
												<td className="py-1 ps-2 text-body">{data.category[1]?.list[0]?.name || "N/A"}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-body fw-bold">Thể loại</td>
												<td className="py-1 ps-2 text-body">{categoryList}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-body fw-bold">Năm phát hành</td>
												<td className="py-1 ps-2 text-body">{releaseYear}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-body fw-bold">Quốc gia</td>
												<td className="py-1 ps-2 text-body">{country}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</Col>
					</Row>
				</Container>
				<Container className="my-4">
					<Card className="mb-3">
						<Card.Body>
							<Button variant="danger" className="w-100 d-flex justify-content-between" onClick={() => setOpenContent(!openContent)}>
								Nội dung phim
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className={`bi bi-caret-down ${openContent ? "rotate-180" : ""}`}
									style={{ width: "20px", height: "20px" }}>
									<path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
								</svg>
							</Button>
							<Collapse in={openContent}>
								<div className="mt-2">
									<p>{data.description}</p>
								</div>
							</Collapse>
						</Card.Body>
					</Card>

					<Card className="mb-3">
						<Card.Body>
							<Button variant="danger" className="w-100 d-flex justify-content-between" onClick={() => setOpenEpisodes(!openEpisodes)}>
								Xem Phim
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className={`bi bi-caret-down ${openEpisodes ? "rotate-180" : ""}`}
									style={{ width: "20px", height: "20px" }}>
									<path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
								</svg>
							</Button>
							<Collapse in={openEpisodes}>
								<div className="mt-2">
									<div className="row g-2 overflow-auto" style={{ maxHeight: "230px" }}>
										{episodes.map((episode, i) => (
											<div key={i} className="col-3 col-sm-3 col-md-2 col-lg-2">
												<Link to={`/xem-phim/${slug}/${episode.slug}`} className="btn btn-secondary w-100 text-truncate">
													Tập {episode.name}
												</Link>
											</div>
										))}
									</div>
								</div>
							</Collapse>
						</Card.Body>
					</Card>
				</Container>
			</main>
			<Footer />
		</>
	);
}

export default Detail;
