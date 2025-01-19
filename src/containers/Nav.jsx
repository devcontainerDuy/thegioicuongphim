/* eslint-disable */
import React from "react";
import { Card, Container, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

function Nav() {
  return (
    <Container as={"nav"} className="mt-5">
      <Swiper
        style={{ width: "auto", maxHeight: "100vh" }}
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
      >
        <SwiperSlide>
          <Card as={Link} to="/phim/mai" className="text-white shadow bg-fill">
            <Card.Img className="object-fit-contain" src="https://phim.nguonc.com/public/images/Film/zZ6nRdNQNxRnZ1LQ2ttPBZl9AXV.jpg" fluid alt="Card image" />
            <Card.ImgOverlay className="m-5 p-5 d-flex flex-column justify-content-end">
              <Card.Title className="fw-bold fs-1">MAI - Một bộ phim của Trấn Thành</Card.Title>
              <Card.Text>
                MAI xoay quanh câu chuyện về cuộc đời của một người phụ nữ cùng tên với bộ phim. Trên First-look Poster, Phương Anh Đào tạo ấn tượng mạnh với cái nhìn tĩnh lặng, xuyên thấu, đặc biệt,
                trên bờ môi nữ diễn viên là hình ảnh cô đang nằm nghiêng trên mặt nước. Được phủ một màn sương mờ ảo, poster đậm chất nghệ thuật của Mai gây tò mò với lời tựa: “Quá khứ chưa ngủ yên,
                ngày mai liệu sẽ đến?”.
              </Card.Text>
              <Card.Text>
                <strong>Thể loại:</strong> Chính Kịch, Lãng Mạn
              </Card.Text>
            </Card.ImgOverlay>
          </Card>
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
    </Container>
  );
}

export default Nav;
