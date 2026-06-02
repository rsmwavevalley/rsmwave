// import {
//   motion,
//   useScroll,
//   useTransform,
//   useMotionValueEvent,
// } from "framer-motion";
// import { useRef, useState, useCallback } from "react";

// const rides = [
//   {
//     name: "Wave Pool",
//     desc: "Surf-grade waves up to 6ft in our iconic main pool",
//     badge: "Most Popular",
//     stat: "6ft waves",
//     image: "/wavepool.jpg",
//     color: "#0a4a8f",
//   },
//   {
//     name: "Water Slides",
//     desc: "High-speed adrenaline slides reaching 60km/h — hold on tight!",
//     badge: "Adrenaline",
//     stat: "60km/h",
//     image: "/slides.jpg",
//     color: "#5e17eb",
//   },
//   {
//     name: "Kids Zone",
//     desc: "A magical splash playground built for tiny adventurers ages 2–12",
//     badge: "Family Fun",
//     stat: "100% safe",
//     image: "/kids.jpg",
//     color: "#c05c00",
//   },
//   {
//     name: "Lazy River",
//     desc: "Drift through 500m of scenic waterway — pure bliss",
//     badge: "Relaxation",
//     stat: "500m long",
//     image: "/lazyriver.jpg",
//     color: "#0a7c59",
//   },
// ];

// export default function Rides() {
//   const containerRef = useRef(null);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const dragStartX = useRef(0);
//   const dragScrollLeft = useRef(0);

//   const { scrollXProgress } = useScroll({
//   container: containerRef,
//   layoutEffect: false
// });

//   useMotionValueEvent(scrollXProgress, "change", (latest) => {
//     const index = Math.round(latest * (rides.length - 1));
//     setActiveIndex(index);
//   });

//   const scrollToIndex = useCallback((index) => {
//     const container = containerRef.current;
//     if (!container) return;
//     const cards = container.querySelectorAll(".ride-card");
//     if (!cards[index]) return;
//     const card = cards[index];
//     const containerCenter = container.clientWidth / 2;
//     const cardCenter = card.offsetLeft + card.clientWidth / 2;
//     container.scrollTo({ left: cardCenter - containerCenter, behavior: "smooth" });
//   }, []);

//   const onMouseDown = (e) => {
//     setIsDragging(true);
//     dragStartX.current = e.pageX - containerRef.current.offsetLeft;
//     dragScrollLeft.current = containerRef.current.scrollLeft;
//   };
//   const onMouseMove = (e) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     const x = e.pageX - containerRef.current.offsetLeft;
//     containerRef.current.scrollLeft = dragScrollLeft.current - (x - dragStartX.current);
//   };
//   const onMouseUp = () => setIsDragging(false);

//   const active = rides[activeIndex];

//   return (
//     <section className="relative overflow-hidden py-16 md:py-24" style={{ background: "#03273f" }}>

//       {/* Animated BG glow based on active card */}
//       <motion.div
//         key={activeIndex}
//         className="pointer-events-none absolute inset-0 opacity-20 z-0"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 0.3 }}
//         transition={{ duration: 1 }}
//         style={{
//           background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${active.color}88 0%, transparent 70%)`,
//         }}
//       />

//       {/* Floating particles */}
//       <div className="pointer-events-none absolute inset-0 overflow-hidden">
//         {[...Array(12)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute rounded-full"
//             style={{
//               width: 3 + (i % 3),
//               height: 3 + (i % 3),
//               left: `${8 + i * 7.5}%`,
//               bottom: `${5 + (i % 4) * 8}%`,
//               background: "rgba(56,190,255,0.5)",
//             }}
//             animate={{ y: [-0, -80, 0], opacity: [0, 0.7, 0] }}
//             transition={{
//               duration: 3 + (i % 3),
//               delay: i * 0.4,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           />
//         ))}
//       </div>

//       {/* Section header */}
//       <div className="relative z-10 mb-10 px-6 text-center md:mb-14">
//         <motion.p
//           className="mb-2 text-xs uppercase tracking-widest"
//           style={{ color: "#38beff", letterSpacing: "0.25em" }}
//           initial={{ opacity: 0, y: 12 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//         >
//           Our Attractions
//         </motion.p>

//         <motion.h2
//           key={active.name}
//           className="font-display text-5xl font-black uppercase leading-none text-white md:text-7xl lg:text-8xl"
//           style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 0 60px rgba(56,190,255,0.2)" }}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
//         >
//           {active.name}
//         </motion.h2>

//         <motion.p
//           key={active.desc}
//           className="mx-auto mt-3 max-w-sm text-sm leading-relaxed md:max-w-md md:text-base"
//           style={{ color: "rgba(255,255,255,0.5)" }}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.4, delay: 0.1 }}
//         >
//           {active.desc}
//         </motion.p>

//         {/* Stat badge */}
//         <motion.div
//           key={active.stat}
//           className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-widest"
//           style={{
//             background: "rgba(56,190,255,0.1)",
//             border: "1px solid rgba(56,190,255,0.3)",
//             color: "#38beff",
//           }}
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.35, delay: 0.18 }}
//         >
//           <span
//             className="h-1.5 w-1.5 rounded-full"
//             style={{ background: "#38beff" }}
//           />
//           {active.stat}
//         </motion.div>

//         {/* Mobile swipe hint */}
//         <p
//           className="mt-4 animate-pulse text-xs md:hidden"
//           style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}
//         >
//           ← swipe to explore →
//         </p>
//       </div>

//       {/* Carousel */}
//       <div className="relative">
//         {/* Edge fades */}
//         <div
//           className="pointer-events-none absolute left-0 top-0 z-20 h-full w-10 md:w-20"
//           style={{ background: "linear-gradient(to right, #03273f, transparent)" }}
//         />
//         <div
//           className="pointer-events-none absolute right-0 top-0 z-20 h-full w-10 md:w-20"
//           style={{ background: "linear-gradient(to left, #03273f, transparent)" }}
//         />

//         {/* Track */}
//         <div
//           ref={containerRef}
//           className={`flex gap-3 overflow-x-auto scroll-smooth px-4 md:gap-5 md:px-16 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
//           style={{
//             scrollSnapType: "x mandatory",
//             msOverflowStyle: "none",
//             scrollbarWidth: "none",
//           }}
//           onMouseDown={onMouseDown}
//           onMouseMove={onMouseMove}
//           onMouseUp={onMouseUp}
//           onMouseLeave={onMouseUp}
//         >
//           {/* Left spacer */}
//           <div className="min-w-[5vw] md:min-w-[80px]" />

//           {rides.map((ride, index) => {
//             const progress = rides.length > 1 ? index / (rides.length - 1) : 0;
//             const input = [
//               Math.max(progress - 0.25, 0),
//               progress,
//               Math.min(progress + 0.25, 1),
//             ];
//             const scale = useTransform(scrollXProgress, input, [0.88, 1, 0.88]);
//             const opacity = useTransform(scrollXProgress, input, [0.45, 1, 0.45]);

//             return (
//               <motion.div
//                 key={index}
//                 className="ride-card relative shrink-0 overflow-hidden rounded-2xl md:rounded-3xl"
//                 style={{
//                   scale,
//                   opacity,
//                   scrollSnapAlign: "center",
//                   /* Mobile: nearly full width. Tablet: 60%. Desktop: fixed 380px */
//                   minWidth: "min(82vw, 340px)",
//                   height: "clamp(340px, 55vw, 440px)",
//                   border: "1px solid rgba(56,190,255,0.1)",
//                 }}
//                 onClick={() => scrollToIndex(index)}
//                 whileHover={{ y: -6 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 24 }}
//               >
//                 {/* Image */}
//                 <img
//                   src={ride.image}
//                   alt={ride.name}
//                   className="h-full w-full object-cover transition-transform duration-700"
//                   style={{ transform: activeIndex === index ? "scale(1.05)" : "scale(1)" }}
//                   draggable={false}
//                 />

//                 {/* Gradient overlay */}
//                 <div
//                   className="absolute inset-0 bg-[#03273f]/70 z-0" 
//                   style={{
//                     background: "linear-gradient(to top, rgba(3,39,63,0.95) 0%, rgba(3,39,63,0.25) 55%, transparent 100%)",
//                   }}
//                 />

//                 {/* Active glow border */}
//                 {activeIndex === index && (
//                   <motion.div
//                     className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl"
//                     style={{ border: "1px solid rgba(56,190,255,0.5)", boxShadow: "inset 0 0 30px rgba(56,190,255,0.06)" }}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ duration: 0.3 }}
//                   />
//                 )}

//                 {/* Badge */}
//                 <div
//                   className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs uppercase tracking-wider md:left-4 md:top-4"
//                   style={{
//                     background: "rgba(56,190,255,0.15)",
//                     border: "1px solid rgba(56,190,255,0.4)",
//                     color: "#38beff",
//                     backdropFilter: "blur(8px)",
//                     fontSize: "10px",
//                     letterSpacing: "0.15em",
//                   }}
//                 >
//                   {ride.badge}
//                 </div>

//                 {/* Card bottom info */}
//                 <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
//                   <h3
//                     className="text-2xl font-black uppercase leading-none text-white md:text-3xl"
//                     style={{ fontFamily: "'Bebas Neue', sans-serif" }}
//                   >
//                     {ride.name}
//                   </h3>
//                   <p className="mt-1.5 text-xs leading-relaxed md:text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
//                     {ride.desc}
//                   </p>

//                   <motion.div
//                     className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest"
//                     style={{ color: "#38beff", fontSize: "11px" }}
//                     whileHover={{ x: 4 }}
//                   >
//                     Explore
//                     <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//                       <path d="M2 7h10M8 3l4 4-4 4" stroke="#38beff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                   </motion.div>
//                 </div>
//               </motion.div>
//             );
//           })}

//           {/* Right spacer */}
//           <div className="min-w-[5vw] md:min-w-[80px]" />
//         </div>
//       </div>

//       {/* Dot indicators */}
//       <div className="relative z-10 mt-6 flex justify-center gap-2 md:mt-8">
//         {rides.map((_, i) => (
//           <button
//             key={i}
//             onClick={() => scrollToIndex(i)}
//             className="rounded-full transition-all duration-300"
//             style={{
//               width: activeIndex === i ? 28 : 7,
//               height: 7,
//               background: activeIndex === i ? "#38beff" : "rgba(255,255,255,0.2)",
//               border: "none",
//               cursor: "pointer",
//               padding: 0,
//             }}
//             aria-label={`Go to ${rides[i].name}`}
//           />
//         ))}
//       </div>

//       {/* Bottom shimmer bar */}
//       <div
//         className="absolute bottom-0 left-0 right-0 h-px"
//         style={{
//           background: "linear-gradient(90deg, transparent 0%, #38beff 40%, #00d4ff 60%, transparent 100%)",
//           opacity: 0.4,
//         }}
//       />
//     </section>
//   );
// }




import { motion } from "framer-motion";

const rides = [
  {
    name: "Wave Pool",
    desc: "Surf-grade waves in our iconic pool",
    image: "/wavepool.jpg",
  },
  {
    name: "Water Slides",
    desc: "High-speed adrenaline rides",
    image: "/slides.jpg",
  },
  {
    name: "Kids Zone",
    desc: "Safe & fun for kids",
    image: "/kids.jpg",
  },
  {
    name: "Lazy River",
    desc: "Relax & float peacefully",
    image: "/lazyriver.jpg",
  },
];

export default function Rides() {
  return (
    <section  id ="rides" className="py-16 md:py-20 bg-[#03273f] overflow-hidden">

      {/* 🔥 Heading */}
      <div className="text-center mb-12 px-6">
        <h2 className="text-3xl md:text-5xl font-semibold text-white">
          Our <span className="text-cyan-400">Attractions</span>
        </h2>
        <p className="text-gray-400 mt-3 max-w-xl mx-auto">
          Explore thrilling rides and relaxing experiences
        </p>

        {/* Mobile hint */}
        <p className="md:hidden text-gray-400 text-sm mt-3 animate-pulse">
          ← Swipe →
        </p>
      </div>

      {/* 🎢 SIMPLE CAROUSEL */}
      <div className="overflow-x-auto flex gap-5 px-6 md:px-16 snap-x snap-mandatory">

        {rides.map((ride, index) => (
          <motion.div
            key={index}
            className="snap-center min-w-[85%] md:min-w-[380px] h-[360px] md:h-[420px] rounded-2xl overflow-hidden relative group"
            whileHover={{ scale: 1.05 }}
          >
            {/* Image */}
            <img
              src={ride.image}
              alt={ride.name}
              loading="lazy"
              className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Text */}
            <div className="absolute bottom-5 left-5 right-5">
              <h3 className="text-xl md:text-2xl font-semibold text-white">
                {ride.name}
              </h3>
              <p className="text-gray-300 text-sm mt-1">
                {ride.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}