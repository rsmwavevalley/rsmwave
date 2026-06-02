import Hero from "../sections/Hero";
import Rides from "../sections/Rides";
import Resort from "../sections/Resort";
import Gallery from "../sections/Gallery";
import Booking from "../sections/Booking";
import CTA from "../sections/CTA";
import Footer from "../sections/Footer";
// import Wave from "../components/Wave";

export default function Home() {
  return (
    <div
      id="home"
      className="relative text-white overflow-x-hidden w-full bg-[#021a2e]"
    >
      {/* 🌊 LIGHT GLOBAL GLOW */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[280px] h-[280px] bg-cyan-400/10 blur-[70px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[280px] h-[280px] bg-blue-500/10 blur-[70px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* 🔥 HERO */}
        <Hero />

        {/* HERO → RIDES */}
        <div className="h-12 bg-gradient-to-b from-black/40 to-[#021a2e]" />

        {/* 🎢 RIDES */}
        <section className="py-16 md:py-20 bg-[#03273f]">
          <Rides />
        </section>

        {/* 🌊 WAVE */}
        {/* <Wave /> */}

        {/* 🌴 RESORT */}
        <section className="py-16 md:py-20 bg-[#e6f7ff] text-gray-900">
          <Resort />
        </section>

        {/* 🔥 RESORT → GALLERY */}
        <div className="h-12 bg-gradient-to-b from-[#e6f7ff] to-[#03273f]" />

        {/* 📸 GALLERY (THIS WAS MISSING) */}
        <Gallery />

        {/* 🔥 GALLERY → BOOKING */}
        <div className="h-12 bg-gradient-to-b from-[#03273f] to-[#021a2e]" />

        {/* 📅 BOOKING */}
        <Booking />

        {/* 📍 CTA */}
        <CTA />

        {/* 🧾 FOOTER */}
        <Footer />
      </div>
    </div>
  );
}