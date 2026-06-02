import { motion } from "framer-motion";

const stats = [
  { value: "50,000+", label: "Happy Visitors" },
  { value: "4.8 ⭐", label: "Average Rating" },
  { value: "10+ Years", label: "Experience" },
];

const testimonials = [
  {
    text: "Best water park experience ever! Clean, fun, and well managed.",
  },
  {
    text: "Amazing rides and super friendly staff. Loved every moment!",
  },
  {
    text: "Perfect place for family and friends. Highly recommended!",
  },
];

export default function Trust() {
  return (
    <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-[#020617] to-[#041025]">

      {/* 🔥 Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-semibold text-center text-white mb-20"
      >
        Trusted by <span className="text-cyan-400">Thousands</span>
      </motion.h2>

      {/* 📊 Stats */}
      <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto text-center mb-20">
        {stats.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl py-10 hover:border-cyan-400 transition"
          >
            <h3 className="text-3xl font-bold text-white">
              {item.value}
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 💬 Testimonials */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-cyan-400 transition"
          >
            <p className="text-gray-300 italic text-sm leading-relaxed">
              "{t.text}"
            </p>

            <div className="mt-4 text-cyan-400 text-sm font-semibold">
              ★★★★★
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}