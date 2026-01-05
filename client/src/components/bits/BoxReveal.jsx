import { motion } from "framer-motion";

/**
 * BoxReveal - Box sliding reveal animation
 * Inspired by ReactBits
 */
const BoxReveal = ({ 
  children,
  width = "fit-content",
  duration = 0.5,
  delay = 0,
  boxColor = "hsl(var(--primary))",
  className = ""
}) => {
  return (
    <div style={{ position: "relative", width, overflow: "hidden" }} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ 
          duration: duration * 0.8, 
          delay: delay + duration * 0.5,
          ease: [0.25, 0.4, 0.25, 1]
        }}
      >
        {children}
      </motion.div>
      
      {/* Sliding box overlay */}
      <motion.div
        initial={{ left: 0 }}
        whileInView={{ left: "100%" }}
        viewport={{ once: true }}
        transition={{
          duration,
          delay,
          ease: [0.65, 0, 0.35, 1]
        }}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "100%",
          background: boxColor,
          zIndex: 1
        }}
      />
    </div>
  );
};

export default BoxReveal;
