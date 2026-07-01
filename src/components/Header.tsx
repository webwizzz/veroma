"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export const Header = () => {
    const headerRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
        const header = headerRef.current;
        if (!header) return;

        // Animate header yPercent from -100 to 0 (default)
        const showAnim = gsap.from(header, {
            yPercent: -100,
            paused: true,
            duration: 0.4,
            ease: "power2.out"
        }).progress(1); // Set to progress(1) so it starts in its normal visible state

        const trigger = ScrollTrigger.create({
            start: "top top",
            end: "max",
            onUpdate: (self) => {
                if (self.scroll() < 10) {
                    showAnim.play();
                } else if (self.direction === 1) {
                    showAnim.reverse();
                } else if (self.direction === -1) {
                    showAnim.play();
                }
            }
        });

        return () => {
            showAnim.kill();
            trigger.kill();
        };
    }, []);

    return (
        <header
            ref={headerRef}
            className="fixed bg-white top-0 left-0 w-full z-50 flex justify-between items-center px-2 md:px-4 py-6 md:py-4 pointer-events-none select-none"
        >
            {/* Brand Logo */}
            <div className="pointer-events-auto">
                <a
                    href="#"
                    className="font-cormorant text-2xl md:text-3xl font-medium tracking-[0.1rem] text-black hover:text-black transition-colors duration-300 focus:outline-none"
                >
                    VEROMA
                </a>
            </div>

            {/* Menu Circle Button */}
            <div className="pointer-events-auto">
                <button
                    aria-label="Menu"
                    className="group relative w-9 h-9 rounded-full border-2 border-black flex items-center justify-center hover:scale-105 transition-all duration-500 ease-out focus:outline-none cursor-pointer"
                >
                    {/* Outer Circle Hover Effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-black opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out"></div>
                </button>
            </div>
        </header>
    );
};

export default Header;
