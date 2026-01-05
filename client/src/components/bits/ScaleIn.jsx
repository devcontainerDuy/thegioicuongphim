import { motion } from "framer-motion";

/**
 * ScaleIn Animation Component
 * Scales element from small to normal size with fade in
 */
const ScaleIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  initialScale = 0.8,
  className = "" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
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

export default ScaleIn;
