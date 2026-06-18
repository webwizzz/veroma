"use client";

import { cylinderConfig, imageConfig, images, particleConfig, widgets } from "@/lib/variant-1/data";
import { cylinderFragment, cylinderVertex, particleFragment, particleVertex, yellowLineFragment } from "@/lib/variant-1/shaders";
import type { CameraAnimation, ParticleMesh } from "@/lib/variant-1/types";
import {
    createCylinderGeometry,
    createLinePlaneGeometry,
    createParticleGeometry,
    drawImageContain,
    drawImageCover,
} from "@/lib/variant-1/utils";
import { Camera, Mesh, Program, Renderer, Texture, Transform } from "ogl";
import React, { useEffect, useRef, useState } from "react";

interface Animation3DProps {
    is3D: boolean;
    updateActiveBackground: (index: number) => void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const getActiveIndexFromRotation = (rotY: number, numImages: number) => {
    let thetaLocal = (Math.PI / 2) - rotY;
    const twoPi = 2 * Math.PI;
    thetaLocal = ((thetaLocal % twoPi) + twoPi) % twoPi;
    return Math.floor((thetaLocal / twoPi) * numImages);
};

export const Animation3D: React.FC<Animation3DProps> = ({
    is3D,
    updateActiveBackground,
}) => {
    const [isLoading3D, setIsLoading3D] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeIndexRef = useRef(0);

    // 3D Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const sceneRef = useRef<Transform | null>(null);
    const cameraRef = useRef<Camera | null>(null);
    const cylinderRef = useRef<Mesh | null>(null);
    const cameraAnimRef = useRef<CameraAnimation>({ x: 0, y: 0, z: 8, rotY: 0 });
    const particlesRef = useRef<ParticleMesh[]>([]);
    const leftLineRef = useRef<Mesh | null>(null);
    const rightLineRef = useRef<Mesh | null>(null);

    // Mouse tracking for interactive 3D parallax tilt
    const mouseRef = useRef({ x: 0, y: 0 });
    const targetMouseRef = useRef({ x: 0, y: 0 });

    // Shared Animation/Interaction Values
    const lastRotationRef = useRef(0);
    const velocityRef = useRef(0);
    const momentumRef = useRef(0);
    const targetRotationYRef = useRef(1.256637); // Start angle for image 0

    const lastClickTimeRef = useRef(0);

    const handlePrev = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 600) return; // Cooldown/Throttle to let rotation start
        lastClickTimeRef.current = now;
        targetRotationYRef.current += (2 * Math.PI) / widgets.length;
    };

    const handleNext = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 600) return; // Cooldown/Throttle to let rotation start
        lastClickTimeRef.current = now;
        targetRotationYRef.current -= (2 * Math.PI) / widgets.length;
    };

    // Reset loading state when toggling off
    useEffect(() => {
        if (!is3D) {
            setIsLoading3D(true);
        }
    }, [is3D]);

    // 3D OGL & Interaction Setup
    useEffect(() => {
        if (!is3D) return;
        if (!canvasRef.current) return;

        let animId: number;

        const handleMouseMove = (e: MouseEvent) => {
            targetMouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });

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
        gl.disable(gl.CULL_FACE);
        rendererRef.current = renderer;

        const getResponsiveDimensions = () => {
            const width = window.innerWidth;
            const isMobile = width < 768;
            const isTablet = width >= 768 && width < 1024;

            const maxRadius = isMobile ? 1.3 : isTablet ? 1.8 : 2.5;
            const cylinderHeight = isMobile ? 1.2 : isTablet ? 1.5 : 2.4;
            const cameraZ = isMobile ? 5.3 : isTablet ? 6.3 : 6.7;
            const fov = isMobile ? 50 : 47;

            return {
                cylinderScale: maxRadius / cylinderConfig.radius,
                cylinderHeight,
                cameraZ,
                fov,
                isMobile,
            };
        };

        const dimensions3D = getResponsiveDimensions();

        const cameraOptions: any = { fov: dimensions3D.fov };
        if (dimensions3D.isMobile) {
            cameraOptions.aspect = window.innerWidth / window.innerHeight;
        }
        const camera = new Camera(gl, cameraOptions);
        camera.position.set(0, 0, dimensions3D.cameraZ);
        cameraRef.current = camera;

        const scene = new Transform();
        scene.rotation.x = -0.08; // Subtle pitch (tilted slightly back)
        scene.rotation.z = 0.12;  // Subtle roll (diagonal rise from left to right)
        sceneRef.current = scene;

        const geometry = createCylinderGeometry(gl, cylinderConfig);

        const hardwareLimit = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        const isMobileDevice = window.innerWidth < 768;
        const safeLimit = isMobileDevice ? 2048 : Math.min(hardwareLimit, 8192);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", {
            willReadFrequently: false,
            alpha: true,
        })!;
        const numImages = images.length;

        const totalWidthOriginal = imageConfig.width * numImages;
        const heightOriginal = imageConfig.height;

        const scale = Math.min(1, safeLimit / totalWidthOriginal);

        canvas.width = Math.floor(totalWidthOriginal * scale);
        canvas.height = Math.floor(heightOriginal * scale);

        let loadedImages = 0;
        const imageElements: HTMLImageElement[] = [];

        const circumference = 2 * Math.PI * cylinderConfig.radius;
        const textureAspectRatio = imageConfig.height / (imageConfig.width * images.length);
        const idealHeight = circumference * textureAspectRatio;
        const heightCorrection = (idealHeight / cylinderConfig.height) * 1.15;

        let lastWidth = window.innerWidth;

        const handleResize3D = () => {
            if (rendererRef.current && cameraRef.current && cylinderRef.current) {
                const currentWidth = window.innerWidth;
                const newDimensions = getResponsiveDimensions();

                if (newDimensions.isMobile && currentWidth === lastWidth) {
                    return;
                }
                lastWidth = currentWidth;

                rendererRef.current.setSize(currentWidth, window.innerHeight);

                cameraRef.current.perspective({
                    fov: newDimensions.fov,
                    aspect: currentWidth / window.innerHeight,
                });

                const scaleX = newDimensions.cylinderScale;
                const scaleY = newDimensions.cylinderScale * heightCorrection;
                const scaleZ = newDimensions.cylinderScale;

                cylinderRef.current.scale.set(
                    scaleX,
                    scaleY,
                    scaleZ
                );



                if (cameraAnimRef.current.z === 8 || cameraAnimRef.current.z === 7 || cameraAnimRef.current.z === 6) {
                    cameraAnimRef.current.z = newDimensions.cameraZ;
                }
            }
        };

        images.forEach((imageSrc, index) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                imageElements[index] = img;
                loadedImages++;

                const totalCanvasWidth = canvas.width;
                const canvasHeight = canvas.height;

                if (loadedImages === numImages) {
                    // Clear canvas to be fully transparent
                    ctx.clearRect(0, 0, totalCanvasWidth, canvasHeight);

                    imageElements.forEach((img, i) => {
                        const xStartExact = (i / numImages) * totalCanvasWidth;
                        const xEndExact = ((i + 1) / numImages) * totalCanvasWidth;

                        const xPos = Math.floor(xStartExact);
                        const xEnd = Math.floor(xEndExact);

                        const drawWidthActual = xEnd - xPos;

                        // Apply a gap of 12% of each segment's width
                        const gapWidth = Math.floor(drawWidthActual * 0.12);
                        const adjustedX = xPos + Math.floor(gapWidth / 2);
                        const adjustedWidth = drawWidthActual - gapWidth;

                        const cardHeight = canvasHeight * 0.85;
                        const cardY = (canvasHeight - cardHeight) / 2;
                        const cardRadius = Math.floor(cardHeight * 0.05);
                        const borderWidth = Math.max(1.5, cardHeight * 0.004);

                        // Draw card background and clip
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(adjustedX + cardRadius, cardY);
                        ctx.arcTo(adjustedX + adjustedWidth, cardY, adjustedX + adjustedWidth, cardY + cardHeight, cardRadius);
                        ctx.arcTo(adjustedX + adjustedWidth, cardY + cardHeight, adjustedX, cardY + cardHeight, cardRadius);
                        ctx.arcTo(adjustedX, cardY + cardHeight, adjustedX, cardY, cardRadius);
                        ctx.arcTo(adjustedX, cardY, adjustedX + adjustedWidth, cardY, cardRadius);
                        ctx.closePath();
                        
                        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
                        ctx.fill();
                        ctx.clip();

                        // Draw the cover image
                        drawImageCover(ctx, img, adjustedX, cardY, adjustedWidth, cardHeight);
                        ctx.restore();

                        // Draw premium sleek border on top
                        ctx.save();
                        ctx.beginPath();
                        const inset = borderWidth / 2;
                        ctx.moveTo(adjustedX + inset + cardRadius, cardY + inset);
                        ctx.arcTo(adjustedX + adjustedWidth - inset, cardY + inset, adjustedX + adjustedWidth - inset, cardY + cardHeight - inset, cardRadius);
                        ctx.arcTo(adjustedX + adjustedWidth - inset, cardY + cardHeight - inset, adjustedX + inset, cardY + cardHeight - inset, cardRadius);
                        ctx.arcTo(adjustedX + inset, cardY + cardHeight - inset, adjustedX + inset, cardY + inset, cardRadius);
                        ctx.arcTo(adjustedX + inset, cardY + inset, adjustedX + adjustedWidth - inset, cardY + inset, cardRadius);
                        ctx.closePath();

                        ctx.lineWidth = borderWidth;
                        ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
                        ctx.stroke();
                        ctx.restore();
                    });

                    const texture = new Texture(gl, {
                        wrapS: gl.CLAMP_TO_EDGE,
                        wrapT: gl.CLAMP_TO_EDGE,
                        minFilter: gl.LINEAR,
                        magFilter: gl.LINEAR,
                        generateMipmaps: false,
                    });

                    texture.image = canvas;
                    texture.needsUpdate = true;

                    const program = new Program(gl, {
                        vertex: cylinderVertex,
                        fragment: cylinderFragment,
                        uniforms: {
                            tMap: { value: texture },
                            uDarkness: { value: 0.3 },
                        },
                        cullFace: null,
                        transparent: true,
                    });

                    const cylinder = new Mesh(gl, { geometry, program });
                    cylinder.setParent(scene);
                    cylinder.rotation.y = targetRotationYRef.current;
                    cylinderRef.current = cylinder;

                    const initialScaleX = dimensions3D.cylinderScale;
                    const initialScaleY = dimensions3D.cylinderScale * heightCorrection;
                    const initialScaleZ = dimensions3D.cylinderScale;

                    cylinder.scale.set(initialScaleX, initialScaleY, initialScaleZ);

                    setIsLoading3D(false);

                    // Set initial camera target values responsive
                    cameraAnimRef.current.x = 0;
                    cameraAnimRef.current.y = 0;
                    cameraAnimRef.current.z = dimensions3D.cameraZ;

                    // Reset particle array
                    particlesRef.current = [];

                    for (let i = 0; i < particleConfig.numParticles; i++) {
                        const { geometry: lineGeometry, userData } = createParticleGeometry(
                            gl,
                            particleConfig,
                            i,
                            cylinderConfig.height * 1.15
                        );

                        const lineProgram = new Program(gl, {
                            vertex: particleVertex,
                            fragment: particleFragment,
                            uniforms: {
                                uColor: { value: [1.0, 1.0, 1.0] },
                                uOpacity: { value: 0.0 },
                            },
                            transparent: true,
                            depthTest: true,
                        });

                        const particle = new Mesh(gl, {
                            geometry: lineGeometry,
                            program: lineProgram,
                            mode: gl.LINE_STRIP,
                        }) as ParticleMesh;

                        particle.userData = userData;
                        particle.setParent(scene);
                        particlesRef.current.push(particle);
                    }

                    window.addEventListener("resize", handleResize3D);

                    const animate = () => {
                        animId = requestAnimationFrame(animate);

                        // Smoothly lerp mouse coordinates
                        mouseRef.current.x = lerp(mouseRef.current.x, targetMouseRef.current.x, 0.05);
                        mouseRef.current.y = lerp(mouseRef.current.y, targetMouseRef.current.y, 0.05);

                        // Gentle floating bobbing motion (vertical translation & slight rotational sway)
                        const time = performance.now();
                        const floatY = Math.sin(time * 0.001) * 0.06;
                        const floatSway = Math.cos(time * 0.0008) * 0.015;

                        scene.position.y = floatY;

                        const baseRotX = -0.08;
                        const baseRotZ = 0.12;

                        scene.rotation.x = baseRotX + floatSway + mouseRef.current.y * 0.08; // Pitch with floating sway + mouse Y
                        scene.rotation.y = mouseRef.current.x * 0.08;                         // Yaw based on mouse X
                        scene.rotation.z = baseRotZ + floatSway * 0.5 - mouseRef.current.x * 0.05; // Roll with floating sway + mouse X

                        camera.position.set(cameraAnimRef.current.x, cameraAnimRef.current.y, cameraAnimRef.current.z);
                        camera.lookAt([0, 0, 0]);

                        if (cylinderRef.current) {
                            // Smoothly interpolate cylinder rotation to target rotation Y
                            cylinderRef.current.rotation.y = lerp(
                                cylinderRef.current.rotation.y,
                                targetRotationYRef.current,
                                0.08
                            );

                            const currentRotation = cylinderRef.current.rotation.y;

                            const newActiveIndex = getActiveIndexFromRotation(currentRotation, widgets.length);
                            updateActiveBackground(newActiveIndex);

                            if (activeIndexRef.current !== newActiveIndex) {
                                activeIndexRef.current = newActiveIndex;
                                setActiveIndex(newActiveIndex);
                            }

                            velocityRef.current = currentRotation - lastRotationRef.current;
                            lastRotationRef.current = currentRotation;

                            const inertiaFactor = 0.15;
                            const decayFactor = 0.92;

                            momentumRef.current = momentumRef.current * decayFactor + velocityRef.current * inertiaFactor;

                            const speed = Math.abs(velocityRef.current) * 100;
                            const isRotating = Math.abs(velocityRef.current) > 0.0001;

                            particlesRef.current.forEach((particle) => {
                                const userData = particle.userData;
                                const targetOpacity = isRotating ? Math.min(speed * 3, 0.95) : 0;
                                const currentOpacity = particle.program.uniforms.uOpacity.value as number;
                                particle.program.uniforms.uOpacity.value = currentOpacity + (targetOpacity - currentOpacity) * 0.15;

                                if (isRotating) {
                                    const rotationOffset = velocityRef.current * userData.speed * 1.5;
                                    const newBaseAngle = userData.baseAngle + rotationOffset;
                                    userData.baseAngle = newBaseAngle;

                                    const segments = particleConfig.segments;
                                    const positions = particle.geometry.attributes.position.data as Float32Array;

                                    for (let j = 0; j <= segments; j++) {
                                        const t = j / segments;
                                        const angle = newBaseAngle + userData.angleSpan * t;
                                        const radiusWithSpeed = userData.radius;

                                        positions[j * 3] = Math.cos(angle) * radiusWithSpeed;
                                        positions[j * 3 + 1] = userData.baseY;
                                        positions[j * 3 + 2] = Math.sin(angle) * radiusWithSpeed;
                                    }

                                    particle.geometry.attributes.position.needsUpdate = true;
                                }
                            });
                        }

                        renderer.render({ scene, camera });
                    };
                    animate();

                    return () => {
                        cancelAnimationFrame(animId);
                    };
                }
            };
            img.onerror = () => {
                console.error("Failed to load image:", imageSrc);
                setIsLoading3D(false);
            };
            img.src = imageSrc;
        });

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize3D);
            if (animId) cancelAnimationFrame(animId);
        };
    }, [is3D]);

    return (
        <>
            {/* Loader Overlay for 3D Initializing */}
            {is3D && isLoading3D && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F6F6F6] transition-opacity duration-300">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
                        <span className="text-black/60 text-sm font-mono tracking-widest uppercase animate-pulse">Initializing 3D Carousel</span>
                    </div>
                </div>
            )}

            {/* 3D View Container (Rounded Black Card) */}
            <div
                className={`fixed inset-x-6 bottom-6 top-20 z-0 bg-black rounded-[32px] overflow-hidden transition-opacity duration-700 ease-in-out ${is3D ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
                {/* Background Video */}
                <video
                    src="/video/diffuser.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute bottom-[-2rem] left-[30rem] -translate-x-[50%] w-[100%] h-[50%] object-contain pointer-events-none z-0"
                />

                {/* Top Left Tagline */}
                <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20 pointer-events-none select-none">
                    <p className="font-bebas italic text-3xl sm:text-4xl md:text-5xl text-white/90 leading-none tracking-wide whitespace-nowrap">
                        Breathe Luxury, Feel Serenity.
                    </p>
                </div>

                <canvas
                    ref={canvasRef}
                    className="absolute left-[-1.5rem] top-[-7rem] w-screen h-screen max-w-none z-10"
                    style={{ display: "block" }}
                />

                {/* Horizontally Stacked Navigation Buttons at the bottom left */}
                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 flex flex-row gap-4 md:gap-5 z-20">
                    {/* Previous Slide Button (Left) */}
                    <button
                        onClick={handlePrev}
                        aria-label="Previous Project"
                        className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none"
                    >
                        {/* Gradient Border Circle */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="btn-grad-prev" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#a78bfa" />
                                    <stop offset="33%" stopColor="#f472b6" />
                                    <stop offset="66%" stopColor="#fb7185" />
                                    <stop offset="100%" stopColor="#60a5fa" />
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="48" stroke="url(#btn-grad-prev)" strokeWidth="2.5" fill="none" />
                        </svg>

                        {/* Larger Arrow Icon */}
                        <svg className="w-6 h-6 md:w-8 md:h-8 fill-white translate-x-[-1px] group-hover:scale-110 transition-transform z-10" viewBox="0 0 24 24">
                            <path d="M16 4l-12 8 12 8z" />
                        </svg>
                    </button>

                    {/* Next Slide Button (Right) */}
                    <button
                        onClick={handleNext}
                        aria-label="Next Project"
                        className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none"
                    >
                        {/* Gradient Border Circle */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="btn-grad-next" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#a78bfa" />
                                    <stop offset="33%" stopColor="#f472b6" />
                                    <stop offset="66%" stopColor="#fb7185" />
                                    <stop offset="100%" stopColor="#60a5fa" />
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="48" stroke="url(#btn-grad-next)" strokeWidth="2.5" fill="none" />
                        </svg>

                        {/* Larger Arrow Icon */}
                        <svg className="w-6 h-6 md:w-8 md:h-8 fill-white translate-x-[1px] group-hover:scale-110 transition-transform z-10" viewBox="0 0 24 24">
                            <path d="M8 4l12 8-12 8z" />
                        </svg>
                    </button>
                </div>

                {/* Flower Info Overlay (Bottom Right) */}
                <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-20 flex flex-col items-start text-left max-w-[320px] sm:max-w-sm md:max-w-lg pointer-events-auto">
                    {/* Flower Name */}
                    <h2 className="font-bebas font-bold text-[4.5rem] sm:text-[6.5rem] md:text-[8.5rem] text-white leading-none tracking-tight uppercase select-none whitespace-nowrap -ml-8 sm:-ml-16 md:-ml-28">
                        {widgets[activeIndex]?.name}
                    </h2>
                    
                    {/* Short Description */}
                    <p className="mt-3 text-xs sm:text-sm md:text-base font-sans font-light text-white/80 select-none leading-relaxed">
                        {widgets[activeIndex]?.desc}
                    </p>
                    
                    {/* CTA Button */}
                    <button className="mt-5 px-6 md:px-8 py-2 md:py-2.5 rounded-full bg-white text-black font-sans font-bold text-xs md:text-sm tracking-wider uppercase cursor-pointer hover:scale-105 hover:bg-white/90 active:scale-95 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] self-end">
                        Discover
                    </button>
                </div>
            </div>
        </>
    );
};

export default Animation3D;
