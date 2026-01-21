import { motion } from "framer-motion";

/**
 * RotateWords - Rotating words animation
 * Inspired by ReactBits
 */
const RotateWords = ({ 
  words = [],
  duration = 2.5,
  className = ""
}) => {
  if (!words.length) return null;

  return (
    <div className={className} style={{ display: "inline-block", position: "relative" }}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={{
            opacity: index === 0 ? [0, 1, 1, 0] : 0,
            y: index === 0 ? [20, 0, 0, -20] : 20,
            rotateX: index === 0 ? [-90, 0, 0, 90] : -90
          }}
          transition={{
            duration: duration * words.length,
            repeat: Infinity,
            delay: index * duration,
            ease: "easeInOut"
          }}
          style={{
            display: index === 0 ? "inline-block" : "none",
            position: index === 0 ? "relative" : "absolute",
            transformOrigin: "center"
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

export default RotateWords;
