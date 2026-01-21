import React from "react";
import Buttons from "components/ui/Buttons";
import { Link } from "react-router-dom";

const QuickFilters = ({ filters = [] }) => {
  if (!filters.length) {
    return null;
  }

  return (
    <section className="quick-filters my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h5 className="mb-1 fw-bold text-uppercase text-danger">Khám phá theo thể loại</h5>
          <p className="mb-0 text-body-secondary">Chọn nhanh chủ đề phù hợp với bạn.</p>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Buttons
            key={filter.to}
            as={Link}
            to={filter.to}
            variant="outline-danger"
            className="quick-filter-btn"
          >
            <i className={`me-2 bi ${filter.icon || "bi-film"}`} />
            {filter.label}
          </Buttons>
        ))}
      </div>
    </section>
  );
};

export default QuickFilters;

