import { motion } from "framer-motion";

const FadeContent = ({ children, delay = 0, blur = false, duration = 0.5, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95, filter: blur ? "blur(10px)" : "blur(0px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeContent;
