/* eslint-disable */
import React from "react";
import { Card, CardBody, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function Product({ name, slug, image, totalEpisodes, currentEpisode, time }) {
	return (
		<>
			<Col>
				<Card className="shadow-sm">
					<Card.Img variant="top" src={image} alt={name} fluid style={{ maxHeight: "320px" }} />
					<CardBody className="card-body">
						<Card.Text className="text-truncate">
							<Link to={`/phim/${slug}`} className="link-offset-2-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">
								<p className="fw-bold text-body-secondary">{name}</p>
							</Link>
						</Card.Text>
						<div className="d-flex justify-content-between align-items-center">
							<small className="text-danger">
								{currentEpisode}/{totalEpisodes}
							</small>
							<small className="text-body-secondary">{time}</small>
						</div>
					</CardBody>
				</Card>
			</Col>
		</>
	);
}

export default Product;
