"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, useScene } from "@/lib/gsap";

interface ScrollSplitCardItem {
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
}

interface ScrollSplitCardProps {
  className?: string;
  imageSrc: string;
  cards: ScrollSplitCardItem[];
}

/**
 * One photograph, sliced into three panes. Pinned and scrubbed by GSAP:
 *   0.00 – 0.35  the panes separate and the group settles back slightly
 *   0.35 – 0.75  all three flip 180° on Y to reveal their content faces
 *
 * Only transform + opacity are animated, so the whole sequence stays on the
 * compositor.
 */
export function ScrollSplitCard({ className, imageSrc, cards }: ScrollSplitCardProps) {
  const root = useRef<HTMLDivElement>(null);
  const items = cards.slice(0, 3);

  useScene(root, (mm) => {
    mm.add("(min-width: 768px)", () => {
      const el = root.current!;
      const group = el.querySelector<HTMLElement>("[data-group]")!;
      const panes = gsap.utils.toArray<HTMLElement>("[data-pane]", el);
      const shadows = gsap.utils.toArray<HTMLElement>("[data-shadow]", el);
      const [left, , right] = panes;

      // Initial state: the three panes read as ONE continuous photograph
      // (no shadow, no gaps); the content faces sit pre-rotated behind.
      gsap.set(shadows, { autoAlpha: 0 });
      gsap.set(
        panes.map((p) => p.querySelector("[data-back]")),
        { rotationY: 180 }
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top+=72",
          end: "+=160%",
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: "none" },
      });

      // Stage 1 — the panes separate and the group settles back slightly
      tl.to(left, { x: -48, duration: 0.35, ease: "power1.inOut" }, 0)
        .to(right, { x: 48, duration: 0.35, ease: "power1.inOut" }, 0)
        .to(group, { scale: 0.95, duration: 0.35, ease: "power1.inOut" }, 0)
        .to(shadows, { autoAlpha: 1, duration: 0.2 }, 0);

      // Stage 2 — all three flip to their content faces, the outer panes
      // drawing slightly closer and tilting as they turn
      tl.to(panes, { rotationY: 180, duration: 0.4, ease: "power2.inOut" }, 0.35)
        .to(left, { x: -24, rotation: 6, duration: 0.4, ease: "power2.inOut" }, 0.35)
        .to(right, { x: 24, rotation: -6, duration: 0.4, ease: "power2.inOut" }, 0.35)
        .to({}, { duration: 0.25 }); // hold on the finished cards
    });
  });

  return (
    <div ref={root} className={cn("relative w-full", className)}>
      <div className="flex h-[min(78vh,620px)] min-h-[460px] w-full items-center justify-center [perspective:1400px]">
        <div
          data-group
          className="relative flex h-[420px] w-full max-w-4xl px-4 [transform-style:preserve-3d]"
        >
          {items.map((card, i) => (
            <div
              key={i}
              data-pane
              className="relative h-full flex-1 [transform-style:preserve-3d]"
              style={{ zIndex: i }}
            >
              <div
                data-shadow
                aria-hidden
                className="absolute inset-0 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]"
              />

              {/* Front — one third of the photograph */}
              <div
                data-face
                data-front
                className="absolute inset-0 overflow-hidden [backface-visibility:hidden]"
              >
                <div
                  className="absolute inset-y-0 w-[300%]"
                  style={{
                    left: `${-100 * i}%`,
                    backgroundImage: `url(${imageSrc})`,
                    backgroundSize: "100% 100%",
                    backgroundPosition: "center",
                  }}
                />
              </div>

              {/* Back — the content card */}
              <div
                data-face
                data-back
                className="absolute inset-0 flex flex-col justify-end overflow-hidden bg-brand p-7 text-white [backface-visibility:hidden]"
              >
                <div className="mb-auto flex items-center justify-between">
                  <span className="text-white">{card.icon}</span>
                  {/* <span className="label-mono text-white/50">0{i + 1}</span> */}
                </div>
                <h3 className="mb-4 border-t border-white/25 pt-4 font-serif text-3xl leading-tight">
                  {card.title}
                </h3>
                <div className="text-sm leading-relaxed text-white/80">{card.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
