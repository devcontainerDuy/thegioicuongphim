import { motion } from "framer-motion";

/**
 * FlipText - Flipping text animation 
 * Inspired by ReactBits
 */
const FlipText = ({ 
  text = "",
  delay = 0,
  duration = 0.5,
  className = ""
}) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay
      }
    }
  };

  const child = {
    hidden: {
      rotateX: -90,
      opacity: 0
    },
    visible: {
      rotateX: 0,
      opacity: 1,
      transition: {
        duration,
        ease: [0.25, 0.4, 0.25, 1]
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
      style={{ display: "flex", flexWrap: "wrap", gap: "0.25em", perspective: "1000px" }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          style={{ 
            display: "inline-block",
            transformOrigin: "bottom"
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default FlipText;
