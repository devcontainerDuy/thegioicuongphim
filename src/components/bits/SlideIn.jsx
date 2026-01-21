import { motion } from "framer-motion";

/**
 * SlideIn Animation Component
 * Slides element in from specified direction
 */
const SlideIn = ({ 
  children, 
  delay = 0, 
  duration = 0.6,
  direction = "left", // left, right, top, bottom
  distance = 100,
  className = "" 
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "left":
        return { x: -distance, y: 0 };
      case "right":
        return { x: distance, y: 0 };
      case "top":
        return { x: 0, y: -distance };
      case "bottom":
        return { x: 0, y: distance };
      default:
        return { x: -distance, y: 0 };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.4, 0.25, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SlideIn;
