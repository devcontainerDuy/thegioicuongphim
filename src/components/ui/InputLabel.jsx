import { Form } from "react-bootstrap";

export default function InputLabel({ value, className = "", children, ...props }) {
  return (
    <Form.Label {...props} className={className} style={{ fontWeight: "bold" }}>
      {value ? value : children}
    </Form.Label>
  );
}
