import { useRef } from "react";

export default function HorizontalScroll({ items }) {
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    if (containerRef.current) {
      e.preventDefault();
      containerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 md:px-20 pb-6"
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="min-w-[80%] md:min-w-[350px] h-[420px] snap-center rounded-2xl overflow-hidden relative group cursor-pointer"
        >
          {/* IMAGE */}
          <img
            src={item.image}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* TEXT */}
          <div className="absolute bottom-0 p-6 text-left">
            <h3 className="text-xl font-semibold text-white">
              {item.title}
            </h3>
            <p className="text-gray-300 text-sm">
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}