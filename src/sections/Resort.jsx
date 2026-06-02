import { motion } from "framer-motion";

export default function Resort() {
  return (
    <section id="resort" className="relative bg-gradient-to-b from-sky-100 via-blue-50 to-white text-gray-900 overflow-hidden">

      {/* 🌊 subtle water glow */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-cyan-300/20 blur-[120px]"></div>

      {/* 🔥 SECTION 1 — HERO */}
      <div className="relative h-[80vh] w-full overflow-hidden">

        <img
          src="/resort.jpeg"
          alt="Resort"
          className="w-full h-full object-cover brightness-90 contrast-110"
        />

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">

          <h2 className="text-3xl md:text-6xl font-semibold text-white leading-tight">
            Stay Where the Splash <br />
            Turns Into Serenity
          </h2>

          <p className="text-gray-200 mt-4 max-w-2xl text-lg">
            From thrilling days to peaceful nights — experience comfort beyond the park.
          </p>

          <div className="mt-8 flex gap-5 flex-wrap justify-center">

            <button className="bg-cyan-400 text-black px-7 py-3 rounded-full font-semibold hover:scale-110 hover:shadow-[0_0_20px_#22d3ee] transition">
              Explore Resort
            </button>

            <button className="border border-white px-7 py-3 rounded-full text-white hover:bg-white hover:text-black transition">
              Book Stay
            </button>

          </div>
        </div>
      </div>

      {/* 💎 SECTION 2 — FEATURE LEFT */}
      <div className="py-16 md:py-24 px-6 md:px-20 flex flex-col md:flex-row items-center gap-12">

        <img
          src="/room.jpeg"
          alt="Room"
          className="w-full md:w-1/2 rounded-2xl shadow-xl hover:scale-105 transition duration-500 object-cover"
        />

        <div className="md:w-1/2">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Wake Up to Calm Views
          </h3>

          <p className="text-gray-600 text-lg leading-relaxed">
            Spacious rooms, natural lighting, and peaceful surroundings designed
            to help you relax after a day full of fun and adventure.
          </p>
        </div>
      </div>

      {/* 💎 SECTION 3 — FEATURE RIGHT */}
      <div className="py-16 md:py-24 px-6 md:px-20 flex flex-col md:flex-row-reverse items-center gap-12">

        <img
          src="/bathroom.jpg"
          alt="Bathroom"
          className="w-full md:w-1/2 rounded-2xl shadow-xl hover:scale-105 transition duration-500 object-cover"
        />

        <div className="md:w-1/2">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Designed for Pure Comfort
          </h3>

          <p className="text-gray-600 text-lg leading-relaxed">
            Premium interiors, modern amenities, and a relaxing atmosphere that
            makes your stay as enjoyable as the adventure.
          </p>
        </div>
      </div>

      {/* 🎯 SECTION 4 — GLASS FEATURE CARDS */}
      <div className="py-16 md:py-24 px-6 md:px-20 grid md:grid-cols-3 gap-8">

        {["Poolside Nights", "Dining Experience", "Event Spaces"].map((item, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-6 text-center hover:shadow-2xl hover:scale-105 transition duration-300"
          >
            <h4 className="text-xl font-semibold">{item}</h4>
            <p className="text-gray-500 mt-2 text-sm">
              Experience comfort and luxury with our premium offerings.
            </p>
          </div>
        ))}

      </div>

      {/* 🎉 SECTION 5 — EVENTS */}
      <div className="relative h-[70vh] w-full">

        <img
          src="/event.png"
          alt="Event"
          className="w-full h-full object-cover brightness-90"
        />

        <div className="absolute inset-0 bg-black/70"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">

          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Make Every Celebration Unforgettable
          </h2>

          <p className="text-gray-200 mt-4 max-w-xl text-lg">
            From weddings to private parties — create unforgettable memories in a perfect setting.
          </p>

          <button className="mt-6 bg-cyan-400 text-black px-6 py-3 rounded-full font-semibold hover:scale-110 hover:shadow-[0_0_20px_#22d3ee] transition">
            Plan Your Event
          </button>

        </div>
      </div>

    </section>
  );
}