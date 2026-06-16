"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Camera, Mesh, Program, Renderer, Texture, Transform } from "ogl";
import { useEffect, useRef, useState } from "react";
import CustomCursor from "./CustomCursor";

import { cylinderConfig, imageConfig, images, particleConfig, perspectives } from "@/lib/variant-1/data";
import { cylinderFragment, cylinderVertex, particleFragment, particleVertex, yellowLineFragment } from "@/lib/variant-1/shaders";
import { CircularTransition } from "./CircularTransition";
import type { CameraAnimation, ParticleMesh } from "@/lib/variant-1/types";
import {
    createCylinderGeometry,
    createLinePlaneGeometry,
    createParticleGeometry,
    drawImageCover,
} from "@/lib/variant-1/utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(CustomEase);

    CustomEase.create("cinematicSilk", "0.45, 0.05, 0.55, 0.95");
    CustomEase.create("cinematicSmooth", "0.25, 0.1, 0.25, 1");
    CustomEase.create("cinematicFlow", "0.33, 0, 0.2, 1");
    CustomEase.create("cinematicLinear", "0.4, 0, 0.6, 1");
}

const widgets = [
    { image: "/widget1.jpg", name: "Velvet" },
    { image: "/widget2.jpg", name: "Glass Relay" },
    { image: "/widget3.jpg", video: "/musk.mp4", name: "Noir-17" },
    { image: "/widget4.jpg", name: "Driftline" },
    { image: "/widget5.jpg", name: "Pulse 9" },
    { image: "/widget6.jpg", name: "Cold Meridian" },
    { image: "/widget7.jpg", name: "Astra" },
    { image: "/widget8.jpg", name: "Mono Circuit" },
    { image: "/widget9.jpg", name: "Lumen-04" },
    { image: "/widget10.jpg", name: "Shadow Bloom" },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const getActiveIndexFromRotation = (rotY: number, numImages: number) => {
    let thetaLocal = (Math.PI / 2) - rotY;
    const twoPi = 2 * Math.PI;
    thetaLocal = ((thetaLocal % twoPi) + twoPi) % twoPi;
    return Math.floor((thetaLocal / twoPi) * numImages);
};

const Hero = () => {
    // Mode state
    const [is3D, setIs3D] = useState(false);
    const [isLoading3D, setIsLoading3D] = useState(true);
    const [activeTransitionImage, setActiveTransitionImage] = useState<string | null>(null);
    const [isTransitionFinished, setIsTransitionFinished] = useState(false);

    const isTransitionActiveRef = useRef(false);
    useEffect(() => {
        isTransitionActiveRef.current = !!activeTransitionImage;
    }, [activeTransitionImage]);

    // Shared background preview Ref
    const previewRef = useRef<HTMLDivElement | null>(null);
    const lastActiveIndexRef = useRef(-1);

    const updateActiveBackground = (segmentIndex: number) => {
        if (segmentIndex !== lastActiveIndexRef.current) {
            lastActiveIndexRef.current = segmentIndex;

            const preview = previewRef.current;
            if (preview) {
                const widget = widgets[segmentIndex];
                let mediaElement: HTMLElement;

                if (widget.video) {
                    const video = document.createElement("video");
                    video.src = widget.video;
                    video.muted = true;
                    video.loop = true;
                    video.autoplay = true;
                    video.playsInline = true;
                    video.className =
                        "absolute top-0 left-0 w-full h-full object-cover opacity-0 saturate-20 will-change-[opacity]";
                    video.load();
                    video.play().catch(err => console.log("Background video autoplay failed:", err));
                    mediaElement = video;
                } else {
                    const img = document.createElement("img");
                    img.src = widget.image;
                    img.alt = widget.name;
                    img.className =
                        "absolute top-0 left-0 w-full h-full object-cover opacity-0 saturate-20 will-change-[opacity]";
                    mediaElement = img;
                }

                preview.appendChild(mediaElement);
                gsap.to(mediaElement, { opacity: 1, duration: 0.25, ease: "power2.out" });

                const children = preview.children;
                if (children.length > 3) {
                    for (let i = 0; i < children.length - 3; i++) {
                        const child = children[i];
                        if (child.tagName === "VIDEO") {
                            try {
                                (child as HTMLVideoElement).pause();
                            } catch (e) {}
                        }
                        child.remove();
                    }
                }
            }
        }
    };

    // 2D Refs
    const container2DRef = useRef<HTMLDivElement | null>(null);
    const title2DRef = useRef<HTMLDivElement | null>(null);
    const spinnerGroup2DRef = useRef<SVGGElement | null>(null);
    const indicator2DRef = useRef<SVGLineElement | null>(null);

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

    // 3D OGL & Interaction Setup
    useEffect(() => {
        if (!is3D) return;
        if (!canvasRef.current) return;

        let animId: number;
        const lastScrollTime = { current: 0 };
        let touchStartY = 0;

        const handleWheel3D = (e: WheelEvent) => {
            e.preventDefault();
            const now = Date.now();
            if (now - lastScrollTime.current < 700) return;

            if (Math.abs(e.deltaY) > 10) {
                lastScrollTime.current = now;
                if (e.deltaY > 0) {
                    targetRotationYRef.current -= (2 * Math.PI) / widgets.length;
                } else {
                    targetRotationYRef.current += (2 * Math.PI) / widgets.length;
                }
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;
            const now = Date.now();
            if (now - lastScrollTime.current < 700) return;

            if (Math.abs(diff) > 40) {
                lastScrollTime.current = now;
                if (diff > 0) {
                    targetRotationYRef.current -= (2 * Math.PI) / widgets.length;
                } else {
                    targetRotationYRef.current += (2 * Math.PI) / widgets.length;
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            targetMouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("wheel", handleWheel3D, { passive: false });
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchend", handleTouchEnd, { passive: true });

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

            const maxRadius = isMobile ? 1.8 : isTablet ? 2.2 : 2.5;
            const cylinderHeight = isMobile ? 0.8 : isTablet ? 1.0 : 1.2;
            const cameraZ = isMobile ? 5 : isTablet ? 6 : 6.5;
            const fov = isMobile ? 50 : 45;

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
        const heightCorrection = idealHeight / cylinderConfig.height;

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

                if (newDimensions.isMobile) {
                    cylinderRef.current.scale.set(
                        scaleX,
                        scaleY,
                        scaleZ
                    );
                } else {
                    cylinderRef.current.scale.set(
                        scaleX,
                        scaleY,
                        scaleZ
                    );
                }

                if (leftLineRef.current && rightLineRef.current) {
                    leftLineRef.current.scale.set(scaleX, scaleY, scaleZ);
                    rightLineRef.current.scale.set(scaleX, scaleY, scaleZ);

                    const lineRadius = (cylinderConfig.radius + 0.01) * scaleX;
                    const halfCardAngle = Math.PI / images.length;
                    const thetaLeft = Math.PI / 2 + halfCardAngle;
                    const thetaRight = Math.PI / 2 - halfCardAngle;

                    leftLineRef.current.position.set(lineRadius * Math.cos(thetaLeft), 0, lineRadius * Math.sin(thetaLeft));
                    rightLineRef.current.position.set(lineRadius * Math.cos(thetaRight), 0, lineRadius * Math.sin(thetaRight));
                }

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

                        drawImageCover(ctx, img, adjustedX, 0, adjustedWidth, canvasHeight);
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

                    // Create static yellow framing lines around the active centered card
                    const lineWidth = 0.008; // elegant thin line
                    const lineGeometry = createLinePlaneGeometry(gl, lineWidth, cylinderConfig.height);

                    const lineProgram = new Program(gl, {
                        vertex: cylinderVertex,
                        fragment: yellowLineFragment,
                        uniforms: {
                            uColor: { value: [255 / 255, 255 / 255, 43 / 255] }, // Yellow accent color #ffff2b
                            uOpacity: { value: 0.95 },
                        },
                        transparent: true,
                        depthTest: true,
                        cullFace: null,
                    });

                    const initialScaleX = dimensions3D.cylinderScale;
                    const initialScaleY = dimensions3D.cylinderScale * heightCorrection;
                    const initialScaleZ = dimensions3D.cylinderScale;

                    cylinder.scale.set(initialScaleX, initialScaleY, initialScaleZ);

                    const halfCardAngle = Math.PI / numImages;
                    const thetaLeft = Math.PI / 2 + halfCardAngle;
                    const thetaRight = Math.PI / 2 - halfCardAngle;
                    const lineRadius = (cylinderConfig.radius + 0.01) * initialScaleX;

                    const leftLine = new Mesh(gl, { geometry: lineGeometry, program: lineProgram });
                    leftLine.setParent(scene);
                    leftLine.position.set(lineRadius * Math.cos(thetaLeft), 0, lineRadius * Math.sin(thetaLeft));
                    leftLine.rotation.y = Math.PI / 2 - thetaLeft;
                    leftLine.scale.set(initialScaleX, initialScaleY, initialScaleZ);
                    leftLineRef.current = leftLine;

                    const rightLine = new Mesh(gl, { geometry: lineGeometry, program: lineProgram });
                    rightLine.setParent(scene);
                    rightLine.position.set(lineRadius * Math.cos(thetaRight), 0, lineRadius * Math.sin(thetaRight));
                    rightLine.rotation.y = Math.PI / 2 - thetaRight;
                    rightLine.scale.set(initialScaleX, initialScaleY, initialScaleZ);
                    rightLineRef.current = rightLine;

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
                            cylinderConfig.height
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

                            const activeIndex = getActiveIndexFromRotation(currentRotation, widgets.length);
                            updateActiveBackground(activeIndex);

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
            window.removeEventListener("wheel", handleWheel3D);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
            if (animId) cancelAnimationFrame(animId);
        };
    }, [is3D]);



    const handleToggleMode = () => {
        if (is3D) {
            window.scrollTo({ top: 0, behavior: "instant" });
        } else {
            setIsLoading3D(true);
        }
        setIs3D(!is3D);
    };

    const { centerX, centerY, outerRadius, innerRadius } = dimensions;
    const anglePerSegment = (Math.PI * 2) / widgets.length;

    return (
        <section className="cursor-none-all relative w-full min-h-[100svh] bg-black select-none overflow-x-hidden">
            {/* 3D Mode Toggle Button */}
            <button
                onClick={handleToggleMode}
                className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium transition-all duration-300 pointer-events-auto cursor-pointer"
            >
                <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${is3D ? "bg-[#ffff2b] shadow-[0_0_8px_#ffff2b] animate-pulse" : "bg-white/40"}`}></span>
                {is3D ? "3D VIEW" : "2D VIEW"}
            </button>

            {/* Loader Overlay for 3D Initializing */}
            {is3D && isLoading3D && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-300">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-[#ffff2b] rounded-full animate-spin"></div>
                        <span className="text-white/60 text-sm font-mono tracking-widest uppercase animate-pulse">Initializing 3D Carousel</span>
                    </div>
                </div>
            )}

            {/* Background preview images */}
            <div
                ref={previewRef}
                className="fixed inset-0 w-full h-full pointer-events-none z-0"
            />

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

            {/* 3D View Container */}
            <div
                className={`fixed inset-0 w-full h-svh z-0 transition-opacity duration-700 ease-in-out ${is3D ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
                <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
            </div>


            {/* 3D Scroll Indicator */}
            <div
                className={`fixed bottom-8 right-8 z-10 pointer-events-none transition-opacity duration-700 ${is3D ? "opacity-100" : "opacity-0"}`}
            >
                <div className="flex flex-col items-center gap-2 animate-bounce">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-white/60"
                    >
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                    <span className="text-sm text-white/40">Scroll</span>
                </div>
            </div>

            {activeTransitionImage && (
                <CircularTransition
                    imageSrc={activeTransitionImage}
                    onTransitionComplete={(completed) => setIsTransitionFinished(completed)}
                    onClose={() => {
                        setActiveTransitionImage(null);
                        setIsTransitionFinished(false);
                        lastActiveIndexRef.current = -1;
                        if (lastSegmentIndex.current >= 0) {
                            updateActiveBackground(lastSegmentIndex.current);
                        }
                    }}
                />
            )}

            <CustomCursor />
        </section>
    );
};

export default Hero;