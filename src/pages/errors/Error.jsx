import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

function Error() {
  return (
    <>
      <Header />
      <main className="pt-5">
        <div className="container">
          <div className="row">
            <div className="col m-auto">
              <h3 className="text-center text-danger">404 Not Found</h3>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Error;
