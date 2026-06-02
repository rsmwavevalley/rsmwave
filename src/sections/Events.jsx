import { motion } from "framer-motion";

export default function Events() {
  const events = [
    {
      title: "Foam Party",
      desc: "Dance, splash & vibe with DJ + foam madness",
      image: "/events/foam.jpg",
      badge: "🔥 Live",
    },
    {
      title: "Rain Dance",
      desc: "Feel the beats under artificial rain",
      image: "/events/rain.jpg",
      badge: "💃 Popular",
    },
    {
      title: "Night Glow Show",
      desc: "Lights, music & water like never before",
      image: "/events/night.jpg",
      badge: "🌙 Night",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-6 bg-[#021a2e] relative overflow-hidden">

      {/* 🌊 subtle glow */}
      <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] bg-cyan-400/10 blur-[120px]" />

      {/* 🔥 Heading */}
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
          Events &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
            Experiences
          </span>
        </h2>

        <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm md:text-base">
          Feel the energy, music, and unforgettable moments beyond just rides.
        </p>
      </div>

      {/* 🎴 Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">

        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative rounded-2xl overflow-hidden group cursor-pointer"
          >

            {/* 📸 Image */}
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-64 md:h-72 object-cover transition duration-700 group-hover:scale-110"
            />

            {/* 🌑 Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* 💎 Glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-cyan-400/10 blur-2xl transition" />

            {/* 🔥 Badge */}
            <div className="absolute top-4 left-4 bg-cyan-400 text-black text-xs font-bold px-3 py-1 rounded-full">
              {event.badge}
            </div>

            {/* 📝 Content */}
            <div className="absolute bottom-0 p-5 md:p-6 text-left">
              <h3 className="text-lg md:text-xl font-semibold text-white">
                {event.title}
              </h3>

              <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                {event.desc}
              </p>

              {/* 👉 CTA */}
              <div className="mt-3 text-cyan-400 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                Explore →
              </div>
            </div>

            {/* 💡 Border */}
            <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-cyan-400/60 transition" />

          </motion.div>
        ))}

      </div>
    </section>
  );
}