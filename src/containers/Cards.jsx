/* eslint-disable */
import React from "react";
import { Card, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function Cards({ name, slug, image, totalEpisodes, currentEpisode, time }) {
  return (
    <>
      <Col>
        <Card className="shadow-sm card-hover">
          <Card.Img className="card-img-hover" variant="top" src={image} alt={name} fluid style={{ maxHeight: "320px" }} />
          <Card.Body>
            {/* text-truncate */}
            <Card.Text className="text-title">
              <Link to={`/phim/${slug}`} className="link-danger link-offset-2-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover text-body-emphasis">
                {name}
              </Link>
            </Card.Text>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-danger">
                {currentEpisode}/{totalEpisodes}
              </small>
              <small className="text-body-secondary">{time}</small>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </>
  );
}

export default Cards;
