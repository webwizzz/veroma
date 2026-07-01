"use client";

import { useRef } from "react";
import useFluidCursor from "../hooks/useFluidCursor";

const Solutions = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    RAINBOW_MODE: true, // scent tones
    TRANSPARENT: true,
  });

  return (
    <div className="relative w-full h-full bg-[#EEEEEE] text-[#171717] flex flex-col justify-between py-12 px-6 md:py-28 md:px-16 select-none overflow-hidden box-border">
      {/* WebGL Fluid Simulation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Top Section */}
      <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-8 md:gap-16">
        {/* Left: Title */}
        <h2 className="font-normal text-left tracking-[0.04em] leading-[1.2] text-[#444444] max-w-[650px] text-[32px] md:text-[52px]">
          Luxury Fragrance<br className="hidden sm:inline" /> Solutions, Designed For<br className="hidden sm:inline" /> Every Space.
        </h2>

        {/* Right: Subtext */}
        <p className="font-normal text-left md:text-right tracking-[0.04em] leading-[1.5] text-[#171717] max-w-[650px] text-[16px] md:text-[22px]">
          We Don't Just Diffuse Fragrances—We Create Memorable Environments With Seamless Service And Premium Scent Experiences.
        </p>
      </div>

      {/* Bottom Section: Columns */}
      <div className="relative z-10 solutions-grid gap-x-4 lg:gap-x-4 mt-10 md:mt-16">
        {/* Column 1 */}
        <div className="solutions-card text-left">
          <span className="font-baflion font-black text-[20px] md:text-[24px] tracking-[0.04em] text-[#444444] mb-1 md:mb-2">
            01
          </span>
          <h3 className="font-bold text-[22px] md:text-[24px] tracking-[0.04em] leading-[1.2] text-[#171717]">
            Professional Installation
          </h3>
          <p className="font-normal text-[16px] tracking-[0.04em] leading-[1.6] text-[#606060] pt-12 md:pt-32">
            Our Certified Experts Install And Calibrate Every Diffuser For Optimal Fragrance Performance From Day One.
          </p>
        </div>

        {/* Column 2 */}
        <div className="solutions-card text-left">
          <span className="font-baflion font-black text-[20px] md:text-[24px] tracking-[0.04em] text-[#444444] mb-1 md:mb-2">
            02
          </span>
          <h3 className="font-bold text-[22px] md:text-[24px] tracking-[0.04em] leading-[1.2] text-[#171717]">
            Customized Fragrance
          </h3>
          <p className="font-normal text-[16px] tracking-[0.04em] leading-[1.6] text-[#606060] pt-12 md:pt-32">
            Every Scent Program Is Tailored To Your Space, Operating Hours, Occupancy, And Desired Ambience.
          </p>
        </div>

        {/* Column 3 */}
        <div className="solutions-card text-left">
          <span className="font-baflion font-black text-[20px] md:text-[24px] tracking-[0.04em] text-[#444444] mb-1 md:mb-2">
            03
          </span>
          <h3 className="font-bold text-[22px] md:text-[24px] tracking-[0.04em] leading-[1.2] text-[#171717]">
            Maintenance & Refills
          </h3>
          <p className="font-normal text-[16px] tracking-[0.04em] leading-[1.6] text-[#606060] pt-12 md:pt-32">
            Scheduled Servicing, Cartridge Replacements, And Preventive Maintenance Ensure Uninterrupted Fragrance Delivery.
          </p>
        </div>

        {/* Column 4 */}
        <div className="solutions-card text-left">
          <span className="font-baflion font-black text-[20px] md:text-[24px] tracking-[0.04em] text-[#444444] mb-1 md:mb-2">
            04
          </span>
          <h3 className="font-bold text-[22px] md:text-[24px] tracking-[0.04em] leading-[1.2] text-[#171717]">
            End-To-End Support
          </h3>
          <p className="font-normal text-[16px] tracking-[0.04em] leading-[1.6] text-[#606060] pt-12 md:pt-32">
            From Consultation To Logistics And Ongoing Service, We Manage Every Detail For A Completely Hassle-Free Experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Solutions;
