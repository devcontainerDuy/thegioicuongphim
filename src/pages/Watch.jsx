/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Collapse, Container, Row, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Template from "components/layout/Template";
import Video from "containers/Video";
import { useFilmDetail } from "hooks/useFilmDetail";

function Watch() {
    const { slug, episode: selectedEpisodeSlug } = useParams();
    const [openContent, setOpenContent] = useState(true);
    const [openEpisodes, setOpenEpisodes] = useState(true);
    const [iframeUrl, setIframeUrl] = useState(null);
    const { film: data, loading, error } = useFilmDetail(slug);

    if (!data && loading) {
        return (
            <Template>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                    <Spinner animation="border" variant="danger" />
                </div>
            </Template>
        );
    }

    if (!data && error) {
        return (
            <Template>
                <div className="container py-5">
                    <div className="alert alert-danger" role="alert">
                        Không thể tải dữ liệu phim.
                    </div>
                </div>
            </Template>
        );
    }

    useEffect(() => {
        if (!data) {
            return;
        }
        const allEpisodes = data.episodes?.flatMap((episode) => episode.items) || [];
        const matchedEpisode = allEpisodes.find((item) => item.slug === selectedEpisodeSlug);
        const fallbackEpisode = allEpisodes[0];
        setIframeUrl((matchedEpisode || fallbackEpisode)?.embed || null);
    }, [data, selectedEpisodeSlug]);

    const episodes =
        data?.episodes?.flatMap((episode) =>
            episode.items.map((item) => ({
                name: item.name,
                slug: item.slug,
                embed: item.embed,
            }))
        ) || [];

    return (
        <>
            <Template>
                <main className="pt-5">
                    <Container className="pt-4">
                        <Row>
                            <Col lg={12}>
                                <h3 className="my-2 text-danger text-truncate">
                                    <i className="bi bi-play-circle text-black" /> {data?.name} - {data?.original_name}
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
                                <Button variant="danger" className="w-100 d-flex justify-content-between" onClick={() => setOpenContent(!openContent)}>
                                    Nội dung phim
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`bi bi-caret-down ${openContent ? "rotate-180" : ""}`} style={{ width: "20px", height: "20px" }}>
                                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                </Button>
                                <Collapse in={openContent}>
                                    <div className="mt-2">
                                        <p>{data?.description}</p>
                                    </div>
                                </Collapse>
                            </Card.Body>
                        </Card>
                        <Card className="mb-3">
                            <Card.Body>
                                <Button variant="danger	" className="w-100 d-flex justify-content-between" onClick={() => setOpenEpisodes(!openEpisodes)}>
                                    Xem Phim
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`bi bi-caret-down ${openEpisodes ? "rotate-180" : ""}`} style={{ width: "20px", height: "20px" }}>
                                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                </Button>
                                <Collapse in={openEpisodes}>
                                    <div className="mt-2">
                                        <div className="row g-2">
                                            {episodes.map((e, i) => (
                                                <div key={i} className="col-3 col-sm-3 col-md-2 col-lg-2">
                                                    <Link
                                                        to={`/xem-phim/${slug}/${e.slug}`}
                                                        className={`btn w-100 text-truncate ${e.slug === selectedEpisodeSlug ? "btn-danger" : "btn-secondary"}`}
                                                        onClick={() => setIframeUrl(e.embed)} // Cập nhật URL của iframe khi chọn tập
                                                    >
                                                        {e.name}
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
            </Template>
        </>
    );
}

export default Watch;
