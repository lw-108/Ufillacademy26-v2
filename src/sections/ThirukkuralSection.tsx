"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowRight } from "lucide-react";
import { gsap, MQ, prefersReducedMotion, ScrollTrigger, useScene } from "@/lib/gsap";
import { SectionHeading } from "@/components/SectionHeading";
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

/**
 * STRICT KURAL STRUCTURE
 * Every kural below is stored as two arrays of words:
 *   line1: exactly 4 words   (traditional "4 சீர்" first line)
 *   line2: exactly 3 words   (traditional "3 சீர்" second line)
 * This mirrors the real metrical structure of a Thirukkural couplet,
 * so nothing is truncated or hidden — each word gets its own span.
 *
 * Entries marked verified: true were checked against primary sources
 * (Wikisource / thirukkural.ai / thirukkural.net) during authoring.
 * Add new kurals the same way: split the printed couplet into its
 * natural 4-word / 3-word lines — do not reflow across the line break.
 */
type Kural = {
  number: number;
  line1: [string, string, string, string];
  line2: [string, string, string];
  meaning: string;
  chapter: string;
  subChapter: string;
  verified: boolean;
};

const THIRUKKURALS: Kural[] = [
  {
    number: 1,
    line1: ["அகர", "முதல", "எழுத்தெல்லாம்", "ஆதி"],
    line2: ["பகவன்", "முதற்றே", "உலகு"],
    meaning:
      "அகர ஒலியே எல்லா எழுத்துகளுக்கும் முதல்; அதுபோல், ஆதிபகவன் உலகிலுள்ள உயிர்கள் எல்லாவற்றிற்கும் முதல்வனாக இருக்கின்றான்.",
    chapter: "Virtue",
    subChapter: "Praise of God",
    verified: true,
  },
  {
    number: 2,
    line1: ["கற்றதனால்", "ஆய", "பயனென்கொல்", "வாலறிவன்"],
    line2: ["நற்றாள்", "தொழாஅர்", "எனின்"],
    meaning:
      "மெய்யறிவு உடையவனான இறைவனுடைய சிறந்த திருவடிகளை பணியாதவர்களுக்கு, அவர்கள் கற்ற கல்வியினால் விளையும் பயன் தான் என்ன?",
    chapter: "Virtue",
    subChapter: "Praise of God",
    verified: true,
  },
  {
    number: 131,
    line1: ["ஒழுக்கம்", "விழுப்பம்", "தரலான்", "ஒழுக்கம்"],
    line2: ["உயிரினும்", "ஓம்பப்", "படும்"],
    meaning:
      "ஒழுக்கம் எல்லோர்க்கும் மேன்மையைத் தருவதால், அந்த ஒழுக்கம் உயிரை விடவும் மேலானதாகப் போற்றப்பட வேண்டும்.",
    chapter: "Virtue",
    subChapter: "Good Conduct",
    verified: true,
  },
  {
    number: 132,
    line1: ["தூங்குக", "தூங்குக", "செய்தும்", "செய்யற்க"],
    line2: ["தூங்கார்", "செயற்பாற்", "றவை"],
    meaning:
      "தள்ளிவைத்துச் செய்யத் தகுந்தவற்றை நிதானமாகச் செய்யலாம்; ஆனால் உடனே செய்யவேண்டியவற்றைத் தாமதிக்காமல் விரைந்து செய்ய வேண்டும்.",
    chapter: "Virtue",
    subChapter: "Good Conduct",
    verified: false,
  },
  {
    number: 391,
    line1: ["கற்க", "கசடறக்", "கற்பவை", "கற்றபின்"],
    line2: ["நிற்க", "அதற்குத்", "தக"],
    meaning:
      "கற்க வேண்டிய நூல்களைக் குற்றமறக் கற்க வேண்டும்; அவ்வாறு கற்ற பிறகு, கற்ற கல்விக்கு ஏற்ப நல்வழியில் நிற்க வேண்டும்.",
    chapter: "Wealth",
    subChapter: "Learning",
    verified: true,
  },
  {
    number: 421,
    line1: ["கல்லாதவரை", "அறியலாம்", "கற்றார்முன்", "நில்லாத்"],
    line2: ["தொழுத", "தொழுத", "நிலை"],
    meaning:
      "கற்றறிந்தவர் முன் அமர்ந்திருக்கும் தன்மையையும் நடையையும் பார்த்தால், கல்லாதவரை எளிதில் அறியலாம்.",
    chapter: "Wealth",
    subChapter: "Wisdom",
    verified: false,
  },
];

// Single Thiruvalluvar image — optimized with Cloudinary auto format/quality
const THIRUVALLUVAR_IMAGE = optimizeCloudinaryUrl(
  "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457079/thiru_gwczdv.png",
  600
);

/** Seconds each couplet stays on screen before auto-advancing. */
const AUTO_ADVANCE_S = 8;

const pickDifferent = (current: number) => {
  if (THIRUKKURALS.length < 2) return current;
  let next = current;
  while (next === current) next = Math.floor(Math.random() * THIRUKKURALS.length);
  return next;
};

/** Palm-leaf-style silhouette used only if the image fails to load. */
function ThiruvalluvarFallback({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 220" className={className} aria-label="Thiruvalluvar">
      <path
        d="M60 18c-16 0-27 13-27 30 0 11 4.5 20 11 26-18 7-30 23-30 46v92h92v-92c0-23-12-39-30-46 6.5-6 11-15 11-26 0-17-11-30-27-30Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M60 18c-16 0-27 13-27 30 0 7 1.7 12.5 4.5 17 7-11 13.5-27 13.5-27s6.5 16 13.5 27c2.8-4.5 4.5-10 4.5-17 0-17-11-30-27-30Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

/** Shrinks a nowrap line's font-size just enough to fit its container. */
function useAutoFitLine(deps: unknown[]) {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !el.parentElement) return;

    const fit = () => {
      el.style.fontSize = "";
      const available = el.parentElement!.clientWidth;
      const natural = el.scrollWidth;
      if (available > 0 && natural > available) {
        const base = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = `${base * (available / natural) * 0.98}px`;
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

function KuralLine({ words, className }: { words: readonly string[]; className?: string }) {
  const ref = useAutoFitLine([words.join("|")]);
  return (
    <p ref={ref} className={`flex flex-nowrap items-baseline gap-x-3 whitespace-nowrap ${className ?? ""}`}>
      {words.map((word, i) => (
        <span key={i} data-word className="inline-block">
          {word}
        </span>
      ))}
    </p>
  );
}

export function ThirukkuralSection() {
  const { openImageModal } = useRepeatingImageModal();
  const [index, setIndex] = useState(() => Math.floor(Math.random() * THIRUKKURALS.length));
  const [imageError, setImageError] = useState(false);

  const root = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const indexRef = useRef(index);
  const swapping = useRef(false);
  const timer = useRef<gsap.core.Tween | null>(null);

  const kural = THIRUKKURALS[index];

  /** Cross-fades to another couplet; the auto-advance timer restarts after. */
  const advance = useCallback(() => {
    if (swapping.current) return;
    swapping.current = true;
    timer.current?.pause(0);

    const next = pickDifferent(indexRef.current);
    const box = boxRef.current;
    const commit = () => {
      indexRef.current = next;
      flushSync(() => {
        setImageError(false);
        setIndex(next);
      });
    };

    if (!box || prefersReducedMotion()) {
      commit();
      swapping.current = false;
      return;
    }

    gsap
      .timeline({
        onComplete: () => {
          swapping.current = false;
          // Only resume the countdown if the section is still on screen;
          // otherwise ScrollTrigger's onToggle starts it on re-entry.
          if (root.current && ScrollTrigger.isInViewport(root.current, 0.25)) {
            timer.current?.restart();
          }
        },
      })
      .to(box, { autoAlpha: 0, y: -14, duration: 0.28, ease: "power2.in" })
      .call(commit)
      .set(box, { y: 14 })
      .to(box, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" })
      .from(
        box.querySelectorAll("[data-word]"),
        { autoAlpha: 0, yPercent: 60, duration: 0.5, stagger: 0.05, ease: "power3.out" },
        "<0.1"
      );
  }, []);

  useScene(root, (mm) => {
    // `advance` is a stable callback (empty deps), so capturing it here is safe.
    // Auto-advance: a linear progress-bar tween is the timer. It only runs
    // while the section is on screen and pauses while it's hovered.
    mm.add(MQ.motion, () => {
      const bar = barRef.current;
      const el = root.current;
      if (!bar || !el) return;

      const tween = gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: AUTO_ADVANCE_S,
          ease: "none",
          paused: true,
          onComplete: () => advance(),
        }
      );
      timer.current = tween;

      ScrollTrigger.create({
        trigger: el,
        start: "top 75%",
        end: "bottom 25%",
        onToggle: (self) => {
          if (swapping.current) return;
          if (self.isActive) tween.play();
          else tween.pause();
        },
      });

      const pause = () => tween.pause();
      const resume = () => {
        if (!swapping.current && ScrollTrigger.isInViewport(el, 0.25)) tween.play();
      };
      el.addEventListener("pointerenter", pause);
      el.addEventListener("pointerleave", resume);

      return () => {
        el.removeEventListener("pointerenter", pause);
        el.removeEventListener("pointerleave", resume);
        timer.current = null;
      };
    });

    // Entrance
    mm.add(MQ.motion, () => {
      const el = root.current!;
      const frame = el.querySelector("[data-frame]");
      const portrait = el.querySelector("[data-portrait]");
      const parts = gsap.utils.toArray<HTMLElement>("[data-part]", el);
      gsap.set([frame, portrait, ...parts], { autoAlpha: 0 });
      gsap.set(portrait, { yPercent: 8 });
      gsap.set(parts, { y: 22 });

      gsap
        .timeline({
          scrollTrigger: { trigger: frame, start: "top 80%", once: true },
          defaults: { ease: "power3.out" },
        })
        .to(frame, { autoAlpha: 1, duration: 0.6 })
        .to(portrait, { autoAlpha: 1, yPercent: 0, duration: 1 }, 0.1)
        .to(parts, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 }, 0.2);
    });
  });

  return (
    <section ref={root} className="relative bg-transparent px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-14">
        <SectionHeading
          index="01"
          eyebrow="Timeless Tamil Wisdom"
          title={
            <>
              Timeless <span className="text-brand">Wisdom</span> &amp; Values
            </>
          }
          lead="Thirukkural couplets guiding the core values, ethics, and principles of U Fill Academy."
        />

        <div data-frame className="crop-marks grid grid-cols-1 border border-ink md:grid-cols-12">
          {/* Portrait */}
          <div
            onClick={(e) => {
              if (imageError) return;
              openImageModal(e.currentTarget, {
                src: THIRUVALLUVAR_IMAGE,
                alt: "Thiruvalluvar",
                title: "Thiruvalluvar",
                subtitle: `Kural ${String(kural.number).padStart(3, "0")} · ${kural.chapter}`,
                category: "Cultural Heritage & Philosophy",
                badge: "Tamil Classical Wisdom",
                description: `"${kural.line1.join(" ")} ${kural.line2.join(" ")}" — ${kural.meaning}`,
                meta: [
                  { label: "Chapter", value: kural.chapter },
                  { label: "Section", value: kural.subChapter },
                  { label: "Couplet", value: `Kural ${kural.number}` },
                ],
              });
            }}
            title="Click to inspect Thiruvalluvar portrait"
            className="group flex items-end justify-center border-b border-ink px-6 pt-8 transition-all duration-300 ease-in-out md:col-span-4 md:border-b-0 md:border-r hover:bg-brand cursor-pointer"
          >
            {!imageError ? (
              <img
                data-portrait
                src={THIRUVALLUVAR_IMAGE}
                alt="Thiruvalluvar"
                width={300}
                height={400}
                loading="lazy"
                decoding="async"
                className="h-56 w-auto object-contain object-bottom md:h-80 transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <ThiruvalluvarFallback className="h-56 w-auto text-brand md:h-80" />
            )}
          </div>

          {/* Couplet */}
          <div className="flex flex-col p-6 sm:p-10 md:col-span-8">
            <div data-part className="label-mono flex flex-wrap items-center gap-x-3 gap-y-2 text-ink">
              <span className="text-brand">
                Kural {String(kural.number).padStart(3, "0")}
              </span>
              <span className="text-ink/30">/</span>
              <span>{kural.chapter}</span>
              <span className="text-ink/30">/</span>
              <span className="text-mute">{kural.subChapter}</span>
            </div>

            <div ref={boxRef} className="mt-8 flex flex-col gap-6">
              <div className="w-full space-y-2">
                <KuralLine
                  words={kural.line1}
                  className="text-xl font-bold leading-normal tracking-wide text-ink sm:text-2xl lg:text-[1.9rem]"
                />
                <KuralLine
                  words={kural.line2}
                  className="text-xl font-bold leading-normal tracking-wide text-brand sm:text-2xl lg:text-[1.9rem]"
                />
              </div>

              <p className="max-w-xl border-l-2 border-ink pl-4 text-sm font-medium leading-relaxed text-mute sm:text-[15px]">
                {kural.meaning}
              </p>
            </div>

            <div data-part className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                type="button"
                onClick={() => advance()}
                className="label-mono group inline-flex h-11 items-center gap-2 border border-ink px-6 text-ink transition-colors duration-300 hover:bg-ink hover:text-white"
              >
                Next couplet
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <span
                aria-hidden
                className="relative hidden h-px min-w-24 flex-1 bg-ink/15 sm:block"
              >
                <span
                  ref={barRef}
                  className="absolute inset-y-0 left-0 block h-[2px] w-full origin-left -translate-y-[0.5px] scale-x-0 bg-brand"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ThirukkuralSection;
