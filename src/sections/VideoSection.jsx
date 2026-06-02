export default function VideoSection() {
  return (
    <section className="py-16 text-center">
      <h2 className="text-3xl mb-6">See the Experience</h2>

      <video
        controls
        className="mx-auto rounded-xl w-[80%]"
      >
        <source src="/videos/park.mp4" type="video/mp4" />
      </video>
    </section>
  );
}