// import { motion, useScroll, useTransform } from "framer-motion";

// export default function Hero() {
//   const { scrollY } = useScroll();

//   const videoY = useTransform(scrollY, [0, 600], [0, -120]);
//   const textY = useTransform(scrollY, [0, 600], [0, 80]);

//   return (
//     <section className="relative min-h-screen w-full overflow-hidden">

//       {/* 🎥 Background Video */}
//       <motion.video
//         style={{ y: videoY }}
//         autoPlay
//         loop
//         muted
//         playsInline
//         className="absolute w-full h-full object-cover"
//       >
//         <source src="/waterpark.mp4" type="video/mp4" />
//       </motion.video>

//       {/* 🌊 Light overlay for readability */}
//       <div className="absolute inset-0 bg-gradient-to-t from-[#021a2e]/70 via-transparent to-transparent" />

//       {/* 🌟 Content */}
//       <motion.div
//         style={{ y: textY }}
//         className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6"
//       >
//         {/* 🔥 Heading */}
//         <motion.h1
//           initial={{ opacity: 0, y: 60 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1 }}
//           className="text-3xl md:text-6xl lg:text-7xl font-semibold leading-tight text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
//         >
//           Dive Into the{" "}
//           <span className="text-cyan-400">Splash</span>
//         </motion.h1>

//         {/* ✨ Subtext */}
//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.4 }}
//           className="mt-6 text-gray-200 text-base md:text-lg max-w-xl leading-relaxed"
//         >
//           Feel the rush, the laughter, and the moments you’ll never forget —
//           all in one place.
//         </motion.p>

//         {/* 🚀 Buttons */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.7 }}
//           className="mt-8 flex gap-4 flex-col sm:flex-row"
//         >
//           <button className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-7 py-3 rounded-full font-medium transition hover:scale-105 hover:shadow-[0_0_20px_#22d3ee]">
//   Book Your Day
// </button>
//           <button className="border border-white/30 px-8 py-3 rounded-full text-white hover:bg-white hover:text-black transition">
//             Watch Experience
//           </button>
//         </motion.div>
//       </motion.div>

//       {/* 🔽 Scroll indicator */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1 }}
//         className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white text-xl"
//       >
//         ↓
//       </motion.div>

//       {/* 🌫️ Blend BEFORE wave (IMPORTANT FIX) */}
//       <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#021a2e] to-transparent z-10" />

//       {/* 🌊 Premium Wave */}
//       <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
//         <svg
//           viewBox="0 0 1440 320"
//           className="w-full h-[110px]"
//           preserveAspectRatio="none"
//         >
//           <path
//             fill="#021a2e"
//             d="M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,218.7C1120,213,1280,171,1360,149.3L1440,128V320H0Z"
//           />
//         </svg>
//       </div>

//     </section>
//   );
// }

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const [canPlayVideo, setCanPlayVideo] = useState(false);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    // ✅ Allow video only if connection is good
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!mobile) {
      setCanPlayVideo(true); // desktop always
    } else if (connection) {
      // play video only on good network
      if (connection.effectiveType === "4g") {
        setCanPlayVideo(true);
      } else {
        setCanPlayVideo(false);
      }
    } else {
      // fallback (allow on modern devices)
      setCanPlayVideo(true);
    }
  }, []);

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden">

      {/* 🎥 VIDEO (ONLY WHEN SAFE) */}
      {canPlayVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="absolute w-full h-full object-cover"
        >
          <source src="/waterpark.mp4" type="video/mp4" />
        </video>
      ) : (
        <img
          src="/wavepool.webp"
          alt="Water Park"
          className="absolute w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* 🌊 Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#021a2e]/80 via-black/20 to-black/10" />

      {/* 🌟 Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] text-center px-6">

        {/* Logo */}
        <motion.img
          src="/rsm-wave-valley-logo.png"
          alt="RSM Wave Valley"
          className="w-32 h-32 md:w-56 md:h-56 object-contain mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        />

        <h1 className="text-4xl md:text-8xl font-black text-white">
          RSM
        </h1>

        <h2 className="text-2xl md:text-6xl font-bold text-cyan-400 -mt-2">
          Wave Valley
        </h2>

        <p className="text-sm md:text-lg text-cyan-300 mt-3 tracking-wider">
          WATER PARK & RESORT
        </p>

        <div className="mt-8">
          {/* <button className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition">
            Book Your Day
          </button> */}
        </div>
      </div>

      {/* Bottom blend */}
      <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-[#021a2e] to-transparent" />
    </section>
  );
}