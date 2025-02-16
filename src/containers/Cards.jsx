/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Card, Col, Placeholder } from "react-bootstrap";
import { Link } from "react-router-dom";

function Cards({ name, slug, image, totalEpisodes, currentEpisode, time, loader = true }) {
  const [loading, setLoading] = useState(loader);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  let style = { minHeight: "320px", maxHeight: "320px", objectFit: "cover", objectPosition: "center", width: "auto" };

  return (
    <Col>
      <Card className="shadow-sm card-hover">
        {loading ? <Placeholder as={Card.Img} animation="wave" style={style} /> : <Card.Img className="card-img-hover" variant="top" src={image} alt={name} fluid style={style} />}
        <Card.Body>
          {loading ? (
            <>
              <Placeholder as={Card.Text} animation="wave" className="text-title" />
              <Placeholder as="div" animation="wave" className="d-lg-flex d-block justify-content-lg-between">
                <Placeholder xs={6} />
                <Placeholder xs={6} />
              </Placeholder>
            </>
          ) : (
            <>
              <Card.Text className="text-title">
                <Link to={`/phim/${slug}`} className="link-danger link-offset-2-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover text-body-emphasis">
                  {name}
                </Link>
              </Card.Text>
              <div className="d-lg-flex d-block justify-content-lg-between">
                <div className="text-danger">
                  <small>{currentEpisode && totalEpisodes ? `${currentEpisode}/${totalEpisodes}` : "N/A"}</small>
                </div>
                <div className="text-body-secondary">
                  <small>{time}</small>
                </div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
}

export default Cards;
