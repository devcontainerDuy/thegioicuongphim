import { motion } from "framer-motion";

/**
 * TypingAnimation - Typewriter effect animation
 * Inspired by ReactBits
 */
const TypingAnimation = ({ 
  text = "",
  delay = 0,
  speed = 0.05,
  className = "",
  cursorClassName = ""
}) => {
  const characters = text.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed,
        delayChildren: delay
      }
    }
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.1
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
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={child}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className={cursorClassName || "ml-1 w-[2px] h-[1em] bg-current"}
      />
    </motion.div>
  );
};

export default TypingAnimation;
