import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 FINAL SCROLL FIX (LENIS COMPATIBLE)
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    // ✅ If Lenis exists → use it
    if (window.lenis) {
      window.lenis.scrollTo(el, {
        offset: -90,
      });
    } else {
      // fallback
      const yOffset = -90;
      const y =
        el.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        top: y,
        behavior: "auto",
      });
    }

    setOpen(false);
  };

  return (
    <>
      {/* 🔥 NAVBAR */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/5 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-20 py-4 flex justify-between items-center">

          {/* LOGO */}
          <h1 className="text-xl md:text-2xl font-semibold text-white tracking-wide">
            RSM <span className="text-cyan-400">Wave Valley</span>
          </h1>

          {/* 🧭 DESKTOP MENU */}
          <div className="hidden md:flex gap-8 text-sm text-white/70">
            {[
              { name: "Home", id: "home" },
              { name: "Rides", id: "rides" },
              { name: "Gallery", id: "gallery" },
              { name: "Contact", id: "contact" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => handleScrollTo(item.id)}
                className="relative group hover:text-white transition"
              >
                {item.name}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </div>

          {/* 🚀 CTA */}
          <button
            onClick={() => handleScrollTo("booking")}
            className="hidden md:block bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-7 py-3 rounded-full font-medium transition hover:scale-105 hover:shadow-[0_0_20px_#22d3ee]"
          >
            Book Now
          </button>

          {/* 📱 MOBILE BUTTON */}
          <div
            className="md:hidden text-white text-2xl cursor-pointer"
            onClick={() => setOpen(true)}
          >
            ☰
          </div>
        </div>
      </motion.nav>

      {/* 🔥 OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 📱 MOBILE MENU */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: open ? "0%" : "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 right-0 w-full h-full bg-[#021a2e]/95 backdrop-blur-xl z-50 p-6 md:hidden"
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-white text-xl font-semibold">Menu</h2>
          <button onClick={() => setOpen(false)} className="text-white text-2xl">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-6 text-white text-lg">
          {[
            { name: "Home", id: "home" },
            { name: "Rides", id: "rides" },
            { name: "Gallery", id: "gallery" },
            { name: "Contact", id: "contact" },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => handleScrollTo(item.id)}
              className="text-left"
            >
              {item.name}
            </button>
          ))}

          {/* CTA MOBILE */}
          <button
            onClick={() => handleScrollTo("contact")}
            className="mt-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-7 py-3 rounded-full font-medium"
          >
            Book Now
          </button>
        </div>
      </motion.div>
    </>
  );
}