import React from "react";
import { Pagination } from "react-bootstrap";

function Pagi({ current, total, handle }) {
	return (
		<>
			<Pagination className="justify-content-center mt-2">
				<Pagination.First onClick={() => handle(1)} disabled={current === 1} />
				<Pagination.Prev onClick={() => handle(current > 1 ? current - 1 : 1)} disabled={current === 1} />
				{current > 3 && (
					<>
						<Pagination.Item onClick={() => handle(1)}>1</Pagination.Item>
						<Pagination.Ellipsis />
					</>
				)}

				{current > 1 && <Pagination.Item onClick={() => handle(current - 1)}>{current - 1}</Pagination.Item>}
				<Pagination.Item active>{current}</Pagination.Item>
				{current < total && <Pagination.Item onClick={() => handle(current + 1)}>{current + 1}</Pagination.Item>}

				{current < total - 2 && (
					<>
						<Pagination.Ellipsis />
						<Pagination.Item onClick={() => handle(total)}>{total}</Pagination.Item>
					</>
				)}
				<Pagination.Next onClick={() => handle(current < total ? current + 1 : total)} disabled={current === total} />
				<Pagination.Last onClick={() => handle(total)} disabled={current === total} />
			</Pagination>
		</>
	);
}

export default Pagi;
