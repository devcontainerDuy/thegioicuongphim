import { motion } from "framer-motion";

const FadeContent = ({ children, delay = 0, blur = false, duration = 0.5, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: duration / 1000, delay: delay / 1000, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeContent;
