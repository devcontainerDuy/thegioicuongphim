import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button, Card, Col, Collapse, Container, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Video from "../containers/Video";

function Watch() {
	const { slug, episode: selectedEpisodeSlug } = useParams();
	const [openContent, setOpenContent] = useState(true);
	const [openEpisodes, setOpenEpisodes] = useState(true);
	const [data, setData] = useState(null);
	const [iframeUrl, setIframeUrl] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`https://phim.nguonc.com/api/film/${slug}`);
				const movieData = res.data.movie;
				setData(movieData);

				if (movieData.episodes) {
					const initialEpisode = movieData.episodes.flatMap((episode) => episode.items).find((item) => item.slug === selectedEpisodeSlug);
					setIframeUrl(initialEpisode?.embed || null);
				}
			} catch (err) {
				console.error(err);
			}
		};

		fetchData();
	}, [slug, selectedEpisodeSlug]);

	if (!data) {
		return <p>Loading...</p>;
	}

	const episodes =
		data.episodes?.flatMap((episode) =>
			episode.items.map((item) => ({
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
						<Col lg={12}>
							<h3 className="text-uppercase text-lg text-primary text-truncate">
								<i className="bi bi-play-circle text-black" /> {data.name} - {data.original_name}
							</h3>
						</Col>
						<Col lg={12}>
							<Video embed={iframeUrl} />
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
										{episodes.map((e, i) => (
											<div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
												<Link
													to={`/xem-phim/${slug}/${e.slug}`}
													className={`btn w-100 text-truncate ${e.slug === selectedEpisodeSlug ? "btn-primary" : "btn-secondary"}`}
													onClick={() => setIframeUrl(e.embed)}>
													Tập {e.name}
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

export default Watch;
