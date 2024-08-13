/* eslint-disable */
import React from "react";

function Video({ embed }) {
	return (
		<>
			<div className="ratio ratio-16x9">
				<iframe
					width="100%"
					src={embed || "about:blank"}
					title="Video player"
					frameBorder="0"
					loading="lazy"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerPolicy="strict-origin-when-cross-origin"
					allowFullScreen></iframe>
			</div>
		</>
	);
}

export default Video;
