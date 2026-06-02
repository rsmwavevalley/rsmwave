import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function OfferSection() {
  const ref = useRef();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // 🎥 background zoom effect
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  // ✨ text fade + lift
  const y = useTransform(scrollYProgress, [0, 1], [80, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 1, 1]);

  return (
    <section
      ref={ref}
      className="relative h-[70vh] md:h-[85vh] flex items-center justify-center text-center overflow-hidden"
    >
      {/* 🎥 BACKGROUND */}
      <motion.img
        style={{ scale }}
        src="/offer-bg.png"
        alt="Offer"
        className="absolute w-full h-full object-cover"
      />

      {/* 🌑 overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-[#03273f]" />

      {/* 🌊 glow */}
      <div className="absolute top-[-80px] left-[-80px] w-[350px] h-[350px] bg-cyan-400/20 blur-[140px]" />
      <div className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[350px] bg-blue-400/20 blur-[140px]" />

      {/* ✨ CONTENT */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 px-6 max-w-3xl"
      >
        {/* LOGO */}
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          src="/rsm-logo.png"
          alt="RSM"
          className="mx-auto mb-6 w-32 md:w-40 drop-shadow-lg"
        />

        {/* HEADING */}
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight"
        >
          Dive Into{" "}
          <span className="text-cyan-400">Unmatched Excitement</span>
        </motion.h2>

        {/* TEXT */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 mb-6"
        >
          Resort Opening Offer — Experience thrill, splash & luxury like never before.
        </motion.p>

        {/* OFFER */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl md:text-4xl font-bold text-white mb-8"
        >
          Flat <span className="text-cyan-400">30% OFF</span>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.1 }}
          className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-8 py-3 rounded-full font-semibold shadow-lg"
        >
          Book Now
        </motion.button>
      </motion.div>

      {/* 🔥 bottom blend */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-b from-transparent to-[#021a2e]" />
    </section>
  );
}