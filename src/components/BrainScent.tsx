"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import brainScentImg from "../../public/assets/brain_scent.png";

interface BrainRegion {
  name: string;
  effect: string;
  effectColor: string;
  description: string;
}

const regionsData: BrainRegion[] = [
  {
    name: "Amygdala",
    effect: "Emotional Comfort",
    effectColor: "text-[#84cc16]",
    description: "Influences feelings of safety, relaxation and emotional well-being.",
  },
  {
    name: "Hippocampus",
    effect: "Memory formation",
    effectColor: "text-[#84cc16]",
    description: "Plays a key role in creating lasting memories and meaningful experiences.",
  },
  {
    name: "Orbitofrontal Cortex",
    effect: "Luxury perception",
    effectColor: "text-[#84cc16]",
    description: "Processes value, sophistication and luxury, shaping premium perception.",
  },
];

const VB_W = 1200;
const VB_H = 800;

// Fixed brain origin points in SVG viewBox units (estimated from brain image)
const BRAIN_ORIGINS = [
  { x: 500, y: 340 }, // line → Circle 01
  { x: 515, y: 430 }, // line → Circle 02
  { x: 498, y: 518 }, // line → Circle 03
];

/** Builds a 2-segment wavy bezier path from (ox,oy) to (ex,ey). */
function buildWavyPath(
  ox: number, oy: number,
  ex: number, ey: number,
  idx: number
): string {
  const dx = ex - ox;
  const amp = 90; // vertical amplitude of each curve
  const mid = ox + dx * 0.48;
  const midY = (oy + ey) / 2;

  if (idx === 0) {
    // Curves UP first, then UP again to reach circle 01 (above origin)
    return (
      `M ${ox},${oy} ` +
      `C ${ox + dx * 0.26},${oy - amp} ${ox + dx * 0.44},${oy + amp * 0.75} ${mid},${midY} ` +
      `C ${mid + dx * 0.2},${midY - amp} ${ex - dx * 0.18},${ey + 20} ${ex},${ey}`
    );
  } else if (idx === 1) {
    // S-curve: dips DOWN then swings back UP to circle 02 (roughly level)
    return (
      `M ${ox},${oy} ` +
      `C ${ox + dx * 0.28},${oy - amp} ${ox + dx * 0.46},${oy + amp} ${mid},${midY} ` +
      `C ${mid + dx * 0.18},${midY - amp * 0.85} ${ex - dx * 0.2},${ey + 30} ${ex},${ey}`
    );
  } else {
    // Curves DOWN first, then DOWN again to reach circle 03 (below origin)
    return (
      `M ${ox},${oy} ` +
      `C ${ox + dx * 0.26},${oy + amp} ${ox + dx * 0.44},${oy - amp * 0.75} ${mid},${midY} ` +
      `C ${mid + dx * 0.2},${midY + amp} ${ex - dx * 0.18},${ey - 20} ${ex},${ey}`
    );
  }
}

export default function BrainScent({ style, className }: { style?: React.CSSProperties; className?: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });
  const gridRef = useRef<HTMLDivElement>(null);
  const circleElRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);

  // Default to fallback positions until measured
  const [circlePoints, setCirclePoints] = useState([
    { x: 820, y: 228 },
    { x: 820, y: 400 },
    { x: 820, y: 572 },
  ]);

  const measure = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();
    if (gridRect.width === 0 || gridRect.height === 0) return;

    // Scale factors: DOM px → SVG viewBox units
    const scaleX = VB_W / gridRect.width;
    const scaleY = VB_H / gridRect.height;

    const newPoints = circleElRefs.current.map((el) => {
      if (!el) return { x: 820, y: 400 };
      const r = el.getBoundingClientRect();
      return {
        x: Math.round((r.left - gridRect.left + r.width / 2) * scaleX),
        y: Math.round((r.top - gridRect.top + r.height / 2) * scaleY),
      };
    });

    setCirclePoints(newPoints);
  }, []);

  useEffect(() => {
    // Delay slightly so layout is fully painted before measuring
    const t = setTimeout(measure, 80);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <section
      ref={sectionRef}
      style={style}
      className={`relative z-20 w-full bg-[#F5F5F3] text-[#171717] pt-12 lg:pt-16 pb-0 px-6 md:px-16 overflow-hidden select-none h-auto lg:h-screen flex flex-col justify-between ${className || ""}`}
    >
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col justify-between">

        {/* Grid — ref needed for SVG coordinate mapping */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-stretch relative h-full w-full"
        >
          {/* ── Dynamic SVG overlay ── */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block z-0">
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {BRAIN_ORIGINS.map((origin, i) => {
                  const end = circlePoints[i];
                  const d = buildWavyPath(origin.x, origin.y, end.x, end.y, i);
                  return (
                    <mask id={`path-mask-${i}`} key={`mask-${i}`}>
                      <motion.path
                        d={d}
                        stroke="white"
                        strokeWidth="6"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={isInView ? { pathLength: 1 } : {}}
                        transition={{ delay: 1.0, duration: 1.2, ease: "easeInOut" }}
                      />
                    </mask>
                  );
                })}
              </defs>
              {BRAIN_ORIGINS.map((origin, i) => {
                const end = circlePoints[i];
                const d = buildWavyPath(origin.x, origin.y, end.x, end.y, i);
                return (
                  <React.Fragment key={i}>
                    {/* Green dot at brain region */}
                    <motion.circle
                      cx={origin.x}
                      cy={origin.y}
                      r="4.5"
                      fill="#84cc16"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={isInView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
                    />
                    {/* Wavy dashed path */}
                    <path
                      d={d}
                      stroke="#9CA3AF"
                      strokeWidth="1.6"
                      strokeDasharray="5 5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.85"
                      mask={`url(#path-mask-${i})`}
                    />
                  </React.Fragment>
                );
              })}
            </svg>
          </div>

          {/* ── Left Column: Heading, Fragrance Pills, Brain Image ── */}
          <div className="lg:col-span-8 flex flex-col justify-between h-full min-h-[500px] lg:min-h-0 z-10">

            {/* Title & Pills */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="flex flex-col"
            >
              <h2 className="font-baflion tracking-tight leading-[1] text-[54px] text-black">
                Hotels &amp; Hospitality
              </h2>

              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[22px] text-black font-medium">
                  Recommended Fragrance Families
                </span>
                <div className="flex flex-wrap gap-2 md:gap-3 max-w-[420px]">
                  {["LAVENDER", "WHITE TEA", "SANDALWOOD", "JASMINE"].map((pill) => (
                      key={pill}
                      className="text-[18px] text-black bg-transparent rounded-full border border-black px-[10px] py-[6px]"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Silhouette Profile Head Image */}
            <div className="w-full flex justify-center lg:justify-end mt-8 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 80 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-[380px] md:max-w-[520px] lg:max-w-[880px] h-[340px] md:h-[460px] lg:h-[550px] pointer-events-none"
              >
                <Image
                  src={brainScentImg}
                  alt="Neurological Activation silhouette"
                  fill
                  className="object-contain object-bottom select-none"
                  priority
                />
              </motion.div>
            </div>
          </div>

          {/* ── Right Column: Neurological activation points ── */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-12 lg:gap-32 py-8 h-full z-10">
            {regionsData.map((region, index) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 2.2 + index * 0.2, duration: 0.6, ease: "easeOut" }}
                className="flex gap-5 items-start group"
              >

                {/* Circle number — measured via callback ref */}
                <div
                  ref={(el) => { circleElRefs.current[index] = el; }}
                  className="w-12 h-12 rounded-full border border-[#84cc16] flex items-center justify-center shrink-0 text-lg font-semibold text-black bg-white transition-all duration-300 group-hover:scale-105"
                >
                  {"0" + (index + 1)}
                </div>

                {/* Content Details */}
                <div className="flex flex-col gap-1 text-left pt-1">
                  <h3 className="font-medium text-[26px] text-[#171717] leading-tight">
                    {region.name}
                  </h3>
                  <span className={`font-medium italic text-[18px] ${region.effectColor}`}>
                    [ {region.effect} ]
                  </span>
                  <p className="text-[18px] text-[#606060] leading-relaxed max-w-[360px] mt-1">
                    {region.description}
                  </p>
                </div>

              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
