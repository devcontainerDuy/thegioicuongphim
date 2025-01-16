import { useEffect, useState } from "react";
import Header from "components/common/Header";
import Footer from "components/common/Footer";
import { useLocation } from "react-router-dom";
import Spinner from "containers/Spinner";

function Template({ children }) {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <Header />
      <main className="py-3">{children}</main>
      <Footer />
    </>
  );
}

export default Template;
