"use client";

import React, { useRef } from "react";
import useFluidCursor from "../hooks/useFluidCursor";

export const AboutSection = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize the WebGL fluid cursor simulation
  useFluidCursor(canvasRef, {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
    DENSITY_DISSIPATION: 4.5,
    VELOCITY_DISSIPATION: 2.0,
    PRESSURE: 0.2,
    PRESSURE_ITERATIONS: 20,
    CURL: 2.5,
    SPLAT_RADIUS: 0.45,
    SPLAT_FORCE: 4000,
    RAINBOW_MODE: true, // will be handled internally as scent tones
    TRANSPARENT: true,
  });

  return (
    <section className="relative z-20 w-full min-h-screen bg-[#f6f6f6] flex flex-col justify-between md:py-6 px-2 md:px-4 select-none overflow-hidden">
      {/* WebGL Fluid Simulation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Top Spacer to push content to the bottom */}
      <div className="flex-grow z-10" />

      {/* Bottom Content Area */}
      <div className="w-full z-10 mt-auto flex flex-col md:flex-row md:items-end justify-between gap-10 lg:gap-16">
        {/* Left Column: Title and Paragraph */}
        <div className="max-w-[100%] text-left">
          <h2 className="text-[24px] font-stretch-extra-condensed md:text-[78px] font-bold tracking-tight text-black leading-[1.02] mb-6 sm:mb-8 uppercase">
            Fragrance, Thoughtfully <br />
            Engineered
          </h2>
          <p className="font-serif text-base sm:text-lg md:text-xl text-black/60 leading-[30px] max-w-3xl">
            At Veroma, we believe fragrance shapes how a space is experienced.
            Through carefully developed scent solutions, we create elevated environments
            that inspire comfort and lasting impressions.
          </p>
        </div>

        {/* Right Column: Rotating Text Badge */}
        <div className="flex justify-start md:justify-end items-end pr-0 md:pr-4 lg:pr-8 mb-2">
          <a
            href="#discover"
            className="group relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
          >
            {/* Spinning SVG circle text */}
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_25s_linear_infinite]"
              viewBox="0 0 100 100"
            >
              <defs>
                {/* Circular path centered at 50,50 with radius 36 */}
                <path
                  id="textCirclePath"
                  d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                  fill="none"
                />
              </defs>
              <text className="font-cormorant italic text-[8.5px] fill-black/70 font-medium tracking-[0.08em]">
                <textPath href="#textCirclePath" startOffset="0%">
                  Discover Veroma • Thoughtfully Engineered • For You •
                </textPath>
              </text>
            </svg>

            {/* Static Inner Circle with Arrow */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-black flex items-center justify-center transition-all duration-300 bg-transparent group-hover:bg-black group-hover:scale-105 z-10">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 stroke-black group-hover:stroke-white stroke-[1.2] fill-none transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                viewBox="0 0 24 24"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="10 7 17 7 17 14" />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
