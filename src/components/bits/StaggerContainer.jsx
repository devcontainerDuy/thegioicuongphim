import { motion } from "framer-motion";

/**
 * StaggerContainer Animation Component
 * Staggers animation of child elements
 */
const StaggerContainer = ({ 
  children, 
  delay = 0,
  staggerDelay = 0.1,
  className = "" 
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerItem - Use as child of StaggerContainer
 */
export const StaggerItem = ({ children, className = "" }) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        ease: [0.25, 0.4, 0.25, 1]
      }
    }
  };

  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
};

export default StaggerContainer;
