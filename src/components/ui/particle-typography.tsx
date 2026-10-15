"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export interface CursorDrivenParticleTypographyProps {
    className?: string;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    particleSize?: number;
    particleDensity?: number;
    dispersionStrength?: number;
    returnSpeed?: number;
    color?: string;
    isLogoMode?: boolean;
}

class Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    dispersion: number;
    returnSpd: number;

    constructor(
        x: number,
        y: number,
        size: number,
        color: string,
        dispersion: number,
        returnSpd: number
    ) {
        this.x = x + (Math.random() - 0.5) * 8;
        this.y = y + (Math.random() - 0.5) * 8;
        this.originX = x;
        this.originY = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.size = size;
        this.color = color;
        this.dispersion = dispersion;
        this.returnSpd = returnSpd;
    }

    update(mouseX: number, mouseY: number) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const interactionRadius = 100;

        if (distance < interactionRadius && mouseX !== -1000 && mouseY !== -1000) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (interactionRadius - distance) / interactionRadius;

            const repulsionX = forceDirectionX * force * this.dispersion;
            const repulsionY = forceDirectionY * force * this.dispersion;

            this.vx -= repulsionX;
            this.vy -= repulsionY;
        }

        this.vx += (this.originX - this.x) * this.returnSpd;
        this.vy += (this.originY - this.y) * this.returnSpd;

        this.vx *= 0.85;
        this.vy *= 0.85;

        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function CursorDrivenParticleTypography({
    className,
    text = "U-FILL ACADEMY",
    fontSize = 72,
    fontFamily = "Inter, sans-serif",
    particleSize = 1.4,
    particleDensity = 3,
    dispersionStrength = 18,
    returnSpeed = 0.08,
    color,
    isLogoMode = true,
}: CursorDrivenParticleTypographyProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let isPaused = false;

        let mouseX = -1000;
        let mouseY = -1000;

        let containerWidth = 0;
        let containerHeight = 0;

        const init = () => {
            const container = containerRef.current;
            if (!container) return;

            containerWidth = container.clientWidth;
            containerHeight = container.clientHeight;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = containerWidth * dpr;
            canvas.height = containerHeight * dpr;
            canvas.style.width = `${containerWidth}px`;
            canvas.style.height = `${containerHeight}px`;

            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, containerWidth, containerHeight);

            const isDark = document.documentElement.classList.contains("dark");
            const textColorMain = isDark ? "#ffffff" : "#000000";

            if (isLogoMode) {
                // Exact official logo layout drawing on canvas.
                // uFontSize drives the size of the "U" mark itself — raised
                // cap (170) and multiplier (0.42) so it reads as a bigger,
                // more dominant lockup. subFontSize is now a smaller ratio
                // of uFontSize (0.26 instead of 0.32) so "FILL / ACADEMY"
                // doesn't scale up in step with it — the U grows relative
                // to the wordmark, not just alongside it.
                const uFontSize = Math.min(170, Math.max(72, containerWidth * 0.42));
                const subFontSize = Math.round(uFontSize * 0.26);

                const startX = 10;
                const startY = containerHeight / 2 + uFontSize * 0.32;

                // Draw Blue U in NSEC font
                ctx.fillStyle = "#0026ff";
                ctx.font = `bold ${uFontSize}px 'NSEC', sans-serif`;
                ctx.textAlign = "left";
                ctx.textBaseline = "alphabetic";
                ctx.fillText("U", startX, startY);

                const uWidth = ctx.measureText("U").width;
                const rightX = startX + uWidth + 2;

                // Draw stacked FILL and ACADEMY in League font
                ctx.fillStyle = textColorMain;
                ctx.font = `300 ${subFontSize}px 'League Spartan', sans-serif`;

                // Top: FILL
                ctx.fillText("FILL", rightX, startY - uFontSize * 0.42);
                // Bottom: ACADEMY
                ctx.fillText("ACADEMY", rightX, startY - uFontSize * 0.05);
            } else {
                ctx.fillStyle = color || textColorMain;
                const effectiveFontSize = Math.min(fontSize, containerWidth * 0.15);
                ctx.font = `bold ${effectiveFontSize}px ${fontFamily}`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(text, containerWidth / 2, containerHeight / 2);
            }

            // Extract pixel map to build particles with exact original pixel colors
            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
            particles = [];

            const step = Math.max(1, Math.floor(particleDensity * dpr));
            for (let y = 0; y < textCoordinates.height; y += step) {
                for (let x = 0; x < textCoordinates.width; x += step) {
                    const index = (y * textCoordinates.width + x) * 4;
                    const alpha = textCoordinates.data[index + 3] || 0;

                    if (alpha > 100) {
                        const r = textCoordinates.data[index];
                        const g = textCoordinates.data[index + 1];
                        const b = textCoordinates.data[index + 2];
                        const particleColor = `rgba(${r},${g},${b},${alpha / 255})`;

                        particles.push(
                            new Particle(
                                x / dpr,
                                y / dpr,
                                particleSize,
                                particleColor,
                                dispersionStrength,
                                returnSpeed
                            )
                        );
                    }
                }
            }
        };

        let isIdle = false;
        let cachedRect: DOMRect | null = null;

        const updateRect = () => {
            if (canvas) cachedRect = canvas.getBoundingClientRect();
        };

        const wakeUp = () => {
            if (isPaused) return;
            isIdle = false;
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        const animate = () => {
            if (isPaused) {
                animationFrameId = 0;
                return;
            }
            
            ctx.clearRect(0, 0, containerWidth, containerHeight);

            let hasActiveParticles = false;
            const isMouseActive = mouseX !== -1000 && mouseY !== -1000;

            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                particle.update(mouseX, mouseY);
                particle.draw(ctx);

                if (!hasActiveParticles) {
                    if (
                        Math.abs(particle.vx) > 0.08 ||
                        Math.abs(particle.vy) > 0.08 ||
                        Math.abs(particle.x - particle.originX) > 0.2 ||
                        Math.abs(particle.y - particle.originY) > 0.2
                    ) {
                        hasActiveParticles = true;
                    }
                }
            }

            // Anti-lag: when all particles have settled and mouse is not interacting,
            // sleep the RAF loop to save 100% of CPU/GPU resources
            if (!hasActiveParticles && !isMouseActive) {
                isIdle = true;
                animationFrameId = 0;
                return;
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!cachedRect) updateRect();
            const r = cachedRect || canvas.getBoundingClientRect();
            mouseX = e.clientX - r.left;
            mouseY = e.clientY - r.top;
            if (isIdle || !animationFrameId) wakeUp();
        };

        const handleMouseEnter = () => {
            updateRect();
            wakeUp();
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
            if (isIdle || !animationFrameId) wakeUp();
        };

        const handleResize = () => {
            updateRect();
            init();
            wakeUp();
        };

        const timeoutId = setTimeout(() => {
            init();
            updateRect();
            if (!isPaused) wakeUp();
        }, 120);

        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Check for reduced motion preference
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            // Skip continuous animation for users who prefer reduced motion
            return;
        }

        // Intersection Observer to pause animation when not visible
        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    isPaused = !entry.isIntersecting;
                    if (!isPaused) {
                        updateRect();
                        wakeUp();
                    } else if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = 0;
                    }
                });
            },
            { threshold: 0.05, rootMargin: "100px 0px" }
        );

        if (containerRef.current) {
            intersectionObserver.observe(containerRef.current);
        }

        const themeObserver = new MutationObserver(() => {
            init();
            wakeUp();
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"]
        });

        canvas.addEventListener("mouseenter", handleMouseEnter);
        canvas.addEventListener("mousemove", handleMouseMove, { passive: true });
        canvas.addEventListener("mouseleave", handleMouseLeave, { passive: true });
        canvas.addEventListener("touchstart", (e) => {
            if (!e.touches[0]) return;
            updateRect();
            const r = cachedRect || canvas.getBoundingClientRect();
            mouseX = e.touches[0].clientX - r.left;
            mouseY = e.touches[0].clientY - r.top;
            wakeUp();
        }, { passive: true });
        canvas.addEventListener("touchmove", (e) => {
            if (!e.touches[0]) return;
            const r = cachedRect || canvas.getBoundingClientRect();
            mouseX = e.touches[0].clientX - r.left;
            mouseY = e.touches[0].clientY - r.top;
            if (isIdle || !animationFrameId) wakeUp();
        }, { passive: true });
        canvas.addEventListener("touchend", handleMouseLeave, { passive: true });

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            themeObserver.disconnect();
            canvas.removeEventListener("mouseenter", handleMouseEnter);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [text, fontSize, fontFamily, particleSize, particleDensity, dispersionStrength, returnSpeed, color, isLogoMode]);

    return (
        <div
            ref={containerRef}
            className={cn("w-full h-full min-h-[140px] flex items-center justify-center relative touch-none", className)}
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
            />
        </div>
    );
}