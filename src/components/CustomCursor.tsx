"use client";

import gsap from "gsap";
import React, { useEffect } from "react";

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

export const CustomCursor = () => {
    useEffect(() => {
        // Track the cursor position
        let cursor = { x: 0, y: 0 };
        const onMouseMoveGlobal = (ev: MouseEvent) => {
            cursor.x = ev.clientX;
            cursor.y = ev.clientY;
        };
        window.addEventListener("mousemove", onMouseMoveGlobal);

        class CursorElement {
            DOM: {
                el: HTMLElement;
                inner: SVGCircleElement | null;
                feTurbulence: SVGFETurbulenceElement | null;
            };
            radiusOnEnter = 50;
            opacityOnEnter = 1;
            radius = 20;
            renderedStyles: any;
            bounds: DOMRect;
            filterId = "#cursor-filter";
            primitiveValues = { turbulence: 0 };
            filterTimeline: any;
            active = true;
            rafId: number | null = null;

            constructor(DOM_el: HTMLElement) {
                this.DOM = {
                    el: DOM_el,
                    inner: DOM_el.querySelector(".cursor__inner"),
                    feTurbulence: document.querySelector(`${this.filterId} > feTurbulence`),
                };

                this.bounds = this.DOM.el.getBoundingClientRect();
                this.radiusOnEnter = Number(this.DOM.el.dataset.radiusEnter) || this.radiusOnEnter;
                this.opacityOnEnter = Number(this.DOM.el.dataset.opacityEnter) || this.opacityOnEnter;

                const amt = Number(this.DOM.el.dataset.amt) || 0.15;
                this.renderedStyles = {
                    tx: { previous: 0, current: 0, amt: amt },
                    ty: { previous: 0, current: 0, amt: amt },
                    radius: { previous: 20, current: 20, amt: amt },
                    opacity: { previous: 1, current: 1, amt: amt }
                };

                if (this.DOM.inner) {
                    const rAttr = this.DOM.inner.getAttribute("r");
                    this.radius = rAttr ? Number(rAttr) : this.radius;
                }
                this.renderedStyles["radius"].previous = this.renderedStyles["radius"].current = this.radius;

                this.createFilterTimeline();
                this.DOM.el.style.opacity = "0";

                const onMouseMoveEv = () => {
                    this.renderedStyles.tx.previous = this.renderedStyles.tx.current = cursor.x - this.bounds.width / 2;
                    this.renderedStyles.ty.previous = this.renderedStyles.ty.current = cursor.y - this.bounds.height / 2;
                    this.DOM.el.style.opacity = "1";
                    this.rafId = requestAnimationFrame(() => this.render());
                    window.removeEventListener("mousemove", onMouseMoveEv);
                };
                window.addEventListener("mousemove", onMouseMoveEv);
            }

            enter() {
                this.renderedStyles["opacity"].current = this.opacityOnEnter;
                if (this.filterTimeline) this.filterTimeline.restart();
            }

            leave() {
                if (this.DOM.inner) this.DOM.inner.style.filter = "none";
                if (this.filterTimeline) this.filterTimeline.kill();
                this.renderedStyles["radius"].current = this.radius;
                this.renderedStyles["opacity"].current = 1;
            }

            createFilterTimeline() {
                const turbulenceValues = { from: 0.01, to: 0.04 };

                this.filterTimeline = gsap.timeline({
                    paused: true,
                    onStart: () => {
                        if (this.DOM.feTurbulence) {
                            this.DOM.feTurbulence.setAttribute("seed", String(Math.round(gsap.utils.random(1, 20))));
                        }
                        if (this.DOM.inner) {
                            this.DOM.inner.style.filter = `url(${this.filterId})`;
                        }
                        this.renderedStyles["opacity"].current = 1;
                    },
                    onUpdate: () => {
                        if (this.DOM.feTurbulence) {
                            this.DOM.feTurbulence.setAttribute("baseFrequency", String(this.primitiveValues.turbulence));
                        }
                        const turbulence = this.primitiveValues.turbulence;
                        const opacityVal = lerp(1, 0, (turbulence - turbulenceValues.from) / (turbulenceValues.to - turbulenceValues.from));
                        const radiusVal = lerp(this.radius, this.radiusOnEnter, (turbulence - turbulenceValues.from) / (turbulenceValues.to - turbulenceValues.from));

                        this.renderedStyles["opacity"].current = this.renderedStyles["opacity"].previous = opacityVal;
                        this.renderedStyles["radius"].current = this.renderedStyles["radius"].previous = radiusVal;
                    },
                    onComplete: () => {
                        if (this.DOM.inner) this.DOM.inner.style.filter = "none";
                        this.renderedStyles["radius"].current = this.renderedStyles["radius"].previous = this.radius;
                    }
                })
                    .to(this.primitiveValues, {
                        duration: 1.5,
                        ease: "power1",
                        startAt: { turbulence: turbulenceValues.from },
                        turbulence: turbulenceValues.to
                    });
            }

            render() {
                if (!this.active) return;
                this.renderedStyles["tx"].current = cursor.x - this.bounds.width / 2;
                this.renderedStyles["ty"].current = cursor.y - this.bounds.height / 2;

                const isPressHold = document.body.classList.contains("cursor-press-hold");

                if (this.DOM.el.classList.contains("cursor-inner-dot")) {
                    if (isPressHold) {
                        this.renderedStyles["radius"].current = 45; // expand to fit text
                        this.DOM.el.classList.add("is-orange");
                    } else {
                        this.renderedStyles["radius"].current = this.radius; // revert
                        this.DOM.el.classList.remove("is-orange");
                    }
                } else if (this.DOM.el.classList.contains("cursor-outer-ring")) {
                    if (isPressHold) {
                        this.renderedStyles["opacity"].current = 0; // hide outer ring
                    } else {
                        this.renderedStyles["opacity"].current = 1; // show outer ring
                    }
                }

                for (const key in this.renderedStyles) {
                    this.renderedStyles[key].previous = lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].amt);
                }

                this.DOM.el.style.transform = `translateX(${this.renderedStyles["tx"].previous}px) translateY(${this.renderedStyles["ty"].previous}px)`;
                if (this.DOM.inner) {
                    this.DOM.inner.setAttribute("r", String(this.renderedStyles["radius"].previous));
                }
                this.DOM.el.style.opacity = String(this.renderedStyles["opacity"].previous);

                this.rafId = requestAnimationFrame(() => this.render());
            }

            destroy() {
                this.active = false;
                if (this.rafId) cancelAnimationFrame(this.rafId);
                if (this.filterTimeline) this.filterTimeline.kill();
            }
        }

        class Cursor {
            cursorElements: CursorElement[] = [];
            links: Element[] = [];
            enterHandler: any;
            leaveHandler: any;

            constructor(Dom_elems: NodeListOf<HTMLElement>, triggerSelector = "a, button, [role='button'], .cursor-pointer") {
                Dom_elems.forEach(el => this.cursorElements.push(new CursorElement(el)));

                this.enterHandler = () => this.enter();
                this.leaveHandler = () => this.leave();

                // Wait a frame for links to render in the DOM
                setTimeout(() => {
                    this.links = [...document.querySelectorAll(triggerSelector)];
                    this.links.forEach(link => {
                        link.addEventListener("mouseenter", this.enterHandler);
                        link.addEventListener("mouseleave", this.leaveHandler);
                    });
                }, 100);
            }

            enter() {
                for (const el of this.cursorElements) {
                    el.enter();
                }
            }

            leave() {
                for (const el of this.cursorElements) {
                    el.leave();
                }
            }

            destroy() {
                this.links.forEach(link => {
                    link.removeEventListener("mouseenter", this.enterHandler);
                    link.removeEventListener("mouseleave", this.leaveHandler);
                });
                this.cursorElements.forEach(el => el.destroy());
            }
        }

        const cursorNodeList = document.querySelectorAll(".custom-cursor") as NodeListOf<HTMLElement>;
        let customCursorInstance: Cursor | null = null;

        if (cursorNodeList.length > 0) {
            customCursorInstance = new Cursor(cursorNodeList);
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMoveGlobal);
            if (customCursorInstance) {
                customCursorInstance.destroy();
            }
        };
    }, []);

    return (
        <>
            {/* Custom SVG Cursors */}
            <svg className="custom-cursor cursor-inner-dot" width="140" height="140" viewBox="0 0 140 140">
                <defs>
                    <filter id="cursor-filter" x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox">
                        <feTurbulence type="fractalNoise" seed="3" baseFrequency="0" numOctaves="1" result="warp" />
                        <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="15" in="SourceGraphic" />
                    </filter>
                </defs>
                <circle className="cursor__inner cursor__inner--filled" cx="70" cy="70" r="8" />
                <text className="cursor__text" x="70" y="68" textAnchor="middle" fontSize="9" fill="#000000" fontWeight="bold" opacity="0">PRESS</text>
                <text className="cursor__text" x="70" y="78" textAnchor="middle" fontSize="9" fill="#000000" fontWeight="bold" opacity="0">& HOLD</text>
            </svg>
            <svg className="custom-cursor cursor-outer-ring" width="140" height="140" viewBox="0 0 140 140" data-amt="0.13">
                <circle className="cursor__inner" cx="70" cy="70" r="24" />
            </svg>

            <style>{`
                @media (any-pointer: fine) {
                    .cursor-none-all {
                        cursor: none !important;
                    }
                    .cursor-none-all * {
                        cursor: none !important;
                    }
                    .custom-cursor {
                        position: fixed;
                        top: 0;
                        left: 0;
                        display: block;
                        pointer-events: none;
                        z-index: 10000;
                        mix-blend-mode: difference;
                    }
                    .cursor__inner {
                        fill: rgba(0, 0, 0, 0.15);
                        stroke: #ffffff;
                        stroke-width: 1.2px;
                    }
                    .cursor__inner--filled {
                        fill: #ffffff !important;
                        stroke: none !important;
                    }
                    .cursor-inner-dot.is-orange .cursor__inner--filled {
                        fill: #ff6b00 !important; /* Premium orange */
                    }
                    .cursor-inner-dot.is-orange .cursor__text {
                        opacity: 1 !important;
                        transition: opacity 0.2s ease;
                    }
                    .cursor-inner-dot:not(.is-orange) .cursor__text {
                        opacity: 0 !important;
                    }
                    .cursor-hidden-active .custom-cursor {
                        opacity: 0 !important;
                        pointer-events: none !important;
                    }
                }
            `}</style>
        </>
    );
};

export default CustomCursor;
