import { useMemo } from "react";
import { Container } from "react-bootstrap";
import HeroCarousel from "components/home/HeroCarousel";
import { heroSlides } from "data/content/heroSlides";

function Nav() {
  const slides = useMemo(() => heroSlides, []);

  return (
    <Container as="section" className="mt-5">
      <HeroCarousel slides={slides} autoplayDelay={4000} />
    </Container>
  );
}

export default Nav;
