import { useEffect, useState } from "react";

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-0 w-[300px] h-[300px] rounded-full blur-[120px] bg-cyan-400/20"
      style={{
        left: pos.x - 150,
        top: pos.y - 150,
      }}
    />
  );
}