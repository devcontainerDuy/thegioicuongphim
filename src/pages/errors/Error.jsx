import React from "react";
import Template from "components/layout/Template";

function Error() {
  return (
    <Template>
      <main className="pt-5">
        <div className="container">
          <div className="row">
            <div className="col m-auto">
              <h3 className="text-center text-danger">404 Not Found</h3>
            </div>
          </div>
        </div>
      </main>
    </Template>
  );
}

export default Error;
