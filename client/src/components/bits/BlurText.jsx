import { motion } from "framer-motion";

const BlurText = ({ text = "", delay = 0, className = "" }) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i + delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 90,
        mass: 1.2,
      },
    },
    hidden: {
      opacity: 0,
      filter: "blur(20px)",
      y: 20,
    },
  };

  return (
    <motion.h1
      style={{ display: "flex", flexWrap: "wrap", columnGap: "0.2em" }} // Ensuring gap between words
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={child}>
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default BlurText;
