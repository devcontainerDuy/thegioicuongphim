import { motion } from "framer-motion";

/**
 * GradualSpacing - Text with gradually increasing letter spacing
 * Inspired by ReactBits
 */
const GradualSpacing = ({ 
  text = "",
  delay = 0,
  duration = 0.5,
  className = ""
}) => {
  const characters = text.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: delay
      }
    }
  };

  const child = {
    hidden: {
      opacity: 0,
      x: -20,
      letterSpacing: "0.1em"
    },
    visible: {
      opacity: 1,
      x: 0,
      letterSpacing: "0em",
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
      style={{ display: "flex" }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={child}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default GradualSpacing;
