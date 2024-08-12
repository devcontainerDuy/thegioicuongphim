import React from "react";
import { Image } from "react-bootstrap";
import { Link } from "react-router-dom";

function Product({ name, slug, image, totalEpisodes, currentEpisode, time }) {
	return (
		<>
			<div className="col">
				<div className="card shadow-sm">
					<Image src={image} className="card-img-top" alt={name} fluid style={{ maxHeight: "320px" }} />
					<div className="card-body">
						<div className="card-text text-truncate">
							<Link to={`/phim/${slug}`} className="link-offset-2-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">
								<p>{name}</p>
							</Link>
						</div>
						<div className="d-flex justify-content-between align-items-center">
							<small className="text-body-secondary">
								{currentEpisode}/{totalEpisodes}
							</small>
							<small className="text-body-secondary">{time}</small>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Product;
