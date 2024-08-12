import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button, Card, Col, Collapse, Container, Image, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function Detail() {
	const { slug } = useParams();
	const [data, setData] = useState(null);

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
				<Container className="pt-4">
					<Row>
						<Col lg={3}>
							<Image className="w-100 h-100 object-fit-contain" src={data.thumb_url} />
						</Col>
						<Col lg={9}>
							<div className="container">
								<div className="text-center rounded">
									<h3 className="text-uppercase text-lg fw-bold text-primary">{data.name}</h3>
									<h5 className="fst-italic text-info">{data.original_name}</h5>
								</div>
								<div className="overflow-auto">
									<table className="table table-borderless text-start">
										<tbody>
											<tr className="border-top">
												<td className="py-1 pe-2 text-info">Trạng thái</td>
												<td className="py-1 ps-2 text-primary">{data.current_episode}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-info">Số tập</td>
												<td className="py-1 ps-2 text-primary">{data.total_episodes}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-info">Thời Lượng</td>
												<td className="py-1 ps-2 text-primary">{data.time}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-info">Chất Lượng</td>
												<td className="py-1 ps-2 text-primary">{data.quality}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-info">Ngôn Ngữ</td>
												<td className="py-1 ps-2 text-primary">{data.language}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-info">Đạo Diễn</td>
												<td className="py-1 ps-2 text-primary">{data.director}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-info">Diễn Viên</td>
												<td className="py-1 ps-2 text-primary">{data.casts}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-info">Danh sách</td>
												<td className="py-1 ps-2 text-primary">{data.category[1]?.list[0]?.name || "N/A"}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-info">Thể loại</td>
												<td className="py-1 ps-2 text-primary">{categoryList}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-info">Năm phát hành</td>
												<td className="py-1 ps-2 text-primary">{releaseYear}</td>
											</tr>
											<tr className="border-top">
												<td className="py-1 pe-2 text-info">Quốc gia</td>
												<td className="py-1 ps-2 text-primary">{country}</td>
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
							<Button variant="primary" className="w-100 d-flex justify-content-between" onClick={() => setOpenContent(!openContent)}>
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
							<Button variant="primary" className="w-100 d-flex justify-content-between" onClick={() => setOpenEpisodes(!openEpisodes)}>
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
									<div className="row g-2">
										{episodes.map((episode, i) => (
											<div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
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
