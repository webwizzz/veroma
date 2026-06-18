"use client";

import React, { useEffect, useRef, useState } from "react";
import RevealLayer from "../components/RevealLayer";

const BG_IMAGE_1 = "/cliff/dry.png";
const BG_IMAGE_2 = "/cliff/green.png";

const Info = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);

  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

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

  return (
    <div
      className="sticky top-0 w-full overflow-hidden bg-white z-10"
      style={{ height: "100dvh" }}
    >
      {/* 50% width and height, left-aligned, and at the bottom of the section */}
      <div
        ref={containerRef}
        className="absolute left-0 bottom-0 w-1/2 h-1/2 overflow-hidden"
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
    </div>
  );
};

export default Info;
