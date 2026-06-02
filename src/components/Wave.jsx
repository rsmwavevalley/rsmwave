import { motion } from "framer-motion";

export default function Wave() {
  return (
    <div className="w-full overflow-hidden leading-none">
      <motion.svg
        viewBox="0 0 1440 150"
        className="w-full h-24"
        preserveAspectRatio="none"
        animate={{ x: [0, -100, 0] }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
        }}
      >
        <path
          fill="#021a2e"
          d="M0,64L80,80C160,96,320,128,480,122.7C640,117,800,75,960,74.7C1120,75,1280,117,1360,138.7L1440,160V0H0Z"
        ></path>
      </motion.svg>
    </div>
  );
}