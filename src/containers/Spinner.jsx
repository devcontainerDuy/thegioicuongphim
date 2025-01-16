import React from "react";
import { Spinner as SpinnerComponent } from "react-bootstrap";
function Spinner() {
  return (
    <>
      <div className="d-flex justify-content-center align-items-center bg-dark" style={{ height: "100vh" }}>
        <SpinnerComponent animation="border" variant="danger" style={{ width: "3rem", height: "3rem" }} />
      </div>
    </>
  );
}

export default Spinner;
