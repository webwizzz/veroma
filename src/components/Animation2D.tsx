"use client";

import React, { useEffect, useRef, useState } from "react";
import { widgets } from "@/lib/variant-1/data";

interface Animation2DProps {
    is3D: boolean;
    isTransitionFinished: boolean;
    isTransitionActive: boolean;
    updateActiveBackground: (index: number) => void;
    setActiveTransitionImage: (image: string | null) => void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const Animation2D: React.FC<Animation2DProps> = ({
    is3D,
    isTransitionFinished,
    isTransitionActive,
    updateActiveBackground,
    setActiveTransitionImage,
}) => {
    // 2D Refs
    const container2DRef = useRef<HTMLDivElement | null>(null);
    const title2DRef = useRef<HTMLDivElement | null>(null);
    const spinnerGroup2DRef = useRef<SVGGElement | null>(null);
    const indicator2DRef = useRef<SVGLineElement | null>(null);

    // 2D States and Ref tracking
    const [dimensions, setDimensions] = useState({
        centerX: 0,
        centerY: 0,
        outerRadius: 0,
        innerRadius: 0,
    });

    const currentIndicatorRotation = useRef(0);
    const targetIndicatorRotation = useRef(0);
    const isMouseOverSpinnerRef = useRef(false);
    const maskCircleRef = useRef<SVGCircleElement | null>(null);
    const maskRadiusRef = useRef(0);
    const isPressingRef = useRef(false);
    const currentSpinnerRotation = useRef(0);
    const targetSpinnerRotation = useRef(0);
    const lastTime = useRef(performance.now());
    const lastSegmentIndex = useRef(-1);

    const isTransitionActiveRef = useRef(isTransitionActive);
    useEffect(() => {
        isTransitionActiveRef.current = isTransitionActive;
        if (!isTransitionActive) {
            lastSegmentIndex.current = -1;
        }
    }, [isTransitionActive]);

    // 2D Resize handler
    useEffect(() => {
        const handleResize2D = () => {
            if (!container2DRef.current) return;
            const rect = container2DRef.current.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const viewport = Math.min(width, height);

            setDimensions({
                centerX: width / 2,
                centerY: height / 2,
                outerRadius: viewport * 0.4,
                innerRadius: viewport * 0.25,
            });
        };

        handleResize2D();
        window.addEventListener("resize", handleResize2D);
        return () => window.removeEventListener("resize", handleResize2D);
    }, []);

    // 2D Content updates
    const updateContent2D = () => {
        const relative =
            (((currentIndicatorRotation.current - currentSpinnerRotation.current) % 360) + 360) % 360;

        const segmentIndex =
            Math.floor(relative / (360 / widgets.length)) % widgets.length;

        if (segmentIndex !== lastSegmentIndex.current) {
            lastSegmentIndex.current = segmentIndex;

            // Update text content
            if (title2DRef.current) {
                title2DRef.current.textContent = widgets[segmentIndex].name;
            }

            updateActiveBackground(segmentIndex);
        }
    };

    // 2D Animation Loop & Wheel Listener
    useEffect(() => {
        if (is3D) return;
        if (dimensions.outerRadius === 0) return;

        let animationFrameId: number;

        const animate = () => {
            const now = performance.now();
            let dt = (now - lastTime.current) / 1000;
            lastTime.current = now;
            dt = Math.min(dt, 0.1);

            if (!isMouseOverSpinnerRef.current) {
                targetIndicatorRotation.current += 18 * dt;
                targetSpinnerRotation.current -= 18 * 0.25 * dt;
            }

            // Reset press progress
            maskRadiusRef.current = 0;

            if (maskCircleRef.current) {
                maskCircleRef.current.setAttribute("r", String(maskRadiusRef.current));
                maskCircleRef.current.setAttribute("opacity", maskRadiusRef.current > 0.1 ? "1" : "0");
            }

            currentIndicatorRotation.current = lerp(
                currentIndicatorRotation.current,
                targetIndicatorRotation.current,
                0.1
            );
            currentSpinnerRotation.current = lerp(
                currentSpinnerRotation.current,
                targetSpinnerRotation.current,
                0.1
            );

            // Rotate indicator
            if (indicator2DRef.current) {
                indicator2DRef.current.setAttribute(
                    "transform",
                    `rotate(${currentIndicatorRotation.current % 360} ${dimensions.centerX} ${dimensions.centerY})`
                );
            }

            // Rotate segments group
            if (spinnerGroup2DRef.current) {
                spinnerGroup2DRef.current.setAttribute(
                    "transform",
                    `rotate(${currentSpinnerRotation.current % 360} ${dimensions.centerX} ${dimensions.centerY})`
                );
            }

            updateContent2D();
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        const handleWheel2D = (e: WheelEvent) => {
            if (isTransitionActiveRef.current) return;
            e.preventDefault();
            const delta = e.deltaY * 0.05;
            targetIndicatorRotation.current += delta;
            targetSpinnerRotation.current -= delta;
        };

        const handleMouseDown = () => {
            if (isTransitionActiveRef.current) return;
            if (isMouseOverSpinnerRef.current) {
                const activeIndex = lastSegmentIndex.current >= 0 ? lastSegmentIndex.current : 0;
                const activeWidget = widgets[activeIndex];
                setActiveTransitionImage(activeWidget.video || activeWidget.image);
            }
        };

        const handleMouseUp = () => {
            if (isTransitionActiveRef.current) return;
            isPressingRef.current = false;
        };

        const handleMouseMove2D = (e: MouseEvent) => {
            if (isTransitionActiveRef.current) return;
            const dx = e.clientX - dimensions.centerX;
            const dy = e.clientY - dimensions.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= dimensions.outerRadius) {
                isMouseOverSpinnerRef.current = true;
                document.body.classList.add("cursor-press-hold");
            } else {
                isMouseOverSpinnerRef.current = false;
                document.body.classList.remove("cursor-press-hold");
                isPressingRef.current = false; // also release press if they drag mouse outside
            }
        };

        window.addEventListener("wheel", handleWheel2D, { passive: false });
        window.addEventListener("mousemove", handleMouseMove2D, { passive: true });
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("touchstart", handleMouseDown, { passive: true });
        window.addEventListener("touchend", handleMouseUp, { passive: true });

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("wheel", handleWheel2D);
            window.removeEventListener("mousemove", handleMouseMove2D);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchstart", handleMouseDown);
            window.removeEventListener("touchend", handleMouseUp);
            document.body.classList.remove("cursor-press-hold");
            document.body.classList.remove("cursor-hidden-active");
        };
    }, [dimensions, is3D]);

    const { centerX, centerY, outerRadius, innerRadius } = dimensions;
    const anglePerSegment = (Math.PI * 2) / widgets.length;

    return (
        <div
            ref={container2DRef}
            className={`absolute inset-0 w-full h-[100svh] bg-transparent overflow-hidden transition-opacity duration-700 ease-in-out ${is3D || isTransitionFinished ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
            {/* Center title */}
            <div
                ref={title2DRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 uppercase text-[0.75rem] font-medium tracking-wider py-1 px-2.5 bg-[#ffff2b] text-black rounded-[0.125rem] z-10 font-mono shadow-[0_0_15px_rgba(255,255,43,0.3)] pointer-events-none"
            />

            {/* SVG Spinner */}
            {outerRadius > 0 && (
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <defs>
                        {widgets.map((_, i) => {
                            const start = i * anglePerSegment - Math.PI / 2;
                            const end = (i + 1) * anglePerSegment - Math.PI / 2;
                            const d = `
                              M ${centerX + outerRadius * Math.cos(start)} ${centerY + outerRadius * Math.sin(start)}
                              A ${outerRadius} ${outerRadius} 0 0 1 ${centerX + outerRadius * Math.cos(end)} ${centerY + outerRadius * Math.sin(end)}
                              L ${centerX + innerRadius * Math.cos(end)} ${centerY + innerRadius * Math.sin(end)}
                              A ${innerRadius} ${innerRadius} 0 0 0 ${centerX + innerRadius * Math.cos(start)} ${centerY + innerRadius * Math.sin(start)}
                              Z
                            `;
                            return (
                                <clipPath id={`clip-${i}`} key={i}>
                                    <path d={d} />
                                </clipPath>
                            );
                        })}
                    </defs>

                    {/* Rotation group for the spinner */}
                    <g ref={spinnerGroup2DRef}>
                        {widgets.map((widget, i) => {
                            const start = i * anglePerSegment - Math.PI / 2;
                            const end = (i + 1) * anglePerSegment - Math.PI / 2;
                            const mid = (start + end) / 2;
                            const radius = (innerRadius + outerRadius) / 2;
                            const x = centerX + Math.cos(mid) * radius;
                            const y = centerY + Math.sin(mid) * radius;

                            const arc = outerRadius * anglePerSegment;
                            const w = arc * 1.25;
                            const h = (outerRadius - innerRadius) * 1.25;
                            const rotation = (mid * 180) / Math.PI + 90;

                            return (
                                <g key={i} clipPath={`url(#clip-${i})`}>
                                    <image
                                        href={widget.image}
                                        width={w}
                                        height={h}
                                        x={x - w / 2}
                                        y={y - h / 2}
                                        preserveAspectRatio="xMidYMid slice"
                                        transform={`rotate(${rotation} ${x} ${y})`}
                                    />
                                </g>
                            );
                        })}
                    </g>

                    {/* Indicator */}
                    <line
                        ref={indicator2DRef}
                        x1={centerX}
                        y1={centerY - (outerRadius * 0.625) * 0.85}
                        x2={centerX}
                        y2={centerY - outerRadius * 1.05}
                        stroke="#ffff2b"
                        strokeWidth={3}
                        strokeLinecap="round"
                    />
                </svg>
            )}
        </div>
    );
};

export default Animation2D;
