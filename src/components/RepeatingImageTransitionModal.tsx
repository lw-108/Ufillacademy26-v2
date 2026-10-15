"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

export interface ImageDetailData {
  src: string;
  alt?: string;
  title: string;
  subtitle?: string;
  category?: string;
  badge?: string;
  description?: string;
  meta?: { label: string; value: string; icon?: React.ReactNode }[];
}

interface RepeatingImageContextType {
  openImageModal: (
    originElement: HTMLElement,
    data: ImageDetailData
  ) => void;
  closeImageModal: () => void;
}

const RepeatingImageContext = createContext<RepeatingImageContextType | null>(
  null
);

export function useRepeatingImageModal() {
  const ctx = useContext(RepeatingImageContext);
  if (!ctx) {
    throw new Error(
      "useRepeatingImageModal must be used within a RepeatingImageProvider"
    );
  }
  return ctx;
}

// Linear interpolation helper for motion path
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Codrops Effect 04 parameters
const EFFECT_04_CONFIG = {
  steps: 4, // 4 cascading mover frames
  stepDuration: 0.25,
  stepInterval: 0.06,
  moverPauseBeforeExit: 0.2,
  moverEnterEase: "sine.in",
  moverExitEase: "expo",
  panelRevealEase: "expo",
  panelRevealDurationFactor: 4,
  moverBlendMode: "hard-light",
};

// Clip-paths for 'bottom-top' wipe (Effect 04 signature direction)
const CLIP_PATHS = {
  from: "inset(0% 0% 100% 0%)",
  reveal: "inset(0% 0% 0% 0%)",
  hide: "inset(100% 0% 0% 0%)",
};

export function RepeatingImageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeData, setActiveData] = useState<ImageDetailData | null>(null);
  const [mounted, setMounted] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const modalImgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isTransitioningRef = useRef(false);
  const originElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeImageModal = useCallback(() => {
    if (isTransitioningRef.current || !activeData) return;
    isTransitioningRef.current = true;

    const card = cardRef.current;
    const backdrop = backdropRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        unlockScroll();
        setActiveData(null);
        originElementRef.current = null;
        isTransitioningRef.current = false;
      },
    });

    if (card) {
      tl.to(card, {
        opacity: 0,
        y: 18,
        scale: 0.95,
        duration: 0.26,
        ease: "power2.inOut",
      });
    }

    if (backdrop) {
      tl.to(
        backdrop,
        {
          opacity: 0,
          duration: 0.22,
          ease: "power1.inOut",
        },
        0.05
      );
    }
  }, [activeData]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!activeData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeImageModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeData, closeImageModal]);

  const openImageModal = useCallback(
    (originElement: HTMLElement, data: ImageDetailData) => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      originElementRef.current = originElement;

      lockScroll();
      setActiveData(data);

      // Perform Effect 04 transition once the modal DOM nodes render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const targetImgEl = modalImgRef.current;
          const cardEl = cardRef.current;
          const backdropEl = backdropRef.current;
          const contentEl = contentRef.current;

          if (!targetImgEl || !cardEl || !backdropEl || !contentEl) {
            isTransitioningRef.current = false;
            return;
          }

          const startRect = originElement.getBoundingClientRect();
          const endRect = targetImgEl.getBoundingClientRect();

          // Fade backdrop in
          gsap.set(backdropEl, { opacity: 0 });
          gsap.to(backdropEl, { opacity: 1, duration: 0.35, ease: "power2.out" });

          // Prepare modal content
          gsap.set(cardEl, { opacity: 1, scale: 1, y: 0 });
          gsap.set(contentEl, { opacity: 0, y: 30 });
          gsap.set(targetImgEl, { clipPath: CLIP_PATHS.hide });

          // Generate motion path for the 4 cascading mover frames
          const steps = EFFECT_04_CONFIG.steps;
          const fullSteps = steps + 2;
          const path: { left: number; top: number; width: number; height: number }[] = [];

          const startCenter = {
            x: startRect.left + startRect.width / 2,
            y: startRect.top + startRect.height / 2,
          };
          const endCenter = {
            x: endRect.left + endRect.width / 2,
            y: endRect.top + endRect.height / 2,
          };

          for (let i = 0; i < fullSteps; i++) {
            const t = i / (fullSteps - 1);
            const width = lerp(startRect.width, endRect.width, t);
            const height = lerp(startRect.height, endRect.height, t);
            const centerX = lerp(startCenter.x, endCenter.x, t);
            const centerY = lerp(startCenter.y, endCenter.y, t);

            path.push({
              left: centerX - width / 2,
              top: centerY - height / 2,
              width,
              height,
            });
          }

          // Intermediate path steps (excluding start and end)
          const moverSteps = path.slice(1, -1);
          const moverElements: HTMLElement[] = [];
          const fragment = document.createDocumentFragment();

          moverSteps.forEach((step, index) => {
            const mover = document.createElement("div");
            mover.style.position = "fixed";
            mover.style.left = `${step.left}px`;
            mover.style.top = `${step.top}px`;
            mover.style.width = `${step.width}px`;
            mover.style.height = `${step.height}px`;
            mover.style.backgroundImage = `url("${data.src}")`;
            mover.style.backgroundSize = "contain";
            mover.style.backgroundRepeat = "no-repeat";
            mover.style.backgroundPosition = "center";
            mover.style.zIndex = String(9999 + index);
            mover.style.pointerEvents = "none";
            mover.style.willChange = "transform, clip-path";

            fragment.appendChild(mover);
            moverElements.push(mover);

            const delay = index * EFFECT_04_CONFIG.stepInterval;

            gsap
              .timeline({ delay })
              .fromTo(
                mover,
                { opacity: 0.5, clipPath: CLIP_PATHS.hide },
                {
                  opacity: 1,
                  clipPath: CLIP_PATHS.reveal,
                  duration: EFFECT_04_CONFIG.stepDuration,
                  ease: EFFECT_04_CONFIG.moverEnterEase,
                }
              )
              .to(
                mover,
                {
                  clipPath: CLIP_PATHS.from,
                  duration: EFFECT_04_CONFIG.stepDuration,
                  ease: EFFECT_04_CONFIG.moverExitEase,
                },
                `+=${EFFECT_04_CONFIG.moverPauseBeforeExit}`
              );
          });

          document.body.appendChild(fragment);

          // Reveal the final scaled-up panel image & content with Effect 04 timing
          const revealDelay = steps * EFFECT_04_CONFIG.stepInterval;

          gsap.timeline({
            delay: revealDelay,
            onComplete: () => {
              // Clean up movers from DOM
              moverElements.forEach((m) => m.remove());
              isTransitioningRef.current = false;
            },
          })
            .fromTo(
              targetImgEl,
              { clipPath: CLIP_PATHS.hide },
              {
                clipPath: CLIP_PATHS.reveal,
                duration:
                  EFFECT_04_CONFIG.stepDuration *
                  EFFECT_04_CONFIG.panelRevealDurationFactor,
                ease: EFFECT_04_CONFIG.panelRevealEase,
              }
            )
            .fromTo(
              contentEl,
              { opacity: 0, y: 26 },
              {
                opacity: 1,
                y: 0,
                duration: 0.75,
                ease: "expo.out",
              },
              "<-=0.4"
            );
        });
      });
    },
    []
  );

  return (
    <RepeatingImageContext.Provider value={{ openImageModal, closeImageModal }}>
      {children}

      {/* Fullscreen Portal Modal: Transparent + Backdrop-blur-md (No Dark Popups) */}
      {mounted &&
        activeData &&
        createPortal(
          <div
            ref={backdropRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-image-title"
            onClick={(e) => {
              if (e.target === backdropRef.current || (e.target as HTMLElement).getAttribute("data-backdrop") === "true") {
                closeImageModal();
              }
            }}
            data-backdrop="true"
            className="fixed inset-0 z-[9990] flex items-center justify-center px-4 pb-6 pt-20 sm:p-8 md:p-12 bg-white sm:bg-white/80 backdrop-blur-md select-none overflow-y-auto overscroll-contain"
          >
            {/* Background-less "X" Close Button */}
            <button
              type="button"
              onClick={closeImageModal}
              aria-label="Close"
              className="fixed top-5 right-5 sm:top-8 sm:right-8 z-50 flex items-center justify-center p-2 text-ink/80 hover:text-brand transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              <X className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={2.2} />
            </button>

            {/* Seamless Container: Scaled Image + Editorial Content */}
            <div
              ref={cardRef}
              onClick={(e) => e.stopPropagation()}
              className="relative my-auto flex flex-col items-center justify-center gap-6 w-full max-w-5xl text-ink select-auto"
            >
              {/* Image only: no card, border, radius or shadow around it */}
              <div className="relative flex shrink-0 items-center justify-center w-full h-[44svh] sm:h-[54svh] lg:h-[66svh] overflow-hidden">
                <div
                  ref={modalImgRef}
                  className="h-full w-full will-change-transform"
                  style={{
                    backgroundImage: `url("${activeData.src}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>

              {/* Clean Editorial Information */}
              <div
                ref={contentRef}
                className="w-full max-w-2xl px-1 flex flex-col space-y-3 text-center"
              >
                {/* Category / Badge Eyebrow */}
                {(activeData.badge || activeData.category) && (
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                    <span className="label-mono text-[11px] uppercase tracking-widest text-brand font-semibold">
                      {activeData.badge || activeData.category}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h2
                  id="modal-image-title"
                  className="font-anton uppercase text-2xl sm:text-3xl lg:text-4xl leading-[1.08] tracking-tight text-ink font-normal"
                >
                  {activeData.title}
                </h2>

                {/* Subtitle */}
                {activeData.subtitle && (
                  <p className="font-serif italic text-base sm:text-lg text-brand leading-snug">
                    {activeData.subtitle}
                  </p>
                )}

                {/* Narrative Description */}
                {activeData.description && (
                  <p className="text-sm leading-relaxed text-mute font-normal pt-1">
                    {activeData.description}
                  </p>
                )}

                {/* Meta details */}
                {activeData.meta && activeData.meta.length > 0 && (
                  <div className="sr-only">
                    {activeData.meta.map((item, idx) => (
                      <div key={idx} className="flex items-baseline justify-between gap-4 py-0.5">
                        <span className="font-mono text-[11px] text-ink/60 shrink-0">
                          {item.label}
                        </span>
                        <span className="font-medium text-ink text-right truncate">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Minimal Footer Hint */}
                <div className="sr-only">
                  <span>Press ESC to dismiss</span>
                  <span>U Fill Academy</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </RepeatingImageContext.Provider>
  );
}

export default RepeatingImageProvider;
