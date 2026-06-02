import React from "react";
import { motion } from "framer-motion";

export default function CTA() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const mapVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  return (
    <section id="location" className="relative py-20 md:py-32 px-6 overflow-hidden bg-gradient-to-b from-white via-[#f0f7ff] to-[#e6f0ff]">
      {/* 🌊 Subtle Decorative Elements for "Wave" theme */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-50 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="text-center mb-16">
          <motion.div variants={itemVariants} className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 text-sm font-bold tracking-wide uppercase">
              Plan Your Visit
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight"
          >
            Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">RSM Wave Valley</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Ready for an unforgettable day? Plan your visit, get instant directions, or reach out to our team today.
          </motion.p>
        </div>

        {/* 📍 MAP CONTAINER */}
        <motion.div
          variants={mapVariants}
          className="relative group rounded-3xl overflow-hidden mb-16 shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-white/50 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
         <iframe
    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3550.4719799943273!2d82.03628957544744!3d27.14143637651155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDA4JzI5LjIiTiA4MsKwMDInMTkuOSJF!5e0!3m2!1sen!2sin!4v1777644412928!5m2!1sen!2sin"
    className="w-full h-[350px] md:h-[500px] border-0 
    grayscale-[0.3] hover:grayscale-0 
    transition-all duration-700 hover:scale-[1.02]"
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    title="RSM Wave Valley Location"
  />
          
          {/* Floating Address Card (Desktop) */}
          <div className="hidden md:block absolute bottom-8 left-8 z-20 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-blue-50 max-w-xs transform group-hover:-translate-y-2 transition-transform duration-500">
            <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">Location</p>
            <h3 className="text-slate-900 font-bold text-lg mb-1">Gonda, Uttar Pradesh</h3>
            <p className="text-slate-500 text-sm">Find us at the heart of the valley for your next adventure.</p>
          </div>
        </motion.div>

        {/* 📞 ACTION GRID */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6"
        >
          {/* Call Card */}
          <motion.a
  whileHover={{ y: -5, scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  href="tel:+919335561261"
  className="flex items-center justify-center gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-200 hover:shadow-md transition-all"
>
  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
    <span className="text-xl">📞</span>
  </div>
  <div className="text-left">
    <p className="text-xs text-slate-500 font-medium uppercase">Call Now</p>
    <p className="text-slate-900 font-bold">+91 9335561261</p>
  </div>
</motion.a>
          {/* WhatsApp Card */}
          <motion.a
  whileHover={{ y: -5, scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  href="https://wa.me/919335561261"
  target="_blank"
  rel="noopener noreferrer"
  title="Chat on WhatsApp"
  className="flex items-center justify-center gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group hover:border-green-200 hover:shadow-md transition-all"
>
  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
    <span className="text-xl">💬</span>
  </div>
  <div className="text-left">
    <p className="text-xs text-slate-500 font-medium uppercase">WhatsApp</p>
    <p className="text-slate-900 font-bold">Chat with us</p>
  </div>
</motion.a>

          {/* Directions Card */}
          <motion.a
  whileHover={{ y: -5, scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  href="https://www.google.com/maps?q=27.1414364,82.0362896"
  target="_blank"
  rel="noopener noreferrer"
  title="Open in Google Maps"
  className="flex items-center justify-center gap-3 bg-blue-600 p-5 rounded-2xl shadow-lg shadow-blue-200 group hover:bg-blue-700 transition-all"
>
  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
    <span className="text-xl">📍</span>
  </div>
  <div className="text-left">
    <p className="text-xs text-blue-100 font-medium uppercase">Navigation</p>
    <p className="text-white font-bold">Get Directions</p>
  </div>
</motion.a>
        </motion.div>

        {/* Mobile Address */}
        <motion.p 
          variants={itemVariants}
          className="md:hidden mt-10 text-slate-400 text-sm text-center"
        >
          📍 Gonda, Uttar Pradesh
        </motion.p>

      </motion.div>
    </section>
  );
}
