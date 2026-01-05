import { motion } from "framer-motion";

/**
 * HoverScale Animation Component
 * Scales element on hover with smooth transition
 */
const HoverScale = ({ 
  children, 
  scale = 1.05,
  duration = 0.3,
  className = "" 
}) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.95 }}
      transition={{ 
        duration, 
        ease: [0.25, 0.4, 0.25, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default HoverScale;
