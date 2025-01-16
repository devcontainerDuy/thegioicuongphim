import { Button } from "react-bootstrap";

export default function Buttons({ className = "", disabled, children, ...props }) {
  return (
    <Button {...props} variant="dark" className={`text-uppercase ${disabled ? "opacity-25" : ""} ${className}`} disabled={disabled}>
      {children}
    </Button>
  );
}
