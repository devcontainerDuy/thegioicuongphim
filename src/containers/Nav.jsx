/* eslint-disable */
import React from "react";
import { Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

function Nav() {
	return (
		<nav className="container pt-5 mt-3">
			<Swiper style={{ width: "100%" }} modules={[Navigation, Pagination, Autoplay]} spaceBetween={50} slidesPerView={1} navigation autoplay={{ delay: 3000 }} pagination={{ clickable: true }}>
				<SwiperSlide>
					<Link to="/phim/mai">
						<Image className="w-100 object-fit-contain" src="https://phim.nguonc.com/public/images/Film/zZ6nRdNQNxRnZ1LQ2ttPBZl9AXV.jpg" fluid />
					</Link>
				</SwiperSlide>
				<SwiperSlide>
					<Link to="phim/gap-lai-chi-bau">
						<Image className="w-100 object-fit-contain" src="https://phim.nguonc.com/public/images/Film/9r7YEw1ZW7Kq2iwoTNx643G53JC.jpg" fluid />
					</Link>
				</SwiperSlide>
				<SwiperSlide>
					<Link to="/phim/ke-trom-mat-trang-4">
						<Image className="w-100 object-fit-contain" src="https://phim.nguonc.com/public/images/Film/fDmuPREB3yTrelyYugguEine5Y1.jpg" fluid />
					</Link>
				</SwiperSlide>
				<SwiperSlide>
					<Link to="/phim/deadpool-va-wolverine">
						<Image className="w-100 object-fit-contain" src="https://phim.nguonc.com/public/images/Film/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg" fluid />
					</Link>
				</SwiperSlide>
				<SwiperSlide>
					<Link to="/phim/7-nam-chua-cuoi-se-chia-tay">
						<Image className="w-100 object-fit-contain" src="https://phim.nguonc.com/public/images/Post/9/7-nam-chua-cuoi-se-chia-tay-1.jpeg" fluid />
					</Link>
				</SwiperSlide>
			</Swiper>
		</nav>
	);
}

export default Nav;
