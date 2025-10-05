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
          <h5 className="mb-1 fw-bold text-uppercase text-danger">Browse by genre</h5>
          <p className="mb-0 text-body-secondary">Jump into a theme that matches your mood today.</p>
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
