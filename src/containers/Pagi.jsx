import React from "react";
import { Pagination } from "react-bootstrap";

function Pagi({ current, total, handle }) {
  return (
    <>
      <Pagination className="justify-content-center mt-2" >
        <Pagination.First linkClassName="text-danger" onClick={() => handle(1)} disabled={current === 1} />
        <Pagination.Prev linkClassName="text-danger" onClick={() => handle(current > 1 ? current - 1 : 1)} disabled={current === 1} />
        {current > 3 && (
          <>
            <Pagination.Item linkClassName="text-danger" onClick={() => handle(1)}>1</Pagination.Item>
            <Pagination.Ellipsis linkClassName="text-danger" />
          </>
        )}

        {current > 1 && <Pagination.Item linkClassName="text-danger" onClick={() => handle(current - 1)}>{current - 1}</Pagination.Item>}
        <Pagination.Item active linkClassName="text-bg-danger border-danger">
          {current}
        </Pagination.Item>
        {current < total && <Pagination.Item linkClassName="text-danger" onClick={() => handle(current + 1)}>{current + 1}</Pagination.Item>}

        {current < total - 2 && (
          <>
            <Pagination.Ellipsis linkClassName="text-danger" />
            <Pagination.Item linkClassName="text-danger" onClick={() => handle(total)}>{total}</Pagination.Item>
          </>
        )}
        <Pagination.Next linkClassName="text-danger" onClick={() => handle(current < total ? current + 1 : total)} disabled={current === total} />
        <Pagination.Last linkClassName="text-danger" onClick={() => handle(total)} disabled={current === total} />
      </Pagination>
    </>
  );
}

export default Pagi;
