import axios from "axios";
import React, { useEffect, useState } from "react";
import { Col, Container, Dropdown, Form, Image, InputGroup, Nav, Navbar, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

function useTheme() {
	const [theme, setTheme] = useState(() => {
		const storedTheme = localStorage.getItem("theme");
		if (storedTheme) {
			return storedTheme;
		}
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	});

	useEffect(() => {
		const applyTheme = (theme) => {
			if (theme === "auto") {
				const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
				document.documentElement.setAttribute("data-bs-theme", preferredTheme);
			} else {
				document.documentElement.setAttribute("data-bs-theme", theme);
			}
		};

		applyTheme(theme);

		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
			if (theme === "auto") {
				applyTheme("auto");
			}
		});
	}, [theme]);

	const toggleTheme = (newTheme) => {
		localStorage.setItem("theme", newTheme);
		setTheme(newTheme);
	};

	return [theme, toggleTheme];
}

function toSlug(str) {
	return str
		.toLowerCase()
		.normalize("NFD") // Chuẩn hóa ký tự tiếng Việt có dấu thành không dấu
		.replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu thanh
		.replace(/[^a-z0-9\s-]/g, "") // Loại bỏ các ký tự đặc biệt
		.trim()
		.replace(/\s+/g, "-") // Thay thế khoảng trắng bằng dấu gạch ngang
		.replace(/-+/g, "-"); // Loại bỏ dấu gạch ngang dư thừa
}

function Header() {
	const [theme, toggleTheme] = useTheme();
	const [searchTerm, setSearchTerm] = useState("");
	const [films, setFilms] = useState([]);

	const handleThemeClick = (newTheme) => {
		toggleTheme(newTheme);
	};

	const searchFilms = (keyword) => {
		const slugKeyword = toSlug(keyword);
		const url = `https://phim.nguonc.com/api/films/search?keyword=${slugKeyword}`;

		axios
			.get(url)
			.then((response) => {
				console.log(response.data);
				setFilms(response.data.items);
			})
			.catch((error) => {
				console.error("Error fetching the films:", error);
			});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		searchFilms(searchTerm);
	};

	return (
		<header className="header fixed-top">
			<Navbar expand="lg" className="bg-body-tertiary" sticky="top">
				<Container>
					<Navbar.Brand href="/">
						<Image src="http://localhost/thegioicuongphim/src/assets/logo/logo.png" alt="Logo" className="logo" width={200} height={40} />
					</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse className="justify-content-end" id="basic-navbar-nav">
						<Row className="w-100">
							<Col md={5}>
								<Nav className="me-auto">
									<Nav.Item>
										<Link to="/" className="nav-link active">
											Trang chủ
										</Link>
									</Nav.Item>
									<Nav.Item>
										<Link to="/danh-sach-phim" className="nav-link">
											Doanh sách phim
										</Link>
									</Nav.Item>
									<Nav.Item>
										<Link to="/danh-sach-phim/phim-le" className="nav-link">
											Phim lẻ
										</Link>
									</Nav.Item>
									<Nav.Item>
										<Link to="/danh-sach-phim/phim-bo" className="nav-link">
											Phim bộ
										</Link>
									</Nav.Item>
								</Nav>
							</Col>
							<Col md={4}>
								<Form className="d-flex" onSubmit={handleSubmit}>
									<InputGroup aria-label="Tìm kiếm">
										<Form.Control type="search" placeholder="Tìm kiếm phim..." aria-label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
										<Dropdown>
											<Dropdown.Toggle variant="success" type="submit">
												<i className="bi bi-search" />
											</Dropdown.Toggle>
											<Dropdown.Menu>
												{films.map((film) => (
													<Dropdown.Item key={film.slug} href={`/phim/${film.slug}`}>
														{film.name}
													</Dropdown.Item>
												))}
											</Dropdown.Menu>
										</Dropdown>
									</InputGroup>
								</Form>
							</Col>
							<Col>
								<Nav className="d-flex justify-content-end">
									<Nav.Item>
										<Link to="/" className="nav-link">
											Đăng nhập
										</Link>
									</Nav.Item>
									<Nav.Item>
										<Link to="/danh-muc" className="nav-link">
											Đăng ký
										</Link>
									</Nav.Item>
								</Nav>
							</Col>
						</Row>
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<div className="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle">
				<button
					className="btn btn-primary py-2 dropdown-toggle d-flex align-items-center"
					id="bd-theme"
					type="button"
					aria-expanded="false"
					data-bs-toggle="dropdown"
					aria-label={`Toggle theme (${theme})`}>
					<div className="my-1 theme-icon-active" width="1em" height="1em">
						<i className={"bi bi-" + (theme === "light" ? "sun-fill" : "moon-stars-fill")} />
					</div>
					<span className="visually-hidden" id="bd-theme-text">
						Toggle theme
					</span>
				</button>
				<ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="bd-theme-text">
					<li>
						<button
							type="button"
							onClick={() => handleThemeClick("light")}
							className={`dropdown-item d-flex align-items-center ${theme === "light" ? "active" : ""}`}
							data-bs-theme-value="light"
							aria-pressed={theme === "light"}>
							<i className="bi bi-sun-fill me-2 opacity-50" width="1em" height="1em" />
							Light
						</button>
					</li>
					<li>
						<button
							type="button"
							onClick={() => handleThemeClick("dark")}
							className={`dropdown-item d-flex align-items-center ${theme === "dark" ? "active" : ""}`}
							data-bs-theme-value="dark"
							aria-pressed={theme === "dark"}>
							<i className="bi bi-moon-stars-fill me-2 opacity-50" width="1em" height="1em" />
							Dark
						</button>
					</li>
					<li>
						<button
							type="button"
							onClick={() => handleThemeClick("auto")}
							className={`dropdown-item d-flex align-items-center ${theme === "auto" ? "active" : ""}`}
							data-bs-theme-value="auto"
							aria-pressed={theme === "auto"}>
							<i className="me-2 bi bi-circle-half opacity-50" width="1em" height="1em" />
							Auto
						</button>
					</li>
				</ul>
			</div>
		</header>
	);
}

export default Header;
