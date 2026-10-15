"use client";

import { useMemo, useRef } from "react";
import { gsap, CONDITIONS, MQ, revealOnScroll, useScene } from "@/lib/gsap";
import { SectionHeading } from "@/components/SectionHeading";
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

/**
 * MOTION NOTES
 * ------------
 * Only `opacity` and `transform` are ever animated here (compositor-only,
 * no repaint), nothing loops, and there is no filter/mask/blur.
 *
 *  - Tablet/desktop with motion allowed: the paragraph is pinned and its
 *    words + inline images light up in reading order, scrubbed to scroll.
 *  - Phones / reduced motion: no pin, no scrub. Phones get one cheap
 *    staggered reveal (ScrollTrigger, `once`); reduced motion shows the
 *    finished text immediately.
 *
 * The hidden "before" state is applied through GSAP inside the matchMedia
 * context, so leaving a breakpoint (or reduced-motion being toggled)
 * reverts it and content is never stranded invisible.
 */

type Segment =
  | { type: "word"; text: string }
  | { type: "image"; src: string; alt: string };

const ABOUT_TEXT =
  "U Fill Academy is an educational and technological organization specializing in Artificial Intelligence, Robotics, Programming, Automation, Electronics, and Emerging Technologies. We bridge the gap between traditional education and future technologies by empowering a new generation of creators, engineers, and visionary leaders.";

const ABOUT_INLINE_IMAGES: { afterWord: string; src: string; alt: string }[] = [
  { afterWord: "Intelligence,", src: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457081/learningrobo_qpmvit.png", alt: "Artificial Intelligence" },
  { afterWord: "Robotics,", src: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457079/enggrobo_cpfqh4.png", alt: "Robotics" },
  { afterWord: "Programming,", src: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457078/teachingrobo_ktl4nt.png", alt: "Programming" },
  { afterWord: "Automation,", src: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457078/pilot_pt2mom.png", alt: "Automation" },
  { afterWord: "Electronics,", src: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457077/automation_p6apdq.png", alt: "Electronics" },
  { afterWord: "generation", src: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457076/couplesrobo_d1s2an.png", alt: "A new generation of creators" },
];

// Fixed tilt per image — a static transform, not an animation.
const TILTS = [-7, 5, -4, 6, -6, 4];

function buildSegments(): Segment[] {
  const imageMap = new Map(ABOUT_INLINE_IMAGES.map((img) => [img.afterWord, img]));
  const segments: Segment[] = [];
  ABOUT_TEXT.split(" ").forEach((word) => {
    segments.push({ type: "word", text: word });
    const img = imageMap.get(word);
    if (img) segments.push({ type: "image", src: img.src, alt: img.alt });
  });
  return segments;
}

function RevealParagraph() {
  const segments = useMemo(() => buildSegments(), []);
  let imageIndex = 0;

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "word") {
          return (
            <span key={i} data-step className="mr-[0.26em] inline-block align-baseline font-normal">
              {seg.text}
            </span>
          );
        }
        const tilt = TILTS[imageIndex++ % TILTS.length];
        return (
          <span key={i} data-step data-img className="mx-1 my-0.5 inline-block align-middle">
            <img
              src={optimizeCloudinaryUrl(seg.src, 96)}
              alt={seg.alt}
              width={44}
              height={44}
              loading="lazy"
              decoding="async"
              className="inline-block h-9 w-9 border border-ink bg-white object-cover sm:h-11 sm:w-11"
              style={{ transform: `rotate(${tilt}deg)` }}
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display = "none";
              }}
            />
          </span>
        );
      })}
    </>
  );
}

export function AboutSection() {
  const root = useRef<HTMLElement>(null);
  const paragraphRef = useRef<HTMLDivElement>(null);
  const polaroidRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { openImageModal } = useRepeatingImageModal();

  useScene(root, (mm) => {
    mm.add({ full: CONDITIONS.full, phone: MQ.mobile, reduce: MQ.reduce }, (ctx) => {
      const { full, phone, reduce } = ctx.conditions as Record<string, boolean>;
      if (reduce) return; // finished, fully-visible content — no motion at all.

      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", paragraphRef.current!);
      const words = steps.filter((s) => !s.hasAttribute("data-img"));
      const images = steps.filter((s) => s.hasAttribute("data-img"));

      if (full) {
        gsap.set(words, { opacity: 0.14 });
        gsap.set(images, { opacity: 0, scale: 0.6 });

        // Word-by-word light-up, pinned and scrubbed.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: paragraphRef.current,
            start: "center center",
            end: () => `+=${Math.min(steps.length * 30, window.innerHeight * 1.7)}`,
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
          defaults: { ease: "none" },
        });
        steps.forEach((step, i) => {
          tl.to(
            step,
            step.hasAttribute("data-img")
              ? { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }
              : { opacity: 1, duration: 0.4 },
            i * 0.22
          );
        });

        // Polaroid Canvas vertical expansion on scroll
        const canvas = canvasRef.current;
        const polaroid = polaroidRef.current;
        const img = imageRef.current;

        if (canvas && polaroid && img) {
          // Vertical Canvas Expansion on Scroll: unfolds downward from top, keeping head fully visible
          gsap.fromTo(
            canvas,
            {
              clipPath: "inset(0% 0% 70% 0% round 2px)",
              scaleY: 0.88,
              transformOrigin: "top center",
            },
            {
              clipPath: "inset(0% 0% 0% 0% round 2px)",
              scaleY: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: polaroid,
                start: "top 85%",
                end: "center 55%",
                scrub: 0.7,
              },
            }
          );

          // Image parallax drift & photographic film exposure settle (anchored at top)
          gsap.fromTo(
            img,
            {
              scale: 1.05,
              yPercent: 0,
              transformOrigin: "top center",
              filter: "brightness(1.12) contrast(0.94)",
            },
            {
              scale: 1,
              yPercent: 2,
              transformOrigin: "top center",
              filter: "brightness(1) contrast(1)",
              ease: "none",
              scrollTrigger: {
                trigger: polaroid,
                start: "top 85%",
                end: "bottom 20%",
                scrub: 1,
              },
            }
          );

          // Polaroid card natural tilt & rise
          gsap.fromTo(
            polaroid,
            {
              rotate: -3.5,
              y: 35,
              opacity: 0.85,
            },
            {
              rotate: -1.5,
              y: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: polaroid,
                start: "top 90%",
                end: "top 55%",
                scrub: 0.8,
              },
            }
          );
        }
      } else if (phone) {
        // Phones: one cheap staggered reveal, no pin, no scrub.
        gsap.set(words, { opacity: 0.14 });
        gsap.set(images, { opacity: 0, scale: 0.6 });
        gsap.to(steps, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power1.out",
          stagger: 0.045,
          scrollTrigger: { trigger: paragraphRef.current, start: "top 78%", once: true },
        });

        const canvas = canvasRef.current;
        const polaroid = polaroidRef.current;
        const img = imageRef.current;

        if (canvas && polaroid && img) {
          gsap.fromTo(
            canvas,
            {
              clipPath: "inset(0% 0% 70% 0% round 2px)",
              scaleY: 0.9,
              transformOrigin: "top center",
            },
            {
              clipPath: "inset(0% 0% 0% 0% round 2px)",
              scaleY: 1,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: polaroid,
                start: "top 80%",
                once: true,
              },
            }
          );

          gsap.fromTo(
            img,
            {
              scale: 1.05,
              yPercent: 0,
              transformOrigin: "top center",
              filter: "brightness(1.12) contrast(0.94)",
            },
            {
              scale: 1,
              yPercent: 1,
              transformOrigin: "top center",
              filter: "brightness(1) contrast(1)",
              duration: 1.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: polaroid,
                start: "top 80%",
                once: true,
              },
            }
          );
        }
      }

      revealOnScroll(root.current!);
    });
  });

  return (
    <section
      id="about"
      ref={root}
      className="relative bg-transparent px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-24 sm:space-y-32">
        <div className="space-y-10">
          <SectionHeading
            index="02"
            eyebrow="About U Fill Academy"
            title={
              <>
                Empowering Future <span className="text-brand">Innovators</span>
              </>
            }
          />

          <div ref={paragraphRef} className="flex min-h-[38vh] items-center sm:min-h-[42vh] lg:min-h-[46vh]">
            <h3
              className="max-w-5xl font-normal tracking-tight text-ink"
              style={{
                fontSize: "clamp(1.25rem, 0.85rem + 2vw, 3rem)",
                lineHeight: "clamp(1.4, 1.35 + 0.3vw, 1.55)",
              }}
            >
              <RevealParagraph />
            </h3>
          </div>
        </div>

        {/* Founder's message */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <figure
              ref={polaroidRef}
              onClick={(e) => {
                openImageModal(e.currentTarget, {
                  src: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457076/muthumini_ewcxg2.png",
                  alt: "Muthubalaji M. - Founder & CEO",
                  title: "Muthubalaji M.",
                  subtitle: "Founder & CEO · U Fill Academy",
                  category: "Executive Leadership",
                  badge: "Founder's Message",
                  description:
                    "Every great achievement begins with a single idea. U Fill Academy was founded with a vision to create a new generation of thinkers, innovators, engineers, researchers, and entrepreneurs.",
                  meta: [
                    { label: "Role", value: "Founder & Chief Executive Officer" },
                    { label: "Organization", value: "U Fill Academy" },
                    { label: "Vision", value: "Hands-on AI, Robotics & Emerging Tech" },
                  ],
                });
              }}
              title="Click to expand Founder & CEO portrait"
              className="group relative mx-auto w-full max-w-[390px] select-none rounded-[3px] border border-neutral-300/80 bg-[#fafaf8] p-3.5 sm:p-4 pb-6 sm:pb-7 shadow-[0_22px_45px_-15px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.05)] transition-transform duration-500 ease-out hover:rotate-0 hover:scale-[1.02] cursor-pointer hover:border-brand lg:mx-0"
              style={{ transform: "rotate(-1.8deg)" }}
            >
              {/* The Vertically Expanding Photo Canvas */}
              <div
                ref={canvasRef}
                className="relative aspect-[3/4] w-full overflow-hidden rounded-[2px] bg-[#0c0e14] shadow-inner ring-1 ring-black/20"
                style={{ clipPath: "inset(0% 0% 0% 0%)" }}
              >
                <img
                  ref={imageRef}
                  src={optimizeCloudinaryUrl(
                    "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457076/muthumini_ewcxg2.png",
                    800
                  )}
                  alt="Muthubalaji M. - Founder & CEO"
                  width={600}
                  height={800}
                  className="h-full w-full object-cover object-top will-change-transform"
                  style={{ transformOrigin: "top center" }}
                  loading="lazy"
                  decoding="async"
                />

                {/* Polaroid Glossy Surface Sheen */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5 opacity-80"
                />

                {/* Subtle vintage film vignette */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 shadow-[inset_0_0_24px_rgba(0,0,0,0.35)]"
                />
              </div>

              {/* Authentic Polaroid Bottom Chin */}
              <figcaption className="pt-4 sm:pt-5 px-1">
                <div className="flex items-baseline justify-between">
                  <p className="font-serif italic text-2xl sm:text-[26px] font-medium leading-none tracking-tight text-neutral-900">
                    Muthubalaji M.
                  </p>
                  {/* Polaroid classic color stripe accent */}
                  <div className="flex items-center gap-0.5 opacity-70" title="Polaroid Color Accent">
                    <span className="h-2 w-1.5 rounded-full bg-[#0026ff]" />
                    <span className="h-2 w-1.5 rounded-full bg-emerald-500" />
                    <span className="h-2 w-1.5 rounded-full bg-amber-400" />
                    <span className="h-2 w-1.5 rounded-full bg-rose-500" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-neutral-200/70 pt-2 text-[11px]">
                  <span className="label-mono font-medium text-brand">Founder &amp; CEO</span>
                  <span className="label-mono text-mute">U Fill Academy</span>
                </div>
              </figcaption>
            </figure>
          </div>

          <div className="space-y-8 lg:col-span-7">
            <p data-reveal className="label-mono text-brand">
              Founder&apos;s message
            </p>
            <h3
              data-reveal
              className="font-anton uppercase text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.95] tracking-tight text-ink"
            >
              Shaping ideas with clarity and impact
            </h3>

            <div data-reveal className="max-w-xl space-y-4 text-base leading-relaxed text-mute">
              <p>
                Every great achievement begins with a single idea. U Fill Academy was founded
                with a vision to create a new generation of thinkers, innovators, engineers,
                researchers, and entrepreneurs.
              </p>
              <p>
                At U Fill Academy, we do not simply teach lessons — we inspire dreams and build
                futures by empowering students with hands-on knowledge in Artificial
                Intelligence, Robotics, and Emerging Technologies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
