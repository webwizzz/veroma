"use client";

import React, { useEffect, useRef } from "react";
import { Renderer, Geometry, Program, Mesh, Texture } from "ogl";
import gsap from "gsap";

interface CircularTransitionProps {
    imageSrc: string;
    onTransitionComplete: (completed: boolean) => void;
    onClose: () => void;
}

export const CircularTransition: React.FC<CircularTransitionProps> = ({
    imageSrc,
    onTransitionComplete,
    onClose,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep GSAP timeline ref to reverse it on close
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const uniformsRef = useRef<{
        uTransitionTimer: { value: number };
        uAspect: { value: number };
        uImageAspect: { value: number };
    }>({
        uTransitionTimer: { value: 0 },
        uAspect: { value: 1 },
        uImageAspect: { value: 1 },
    });

    useEffect(() => {
        if (!canvasRef.current) return;

        let animId: number;

        // Create OGL context
        const renderer = new Renderer({
            canvas: canvasRef.current,
            width: window.innerWidth,
            height: window.innerHeight,
            dpr: Math.min(window.devicePixelRatio, 2),
            alpha: true,
            antialias: true,
        });

        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);

        // Aspect ratio tracking
        uniformsRef.current.uAspect.value = window.innerWidth / window.innerHeight;

        // Full-screen quad geometry (position: x, y, z; uv: u, v)
        const geometry = new Geometry(gl, {
            position: {
                size: 3,
                data: new Float32Array([
                    -1, -1, 0,
                     1, -1, 0,
                    -1,  1, 0,
                    -1,  1, 0,
                     1, -1, 0,
                     1,  1, 0,
                ]),
            },
            uv: {
                size: 2,
                data: new Float32Array([
                    0, 0,
                    1, 0,
                    0, 1,
                    0, 1,
                    1, 0,
                    1, 1,
                ]),
            },
        });

        const vertexShader = `
            attribute vec2 uv;
            attribute vec3 position;

            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            precision mediump float;

            varying vec2 vUv;

            uniform float uTransitionTimer;
            uniform sampler2D uTexture;
            uniform float uAspect;
            uniform float uImageAspect;

            float circle(in vec2 uv, in float radius, in float sharpness) {
                float dist = length(uv - vec2(0.5));
                return 1. - smoothstep(radius - sharpness, radius, dist);
            }

            void main() {
                float progress = clamp(uTransitionTimer, 0.0, 1.0);

                // Aspect ratio fit (cover)
                vec2 uv = vUv;
                if (uAspect > uImageAspect) {
                    float s = uAspect / uImageAspect;
                    uv.y = (vUv.y - 0.5) / s + 0.5;
                } else {
                    float s = uImageAspect / uAspect;
                    uv.x = (vUv.x - 0.5) / s + 0.5;
                }

                vec2 center = vec2(0.5);
                vec2 centerVector = uv - center;

                // Circular warp transition expansion
                float circleProgress = circle(vUv, progress * 0.95, 0.22);
                float ease = progress * (2. - progress);

                vec2 nextUV = uv + centerVector * (circleProgress - 1.0) + centerVector * (1. - ease) * 0.1;

                // Clamp to border to prevent texture wrap artifacts
                nextUV = clamp(nextUV, 0.001, 0.999);

                vec4 next = texture2D(uTexture, nextUV);

                // Mix transparent outside the circle with the project image inside the circle
                gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 0.0), next, circleProgress);
            }
        `;

        const isVideo = imageSrc.endsWith(".mp4");
        let videoEl: HTMLVideoElement | null = null;
        let imgEl: HTMLImageElement | null = null;

        // Create texture
        const texture = new Texture(gl, {
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE,
            minFilter: gl.LINEAR,
            magFilter: gl.LINEAR,
            generateMipmaps: false,
        });

        const startTransitionTimeline = () => {
            // Run entry transition animation
            const tl = gsap.timeline({
                onComplete: () => {
                    onTransitionComplete(true);
                }
            });
            timelineRef.current = tl;

            tl.to(uniformsRef.current.uTransitionTimer, {
                value: 1.0,
                duration: 1.6,
                ease: "power2.inOut",
            });
        };

        if (isVideo) {
            videoEl = document.createElement("video");
            videoEl.src = imageSrc;
            videoEl.muted = true;
            videoEl.loop = true;
            videoEl.playsInline = true;
            videoEl.autoplay = true;

            // Force browser to load metadata/data
            videoEl.load();

            videoEl.onloadeddata = () => {
                texture.image = videoEl!;
                texture.needsUpdate = true;
                uniformsRef.current.uImageAspect.value = videoEl!.videoWidth / videoEl!.videoHeight;
                
                videoEl!.play().catch(err => console.log("Video autoplay failed:", err));
                startTransitionTimeline();
            };
        } else {
            imgEl = new Image();
            imgEl.crossOrigin = "anonymous";
            imgEl.onload = () => {
                texture.image = imgEl!;
                texture.needsUpdate = true;
                uniformsRef.current.uImageAspect.value = imgEl!.width / imgEl!.height;
                startTransitionTimeline();
            };
            imgEl.src = imageSrc;
        }

        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTransitionTimer: uniformsRef.current.uTransitionTimer,
                uTexture: { value: texture },
                uAspect: uniformsRef.current.uAspect,
                uImageAspect: uniformsRef.current.uImageAspect,
            },
            depthTest: false,
            depthWrite: false,
        });

        const mesh = new Mesh(gl, { geometry, program });

        // Animation render loop
        const animate = () => {
            animId = requestAnimationFrame(animate);
            if (isVideo && videoEl && videoEl.readyState >= 2) {
                texture.needsUpdate = true;
            }
            renderer.render({ scene: mesh });
        };
        animate();

        // Handle window resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            uniformsRef.current.uAspect.value = width / height;
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", handleResize);
            if (videoEl) {
                videoEl.pause();
                videoEl.src = "";
                videoEl.load();
            }
        };
    }, [imageSrc]);

    const handleClose = () => {
        if (!timelineRef.current) return;

        onTransitionComplete(false);

        // Play transition in reverse
        const tl = gsap.timeline({
            onComplete: () => {
                onClose();
            }
        });

        // Run shader transition timer back to 0
        tl.to(uniformsRef.current.uTransitionTimer, {
            value: 0.0,
            duration: 1.2,
            ease: "power2.inOut",
        });
    };

    return (
        <div
            ref={containerRef}
            onClick={handleClose}
            className="fixed inset-0 w-full h-full z-[100] bg-transparent overflow-hidden flex items-center justify-center select-none cursor-pointer"
        >
            {/* Transition Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
        </div>
    );
};

export default CircularTransition;
