/* eslint-disable */
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
	return (
		<footer className="bg-body-secondary">
			<div className="container">
				<div className="row">
					<div className="col-6 col-md-3 mb-3">
						<h2>Thegioicuongphim</h2>
					</div>
					<div className="col-6 col-md-3 mb-3">
						<h5>Section</h5>
						<ul className="nav flex-column">
							<li className="nav-item mb-2">
								<Link to="/" className="nav-link p-0 text-body-secondary">
									Trang chủ
								</Link>
							</li>
							<li className="nav-item mb-2">
								<Link to="/danh-sach-phim" className="nav-link p-0 text-body-secondary">
									Danh sách phim
								</Link>
							</li>
							<li className="nav-item mb-2">
								<Link to="/danh-sach-phim/phim-le" className="nav-link p-0 text-body-secondary">
									Phim lẻ
								</Link>
							</li>
							<li className="nav-item mb-2">
								<Link to="/danh-sach-phim/phim-bo" className="nav-link p-0 text-body-secondary">
									Phim bộ
								</Link>
							</li>
						</ul>
					</div>
					<div className="col-md-5 offset-md-1 mb-3">
						<form>
							<h5>Đăng ký vào bản tin của chúng tôi</h5>
							<p>Thông báo hàng tháng về những gì mới và thú vị từ chúng tôi.</p>
							<div className="d-flex flex-column flex-sm-row w-100 gap-2">
								<label htmlFor="newsletter1" className="visually-hidden">
									Địa chỉ email
								</label>
								<input id="newsletter1" type="text" className="form-control" placeholder="Nhập địa chỉ email của bạn..." />
								<button className="btn btn-danger" type="button">
									Gửi!
								</button>
							</div>
						</form>
					</div>
				</div>

				<div className="d-flex flex-column flex-sm-row justify-content-between py-4 border-top">
					<p>© 2024 Company, Inc. All rights reserved.</p>
					<ul className="list-unstyled d-flex">
						<li className="ms-3">
							<Link className="link-body-emphasis" to="#">
								<i className="bi bi-twitter" width={24} height={24} />
							</Link>
						</li>
						<li className="ms-3">
							<Link className="link-body-emphasis" to="#">
								<i className="bi bi-instagram" width={24} height={24} />
							</Link>
						</li>
						<li className="ms-3">
							<Link className="link-body-emphasis" to="#">
								<i className="bi bi-facebook" width={24} height={24} />
							</Link>
						</li>
					</ul>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
