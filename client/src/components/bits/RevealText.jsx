import { motion } from "framer-motion";

/**
 * RevealText - Text reveals character by character with blur
 * Inspired by ReactBits
 */
const RevealText = ({ 
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
        staggerChildren: 0.03,
        delayChildren: delay
      }
    }
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 10,
      filter: "blur(4px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        ease: [0.25, 0.4, 0.25, 1]
      }
    }
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
      style={{ display: "inline-block" }}
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
    </motion.span>
  );
};

export default RevealText;
