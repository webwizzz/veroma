"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SpaceItem {
  num: string;
  title: string;
  keywords: string;
  colorClass: string;
  effects: string[];
  image: string;
}

const spaces: SpaceItem[] = [
  {
    num: "01",
    title: "Hotels & Hospitality",
    keywords: "Comfort • Relaxation • Luxury • Lasting Memories",
    colorClass: "text-purple-600",
    effects: [
      "Amygdala — Emotional Comfort",
      "Hippocampus — Memory Formation",
      "Orbitofrontal Cortex — Luxury Perception",
    ],
    image: "/assets/hotel_lobby.jpg",
  },
  {
    num: "02",
    title: "Corporate Offices",
    keywords: "Focus • Productivity • Stress Reduction • Clarity",
    colorClass: "text-emerald-600",
    effects: [
      "Prefrontal Cortex — Enhanced Focus",
      "Amygdala — Stress Alleviation",
      "Temporal Lobe — Cognitive Endurance",
    ],
    image: "/assets/office_lobby.jpg",
  },
  {
    num: "03",
    title: "Luxury Retail",
    keywords: "Brand Affinity • Engagement • Dwell Time • Ambience",
    colorClass: "text-orange-600",
    effects: [
      "Amygdala — Positive Affect",
      "Hippocampus — Brand Association",
      "Striatum — Reward Processing",
    ],
    image: "/assets/retail_lobby.jpg",
  },
];

// Reusable SVG Flower component for the branch
const Flower = ({ x, y, scale = 1, rotation = 0 }: { x: number; y: number; scale?: number; rotation?: number }) => (
  <g
    className="flower"
    style={{ transformOrigin: `${x}px ${y}px` }} // Important for GSAP scaling
  >
    <g transform={`translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`}>
      {/* 5 Petals */}
      <path d="M0,0 C-12,-15 -6,-30 0,-35 C6,-30 12,-15 0,0" fill="#FFB7C5" opacity="0.9" />
      <path d="M0,0 C15,-12 30,-6 35,0 C30,6 15,12 0,0" fill="#FFC0CB" opacity="0.8" />
      <path d="M0,0 C12,15 6,30 0,35 C-6,30 -12,15 0,0" fill="#FFB7C5" opacity="0.9" />
      <path d="M0,0 C-15,12 -30,6 -35,0 C-30,-6 -15,-12 0,0" fill="#FFC0CB" opacity="0.8" />
      <path d="M0,0 C-10,-20 10,-20 0,0" fill="#FF9EBB" opacity="0.7" transform="rotate(45)" />

      {/* Center detail */}
      <circle cx="0" cy="0" r="5" fill="#E91E63" opacity="0.8" />
      <circle cx="0" cy="0" r="2.5" fill="#FFF" />
      {/* Stamen lines */}
      <path d="M0,0 L-6,-6 M0,0 L6,-6 M0,0 L6,6 M0,0 L-6,6" stroke="#E91E63" strokeWidth="0.5" />
    </g>
  </g>
);

// Falling petal component
const Petal = ({ x, y, scale = 1, rotation = 0 }: { x: number; y: number; scale?: number; rotation?: number }) => (
  <g
    className="flower" // Using flower class so it animates in with them
    style={{ transformOrigin: `${x}px ${y}px` }}
  >
    <path
      transform={`translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`}
      d="M0,0 C-8,-10 -4,-20 0,-25 C4,-20 8,-10 0,0"
      fill="#FFB7C5"
      opacity="0.8"
    />
  </g>
);


export const ScentExperience = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !sectionRef.current) return;

    const branchPaths = svgRef.current.querySelectorAll(".branch-path");
    const flowers = svgRef.current.querySelectorAll(".flower");

    // Set initial dasharray and dashoffset for drawing effect
    branchPaths.forEach((path: any) => {
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    });

    // Set initial scale for flowers so they pop in
    gsap.set(flowers, { scale: 0 });

    // Animate paths on scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 60%",
        end: "top 5%",
        scrub: 1.5,
      },
    });

    // 1. Draw branches
    branchPaths.forEach((path) => {
      tl.to(
        path,
        {
          strokeDashoffset: 0,
          ease: "none",
        },
        0 // All branches start drawing at the same time
      );
    });

    // 2. Bloom flowers (staggered scaling)
    tl.to(
      flowers,
      {
        scale: 1,
        duration: 0.5, // scrub timeline scales duration, this is relative proportion
        stagger: 0.02,
        ease: "back.out(1.7)", // bouncy pop
      },
      0.1 // Start slightly after branches start drawing
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === sectionRef.current) {
          st.kill();
        }
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-20 w-full bg-white text-black py-16 md:py-32 px-2 md:px-4 select-none"
    >
      {/* Top Header Row */}
      <div className="relative w-full max-w-7xl mx-auto flex flex-col justify-between items-start mb-16 md:mb-24">
        <h2 className="text-[28px] md:text-[64px] font-bold tracking-tight text-black uppercase leading-[1.05] z-10">
          Scent Experience <br /> By{" "}
          <span className="relative inline-block pb-2 md:pb-4">
            Space
            <span className="absolute left-0 bottom-1 w-full h-[2px] md:h-[4px] bg-black/80" />
            <span className="absolute left-[8%] bottom-[-2px] md:bottom-[-4px] w-[84%] h-[1px] md:h-[2px] bg-black/40" />
          </span>
        </h2>

        {/* Blooming SVG Floral Branch from Right Corner */}
        <div className="absolute right-[-40px] md:right-[-100px] top-[-80px] md:top-[-160px] w-80 md:w-[600px] h-auto pointer-events-none z-0 opacity-90 overflow-visible">
          <svg
            ref={svgRef}
            viewBox="0 0 600 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
          >
            {/* Dark Branches */}
            <g>
              {/* Main thick branch */}
              <path className="branch-path" d="M600,0 C500,100 400,120 300,200 C200,280 150,300 50,320" stroke="#3E2723" strokeWidth="8" strokeLinecap="round" />
              {/* Top sub-branch */}
              <path className="branch-path" d="M450,100 C400,60 350,50 250,70" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" />
              <path className="branch-path" d="M300,60 C260,30 230,40 200,30" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
              {/* Middle sub-branch */}
              <path className="branch-path" d="M350,160 C300,190 280,220 220,220 C180,220 160,200 120,210" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" />
              {/* Bottom sub-branch */}
              <path className="branch-path" d="M150,290 C120,340 100,380 40,390" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" />
              <path className="branch-path" d="M90,360 C70,400 50,420 10,430" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Pink Cherry Blossoms */}
            <g>
              {/* Main branch flowers */}
              <Flower x={500} y={100} scale={1.2} rotation={15} />
              <Flower x={480} y={120} scale={0.8} rotation={-20} />
              <Flower x={400} y={120} scale={1.1} rotation={45} />
              <Flower x={380} y={140} scale={0.9} rotation={-10} />
              <Flower x={300} y={200} scale={1.3} rotation={75} />
              <Flower x={280} y={180} scale={0.7} rotation={-45} />
              <Flower x={180} y={290} scale={1.2} rotation={10} />
              <Flower x={150} y={300} scale={1} rotation={-60} />
              <Flower x={50} y={320} scale={0.8} rotation={30} />

              {/* Top sub-branch flowers */}
              <Flower x={400} y={60} scale={1} rotation={0} />
              <Flower x={350} y={50} scale={1.1} rotation={25} />
              <Flower x={330} y={70} scale={0.7} rotation={-15} />
              <Flower x={250} y={70} scale={0.9} rotation={50} />
              <Flower x={200} y={30} scale={0.8} rotation={-30} />

              {/* Middle sub-branch flowers */}
              <Flower x={300} y={190} scale={1} rotation={-10} />
              <Flower x={260} y={215} scale={1.2} rotation={35} />
              <Flower x={220} y={220} scale={0.9} rotation={80} />
              <Flower x={160} y={200} scale={1} rotation={-25} />
              <Flower x={120} y={210} scale={0.8} rotation={15} />

              {/* Bottom sub-branch flowers */}
              <Flower x={120} y={340} scale={1.1} rotation={-40} />
              <Flower x={90} y={360} scale={0.9} rotation={20} />
              <Flower x={70} y={400} scale={1} rotation={-15} />
              <Flower x={40} y={390} scale={0.8} rotation={60} />
              <Flower x={10} y={430} scale={0.7} rotation={-5} />

              {/* Free-falling ambient petals */}
              <Petal x={320} y={250} scale={0.8} rotation={25} />
              <Petal x={200} y={350} scale={0.6} rotation={-45} />
              <Petal x={450} y={180} scale={0.9} rotation={75} />
              <Petal x={100} y={480} scale={0.7} rotation={-10} />
              <Petal x={250} y={400} scale={0.5} rotation={15} />
            </g>
          </svg>
        </div>
      </div>

      {/* Stacked Cards Container */}
      {/* We add a large bottom padding so the last card has room to stick and stay on screen briefly before the section ends */}
      <div className="relative w-full mx-auto flex flex-col gap-8 md:gap-12">
        {spaces.map((space, index) => {
          // Calculate incremental top spacing so cards stack like a deck
          const topOffset = `calc(6rem + ${index * 2.5}rem)`;

          return (
            <div
              key={space.num}
              className="group sticky bg-[#f6f6f6] border border-black/5 transition-all duration-700 ease-out overflow-hidden will-change-transform flex flex-col md:flex-row min-h-[400px] md:min-h-[500px]"
              style={{ top: topOffset, zIndex: index + 1 }}
            >
              {/* Left Side: Strict Text Content Grid */}
              <div className="w-full md:w-1/2 p-8 md:p-14 lg:p-20 flex flex-col justify-center relative z-10 bg-[#f66f6]">
                {/* Large structural number overlay */}
                <div className="absolute top-8 left-8 md:top-12 md:left-12 text-[80px] md:text-[120px] font-mono font-bold text-black/[0.03] leading-none pointer-events-none select-none">
                  {space.num}
                </div>

                <div className="relative z-10">
                  <div className="mb-8 md:mb-12">
                    <span className="text-sm md:text-base font-sans font-bold tracking-[0.2em] text-black/40 uppercase block mb-4">
                      Space {space.num}
                    </span>
                    <h3 className="text-3xl md:text-5xl font-bold text-black tracking-tight leading-[1.1] uppercase mb-4">
                      {space.title}
                    </h3>
                    <p className={`font-cormorant italic text-xl md:text-2xl font-medium leading-relaxed ${space.colorClass}`}>
                      {space.keywords}
                    </p>
                  </div>

                  <div className="pt-6 md:pt-8 border-t border-black/10">
                    <h4 className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-black/40 mb-4 font-semibold">
                      Neurological Activation
                    </h4>
                    <ul className="flex flex-col gap-3">
                      {space.effects.map((effect, idx) => (
                        <li key={idx} className="flex items-center gap-4 text-sm md:text-base font-sans text-black/80 font-light">
                          <span className="w-1.5 h-1.5 rounded-full bg-black/20 group-hover:bg-black/60 transition-colors duration-500 shrink-0"></span>
                          <span className="leading-tight">{effect}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Side: Strict Full-Height Image Wrapper */}
              <div className="w-full md:w-1/2 h-[300px] md:h-auto relative overflow-hidden bg-black/5">
                <img
                  src={space.image}
                  alt={space.title}
                  className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-[2s] ease-out group-hover:scale-105"
                />
                {/* Overlay shadow for premium contrast depth */}
                {/* <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none"></div> */}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ScentExperience;
