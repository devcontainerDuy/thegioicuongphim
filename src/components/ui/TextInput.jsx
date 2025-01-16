import { forwardRef, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";

export default forwardRef(function TextInput({ type = "text", className = "", isFocused = false, ...props }, ref) {
  const localRef = useRef();
  const inputRef = ref || localRef;

  useEffect(() => {
    if (isFocused) {
      inputRef.current.focus();
    }
  }, [isFocused, inputRef]);

  return <Form.Control {...props} type={type} className={className} ref={inputRef} />;
});
