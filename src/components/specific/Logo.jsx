import React from "react";

function Logo() {
  return (
    <>
      <div className="d-flex align-items-center text-uppercase rounded ">
        <div className="fw-bold text-bg-danger px-2 rounded-start">
          <span>THẾ</span>
        </div>
        <div className="fw-bold bg-secondary text-warning px-2">
          <span>GIỚI</span>
        </div>
        <div className="fw-bold text-bg-danger px-2">
          <span>CUỒNG</span>
        </div>
        <div className="fw-bold bg-secondary text-warning px-2 rounded-end">
          <span>PHIM</span>
        </div>
      </div>
    </>
  );
}

export default Logo;
