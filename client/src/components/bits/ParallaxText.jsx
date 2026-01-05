import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * ParallaxText Animation Component
 * Creates parallax scrolling effect for text/elements
 */
const ParallaxText = ({ 
  children, 
  speed = 50,
  direction = "up", // up, down
  className = "" 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "up" ? [speed, -speed] : [-speed, speed]
  );

  return (
    <motion.div
      ref={ref}
      style={{ y }}
     className={className}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxText;
