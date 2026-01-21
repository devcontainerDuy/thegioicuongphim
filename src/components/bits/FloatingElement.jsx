import { motion } from "framer-motion";

/**
 * FloatingElement Animation Component
 * Creates subtle floating/breathing effect
 */
const FloatingElement = ({ 
  children, 
  duration = 3,
  yOffset = 10,
  xOffset = 0,
  className = "" 
}) => {
  return (
    <motion.div
      animate={{
        y: [0, -yOffset, 0],
        x: [0, xOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElement;
