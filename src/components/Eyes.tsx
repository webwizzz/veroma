"use client";
import { useEffect, useState } from "react";

const Eyes = () => {
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const deltaX = mouseX - window.innerWidth / 2;
      const deltaY = mouseY - window.innerHeight / 2;

      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      setRotate(angle - 180);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className="eyes flex justify-center items-center w-full h-screen overflow-hidden relative bg-black"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Foreground content */}
      <div
        data-scroll
        data-scroll-section
        data-scroll-speed="-.5"
        className="relative rounded-2xl z-[100] w-[70vw] h-[70vh] bg-white flex items-center justify-center"
      >
        <div className="flex gap-10">
          {/* Left Eye */}
          <div className="flex items-center justify-center w-[15vw] h-[15vw] rounded-full bg-zinc-100">
            <div className="relative w-2/3 h-2/3 rounded-full bg-[#606060] flex items-center justify-center">
              <div
                style={{
                  transform: `rotate(${rotate}deg)`,
                }}
                className="absolute w-[60%] h-[35%] flex items-center justify-end"
              >
                <div className="w-[40%] h-[80%] rounded-full bg-zinc-100"></div>
              </div>
            </div>
          </div>

          {/* Right Eye */}
          <div className="flex items-center justify-center w-[15vw] h-[15vw] rounded-full bg-zinc-100">
            <div className="relative w-2/3 h-2/3 rounded-full bg-[#606060] flex items-center justify-center">
              <div
                style={{
                  transform: `rotate(${rotate}deg)`,
                }}
                className="absolute w-[60%] h-[35%] flex items-center justify-end"
              >
                <div className="w-[40%] h-[80%] rounded-full bg-zinc-100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eyes;
