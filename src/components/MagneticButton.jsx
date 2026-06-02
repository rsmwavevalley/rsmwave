import { motion } from "framer-motion";

export default function MagneticButton({ children }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 rounded-full text-white font-semibold"
    >
      {children}
    </motion.button>
  );
}