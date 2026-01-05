import { motion } from "framer-motion";
import { useState } from "react";

/**
 * ShinyText - Shimmering/shiny text effect
 * Inspired by ReactBits
 */
const ShinyText = ({ 
  text = "",
  speed = 5,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ backgroundPosition: "200% center" }}
      animate={{ backgroundPosition: "-200% center" }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "linear"
      }}
      className={className}
      style={{
        background: "linear-gradient(90deg, currentColor 0%, rgba(255,255,255,0.8) 50%, currentColor 100%)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "inline-block"
      }}
    >
      {text}
    </motion.div>
  );
};

export default ShinyText;
