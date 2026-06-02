import { motion } from "framer-motion";

export default function Transition() {
  return (
    <section className="relative py-16 md:py-24 md:py-32 overflow-hidden bg-gradient-to-b from-blue-50 via-sky-100 to-blue-50 text-gray-900">

      {/* 🌊 soft water glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-300/30 blur-[160px]"></div>

      {/* 💧 subtle “wave” lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_0%,#22d3ee_0%,transparent_60%)]"></div>
      </div>

      {/* 📝 Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-semibold leading-tight"
        >
          Why Let the Day End Here?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-lg text-gray-600 leading-relaxed"
        >
          When the rides slow down and the sun begins to set…  
          the experience doesn’t have to stop.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-lg text-gray-600 leading-relaxed"
        >
          Stay a little longer. Relax. Enjoy the calm after the splash.
        </motion.p>

        {/* ✨ CTA hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10"
        >
          <span className="inline-block px-6 py-3 rounded-full bg-white/70 backdrop-blur-md border border-white/40 shadow text-sm font-medium">
            Discover the Resort Experience ↓
          </span>
        </motion.div>

      </div>

      {/* 🌊 bottom fade into resort */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-transparent to-white"></div>
    </section>
  );
}