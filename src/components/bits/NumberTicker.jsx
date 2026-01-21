import { motion } from "framer-motion";

/**
 * NumberTicker - Animated number counting up
 * Inspired by ReactBits
 */
const NumberTicker = ({ 
  value = 0,
  duration = 2,
  delay = 0,
  className = ""
}) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay
      }
    }
  };

  return (
    <motion.span
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration,
          delay,
          ease: "easeOut"
        }}
        onViewportEnter={(entry) => {
          if (entry?.target) {
            let currentValue = 0;
            const increment = value / (duration * 60); // 60 fps
            const timer = setInterval(() => {
              currentValue += increment;
              if (currentValue >= value) {
                currentValue = value;
                clearInterval(timer);
              }
              if (entry.target) {
                entry.target.textContent = Math.floor(currentValue).toLocaleString();
              }
            }, 1000 / 60);
          }
        }}
      >
        0
      </motion.span>
    </motion.span>
  );
};

export default NumberTicker;
