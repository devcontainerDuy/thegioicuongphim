import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

function Template({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}

export default Template;
