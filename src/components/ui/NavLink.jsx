import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function NavLink({ active = false, className = "", children, ...props }) {
  return (
    <Nav.Link {...props} as={Link} className={`${active ? "active" : ""} ${className}`}>
      {children}
    </Nav.Link>
  );
}
