"use client";

import { useRef } from "react";
import { revealOnScroll, MQ, useScene, gsap } from "@/lib/gsap";

export interface BannerData {
  label: string;
  codes: string[];
}

export const bannerData: BannerData = {
  label: "Government Registered Institute",
  codes: ["Stn94238", "UDYAM-TN-20-015442", "TNSLMAILMTRSE-6-25-00060"],
};

interface FloatingCardItem {
  id: string;
  code: string;
  tag: string;
  authority: string;
  dept: string;
}

const floatingCards: FloatingCardItem[] = [
  {
    id: "card-1",
    code: "Stn94238",
    tag: "REG // 01 · STATE",
    authority: "Govt. of Tamil Nadu",
    dept: "State Technical Registration",
  },
  {
    id: "card-2",
    code: "UDYAM-TN-20-015442",
    tag: "REG // 02 · NATIONAL",
    authority: "Ministry of MSME, India",
    dept: "National Enterprise Registry",
  },
  {
    id: "card-3",
    code: "TNSLMAILMTRSE-6-25-00060",
    tag: "REG // 03 · STATUTORY",
    authority: "Labour & Employment Dept.",
    dept: "Statutory Establishment",
  },
];

/**
 * Atelier North split lead layout with 3 dancing cards moving like a slow wave.
 * Rebalanced space: compact left accreditation panel, expanded right cards area.
 */
export function Banner1() {
  const root = useRef<HTMLElement>(null);

  useScene(root, (mm) => {
    // Reveal animation
    mm.add(MQ.motion, () => {
      revealOnScroll(root.current!);

      // Wave dancing cards: slow, continuous undulating motion with progressive phase delays
      const cards = root.current?.querySelectorAll<HTMLElement>(".js-floating-inner");
      if (!cards || cards.length === 0) return;

      const tweens: gsap.core.Tween[] = [];

      cards.forEach((card, i) => {
        // Slow wave: 2.8s smooth cycle, progressive 0.45s phase delay per card
        const tween = gsap.fromTo(
          card,
          { y: -11, rotate: i % 2 === 0 ? -1 : 1 },
          {
            y: 11,
            rotate: i % 2 === 0 ? 1 : -1,
            duration: 2.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: i * 0.45,
          }
        );
        tweens.push(tween);
      });

      return () => {
        tweens.forEach((t) => t.kill());
      };
    });
  });

  return (
    <section
      ref={root}
      aria-label={bannerData.label}
      className="relative z-10 bg-transparent px-4 py-8 sm:py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Atelier North Split Lead Section: 3 cols left, 9 cols right */}
        <div className="p-top-about__lead border-y border-ink py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center overflow-visible">
          {/* Left Column: Compact Accreditation Panel (col-span-3) */}
          <div className="p-top-about__intro lg:col-span-3 lg:pr-6 xl:pr-8 relative">
            <div data-reveal="fade" className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-brand" aria-hidden />
              <p className="label-mono text-xs sm:text-sm text-brand font-bold uppercase tracking-wider">
                Accreditation
              </p>
            </div>

            <div data-reveal className="mt-2">
              <h2 className="font-anton text-2xl sm:text-3xl lg:text-[2rem] xl:text-4xl uppercase leading-[0.98] tracking-tight text-ink">
                {bannerData.label}
              </h2>
            </div>

            <p
              data-reveal
              className="text-xs sm:text-[13px] font-medium leading-relaxed text-mute mt-3"
            >
              Officially recognized technological and educational institution registered with the
              Government of Tamil Nadu and the Ministry of MSME India.
            </p>
          </div>

          {/* Right Column: Expanded Area for 3 Wave Dancing Cards (col-span-9) */}
          <ul className="p-top-about__floating lg:col-span-9 lg:pl-6 xl:pl-8 w-full overflow-visible">
            <div className="p-top-about__floating-wrapper js-floating-wrapper grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-4 xl:gap-5 overflow-visible">
              {floatingCards.map((card, i) => (
                <li
                  key={card.id}
                  data-reveal
                  className="p-top-about__floating-item js-floating group relative list-none overflow-visible"
                  style={{ zIndex: 3 - i }}
                >
                  <div className="p-top-about__floating-inner js-floating-inner relative flex flex-col justify-between p-4 sm:p-5 lg:p-5 xl:p-6 min-h-[175px] sm:min-h-[195px] border border-dashed border-ink/40 bg-white/40 backdrop-blur-xs transition-all duration-300 hover:border-brand hover:bg-white hover:shadow-lg hover:shadow-brand/5 cursor-pointer overflow-visible">
                    {/* Card Top: Clean Tag & Authority */}
                    <div>
                      <p className="label-mono text-[10px] sm:text-[11px] text-brand font-bold tracking-wider">
                        {card.tag}
                      </p>
                      <p className="label-mono text-[10px] text-mute uppercase tracking-widest mt-1">
                        {card.authority}
                      </p>
                    </div>

                    {/* Card Center: Registration Code (Bigger, Never Cut Off) */}
                    <div className="my-auto py-2.5">
                      <p className="font-mono text-sm sm:text-base lg:text-[15px] xl:text-base 2xl:text-lg font-bold tracking-tight text-ink uppercase break-words leading-tight group-hover:text-brand transition-colors duration-300">
                        {card.code}
                      </p>
                    </div>

                    {/* Card Bottom: Department */}
                    <div>
                      <p className="label-mono text-[9px] sm:text-[10px] text-mute/80">
                        {card.dept}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </div>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Banner1;
