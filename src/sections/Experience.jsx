import { motion } from "framer-motion";

const steps = [
  {
    title: "Arrive",
    desc: "Step into a world of water, fun, and excitement.",
    icon: "🚗",
  },
  {
    title: "Ride",
    desc: "Experience thrilling slides and wave pools.",
    icon: "🎢",
  },
  {
    title: "Relax",
    desc: "Float through lazy rivers and chill zones.",
    icon: "🌴",
  },
  {
    title: "Celebrate",
    desc: "Make unforgettable memories with friends & family.",
    icon: "🎉",
  },
];

export default function Experience() {
  return (
    <section className="py-16 md:py-24 px-6 bg-[#021a2e] relative overflow-hidden">

      {/* 🌊 Background Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-400/10 blur-[120px]"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400/10 blur-[120px]"></div>

      {/* 🔥 Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="text-3xl md:text-5xl font-bold text-center text-white mb-14 md:mb-20"
      >
        Your Perfect{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Day
        </span>
      </motion.h2>

      {/* 📍 Timeline */}
      <div className="relative max-w-5xl mx-auto">

        {/* 🟦 Center Line (desktop only) */}
        <div className="hidden md:block absolute left-1/2 top-0 h-full w-[2px] bg-white/10 -translate-x-1/2"></div>

        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            viewport={{ once: true }}
            className={`
              mb-10
              flex flex-col items-center text-center
              md:flex-row md:text-left md:justify-between
              ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}
            `}
          >

            {/* 📝 Card */}
            <div className="
              w-full md:w-[45%]
              bg-white/5 backdrop-blur-xl
              border border-white/10
              rounded-2xl p-5 md:p-6
              shadow-md
              hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]
              transition
            ">
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                {step.title}
              </h3>

              <p className="text-gray-300 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>

            {/* 🔵 Icon */}
            <div className="
              my-4 md:my-0
              md:absolute md:left-1/2 md:-translate-x-1/2
              w-12 h-12 flex items-center justify-center
              rounded-full bg-cyan-400 text-black font-bold
              shadow-[0_0_20px_#22d3ee]
            ">
              {step.icon}
            </div>

            {/* Spacer */}
            <div className="hidden md:block w-[45%]"></div>

          </motion.div>
        ))}

      </div>
    </section>
  );
}