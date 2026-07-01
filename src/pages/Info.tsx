"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import RevealLayer from "../components/RevealLayer";
import Solutions from "../components/Solutions";
import useFluidCursor from "../hooks/useFluidCursor";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const BG_IMAGE_1 = "/cliff/dry.png";
const BG_IMAGE_2 = "/cliff/green.png";

const Info = () => {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const pinnedWrapperRef = useRef<HTMLDivElement | null>(null);
  const initialViewRef = useRef<HTMLDivElement | null>(null);
  const revealerRef = useRef<HTMLDivElement | null>(null);
  const outroLeftRef = useRef<HTMLDivElement | null>(null);
  const outroRightRef = useRef<HTMLDivElement | null>(null);
  const eyesWrapperRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);

  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

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

  // Track cursor position for reveal layer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const tick = () => {
      if (mouse.current.x !== -999 && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Convert client coordinates to container-relative coordinates
        const targetX = mouse.current.x - rect.left;
        const targetY = mouse.current.y - rect.top;

        if (smooth.current.x === -999) {
          smooth.current = { x: targetX, y: targetY };
        } else {
          smooth.current.x += (targetX - smooth.current.x) * 0.1;
          smooth.current.y += (targetY - smooth.current.y) * 0.1;
        }

        setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // GSAP ScrollTrigger Transition timeline
  useEffect(() => {
    if (
      !triggerRef.current ||
      !pinnedWrapperRef.current ||
      !initialViewRef.current ||
      !revealerRef.current ||
      !outroLeftRef.current ||
      !outroRightRef.current ||
      !eyesWrapperRef.current
    ) {
      return;
    }

    const trigger = triggerRef.current;
    const pinnedWrapper = pinnedWrapperRef.current;
    const initialView = initialViewRef.current;
    const revealer = revealerRef.current;
    const outroLeft = outroLeftRef.current;
    const outroRight = outroRightRef.current;
    const eyesWrapper = eyesWrapperRef.current;

    // Reset initial states to ensure GSAP starts from clean coordinates
    gsap.set(outroLeft, {
      xPercent: 0,
      scale: 0,
    });
    gsap.set(outroRight, {
      xPercent: 0,
      scale: 0,
    });
    gsap.set(eyesWrapper, {
      autoAlpha: 0,
    });

    const infoScrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: "top top",
        end: () => `+=${window.innerHeight * 6}`,
        pin: pinnedWrapper,
        pinSpacing: false,
        scrub: 1.5,
        invalidateOnRefresh: true,
      },
    });

    // 0. Character scaleY animation on title (Option B: play once when section enters)
    const chars = titleRef.current?.querySelectorAll(".char");
    let titleAnimation: gsap.core.Tween | null = null;
    if (chars && chars.length > 0) {
      titleAnimation = gsap.fromTo(
        chars,
        {
          "will-change": "transform, opacity",
          transformOrigin: "50% 100%",
          scaleY: 0,
          opacity: 0,
        },
        {
          ease: "power3.out",
          opacity: 1,
          scaleY: 1,
          stagger: 0.03,
          duration: 0.8,
          scrollTrigger: {
            trigger: trigger,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // 0.2. Character scaleY animation on description paragraph (plays once when section enters)
    const descChars = descRef.current?.querySelectorAll(".char");
    let descAnimation: gsap.core.Tween | null = null;
    if (descChars && descChars.length > 0) {
      descAnimation = gsap.fromTo(
        descChars,
        {
          "will-change": "transform, opacity",
          transformOrigin: "50% 100%",
          scaleY: 0,
          opacity: 0,
        },
        {
          ease: "power3.out",
          opacity: 1,
          scaleY: 1,
          stagger: 0.008,
          duration: 0.7,
          scrollTrigger: {
            trigger: trigger,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // 1. Initial background/revealer thin line (0 -> 0.2)
    infoScrollTimeline.to(
      revealer,
      {
        clipPath: "polygon(49.5% 0%, 50.5% 0%, 50.5% 100%, 49.5% 100%)",
        duration: 0.2,
      },
      0
    );

    // 2. Expand revealer to full screen (0.2 -> 0.5)
    infoScrollTimeline.to(
      revealer,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 0.3,
      },
      0.2
    );

    // 3. Outro content card scales up (0.26 -> 0.7)
    infoScrollTimeline.to(
      [outroLeft, outroRight],
      {
        scale: 1,
        duration: 0.44,
      },
      0.26
    );

    // 4. Hide initial view and revealer behind the outro, and clear background color of pinned wrapper
    infoScrollTimeline.set(
      [initialView, revealer],
      { autoAlpha: 0 },
      0.7
    );
    infoScrollTimeline.set(
      pinnedWrapper,
      { backgroundColor: "transparent" },
      0.7
    );
    infoScrollTimeline.set(
      eyesWrapper,
      { autoAlpha: 1 },
      0.7
    );

    // 6. Split outro content and slide left/right to reveal underlying content
    infoScrollTimeline.to(
      outroLeft,
      {
        xPercent: -50.5,
        duration: 0.3,
      },
      0.7
    );
    infoScrollTimeline.to(
      outroRight,
      {
        xPercent: 50,
        duration: 0.3,
      },
      0.7
    );

    // 7. Spacer to keep Solutions sticky for an extra viewport while Innovation slides up
    infoScrollTimeline.set({}, {}, 1.2);

    return () => {
      infoScrollTimeline.kill();
      if (titleAnimation) {
        titleAnimation.kill();
      }
      if (descAnimation) {
        descAnimation.kill();
      }
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === trigger) {
          st.kill();
        }
      });
    };
  }, []);

  return (
    <section ref={triggerRef} className="info-section-container">
      <div
        ref={pinnedWrapperRef}
        className="info-pinned-wrapper bg-[#f6f6f6] rounded-t-[50px] border-[#606060] select-none"
      >
        {/* Solutions section sitting behind everything */}
        <div ref={eyesWrapperRef} className="absolute inset-0 z-[2] pointer-events-auto">
          <Solutions />
        </div>

        {/* Phase 1: Initial View */}
        <div ref={initialViewRef} className="info-initial-view">
          {/* WebGL Fluid Simulation Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          />

          {/* Top Left Content: Title and Paragraph */}
          <div className="absolute top-8 left-6 right-6 md:top-14 md:left-14 md:right-14 z-20 text-left">
            <h2
              ref={titleRef}
              className="font-bebas text-[11vw] sm:text-[9vw] md:text-[6.5vw] font-bold uppercase tracking-[0.02em] leading-none text-black select-none"
            >
              {"Fragrance, Thoughtfully Engineered".split(" ").map((word, wIdx, arr) => (
                <span key={wIdx} className="inline-block whitespace-nowrap">
                  {word.split("").map((char, cIdx) => (
                    <span key={cIdx} className="char inline-block">
                      {char}
                    </span>
                  ))}
                  {wIdx < arr.length - 1 && "\u00A0"}
                </span>
              ))}
            </h2>
            <p
              ref={descRef}
              className="font-normal text-[16px] sm:text-[18px] md:text-[24px] text-[#606060] leading-[24px] sm:leading-[26px] md:leading-[30px] tracking-normal max-w-[900px] mt-3 md:mt-6"
            >
              {"At Veroma, we believe fragrance shapes how a space is experienced. Through carefully developed scent solutions, we create elevated environments that inspire comfort and lasting impressions.".split(" ").map((word, wIdx, arr) => (
                <span key={wIdx} className="inline-block whitespace-nowrap">
                  {word.split("").map((char, cIdx) => (
                    <span key={cIdx} className="char inline-block">
                      {char}
                    </span>
                  ))}
                  {wIdx < arr.length - 1 && "\u00A0"}
                </span>
              ))}
            </p>
          </div>

          {/* 50% width and height, left-aligned, and at the bottom of the section */}
          <div
            ref={containerRef}
            className="absolute left-0 bottom-0 w-full h-[55%] sm:w-[85%] sm:h-[60%] md:w-[70%] md:h-[70%] overflow-hidden z-10"
          >
            {/* Base Image Layer (z-10) */}
            <div
              className="absolute inset-0 bg-left-bottom bg-contain bg-no-repeat z-10"
              style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
            />

            {/* Reveal Layer (z-30) */}
            <RevealLayer
              image={BG_IMAGE_2}
              cursorX={cursorPos.x}
              cursorY={cursorPos.y}
            />
          </div>

          {/* Bottom Right Content: Rotating Text Badge */}
          {/* On mobile: centered between title and image. On md+: bottom-right */}
          <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 md:top-auto md:translate-y-0 md:left-auto md:translate-x-0 md:right-12 md:bottom-12 z-20">
            <a
              href="#discover"
              className="group relative flex items-center justify-center w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 lg:w-72 lg:h-72"
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
              <div className="w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border border-black flex items-center justify-center transition-all duration-300 bg-transparent group-hover:bg-black group-hover:scale-105 z-10">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 stroke-black group-hover:stroke-white stroke-[1.2] fill-none transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  viewBox="0 0 24 24"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="10 7 17 7 17 14" />
                </svg>
              </div>
            </a>
          </div>
        </div>

        {/* Phase 2: Revealer */}
        <div ref={revealerRef} className="info-revealer" />



        {/* Phase 4: Split Outro Content */}
        <div ref={outroLeftRef} className="info-outro-left">
          <div className="info-outro-inner">
            <h1 className="text-white">
              WHY<br />CHOOSE US?
            </h1>
          </div>
        </div>
        <div ref={outroRightRef} className="info-outro-right">
          <div className="info-outro-inner">
            <h1 className="text-white">
              WHY<br />CHOOSE US?
            </h1>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Info;

