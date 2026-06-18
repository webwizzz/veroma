"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useRef } from "react";
import CustomCursor from "./CustomCursor";

import Animation3D from "./Animation3D";
import Header from "./Header";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);

  CustomEase.create("cinematicSilk", "0.45, 0.05, 0.55, 0.95");
  CustomEase.create("cinematicSmooth", "0.25, 0.1, 0.25, 1");
  CustomEase.create("cinematicFlow", "0.33, 0, 0.2, 1");
  CustomEase.create("cinematicLinear", "0.4, 0, 0.6, 1");
}

const Hero = () => {
  // Shared background preview Ref
  const previewRef = useRef<HTMLDivElement | null>(null);
  const lastActiveIndexRef = useRef(-1);

  const updateActiveBackground = (segmentIndex: number) => {
    // Background images/videos disabled per user request
  };

  return (
    <section className="cursor-none-all relative w-full min-h-[100svh] bg-[#ffffff] select-none overflow-x-hidden">
      {/* Header / Navigation Menu Bar */}
      <Header />

      {/* Background preview images */}
      <div
        ref={previewRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* 3D Animation Component */}
      <Animation3D
        is3D={true}
        updateActiveBackground={updateActiveBackground}
      />

      <CustomCursor />
    </section>
  );
};

export default Hero;