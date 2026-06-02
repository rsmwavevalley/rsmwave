export default function Gallery() {
  const images = [
    "/wavepool.jpg",
    "/slides.jpg",
    "/kids.jpg",
    "/lazyriver.jpg",
    "/wavepool.jpg",
    "/slides.jpg",
  ];

  return (
    <section
      id="gallery"
      className="py-14 md:py-20 px-4 md:px-6 bg-[#03273f]"
    >
      {/* 🔥 Heading */}
      <div className="text-center mb-10 md:mb-14">
        <h2 className="text-2xl md:text-5xl font-semibold text-white">
          Our <span className="text-cyan-400">Gallery</span>
        </h2>

        <p className="text-gray-400 mt-3 text-sm md:text-base max-w-md mx-auto">
          Explore real moments from RSM Wave Valley
        </p>
      </div>

      {/* 📱 GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5 max-w-6xl mx-auto">
        {images.map((img, index) => (
          <div
            key={index}
            className="relative rounded-xl overflow-hidden group"
          >
            {/* IMAGE */}
            <img
              src={img}
              alt="gallery"
              loading="lazy"
              className="w-full h-[160px] sm:h-[180px] md:h-[220px] object-cover"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition duration-300" />
          </div>
        ))}
      </div>
    </section>
  );
}