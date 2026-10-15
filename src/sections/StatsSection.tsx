"use client";

import { useRef } from "react";
import { revealOnScroll, MQ, useScene } from "@/lib/gsap";

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export const stats: Stat[] = [
  { value: 1200, suffix: "+", label: "Learners trained" },
  { value: 40, suffix: "+", label: "Specialized courses" },
  { value: 15, suffix: "+", label: "Countries reached" },
];

export const formatStat = (n: number) => n.toLocaleString("en-US");

/**
 * First-view stats section aligned matching Atelier North's `.fv__lists`.
 * Top left: bracketed metadata tag / label
 * Bottom right: bold big display number stat
 */
export function StatsSection() {
  const root = useRef<HTMLElement>(null);

  useScene(root, (mm) => {
    mm.add(MQ.motion, () => revealOnScroll(root.current!));
  });

  return (
    <section
      ref={root}
      aria-label="Academy Statistics"
      className="relative z-10 bg-transparent px-4 pb-12 sm:pb-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <ul className="fv__lists">
          {stats.map((stat) => (
            <li
              key={stat.label}
              data-reveal
              className="fv__lists-item group"
            >
              <p className="text-sm label-mono text-mute transition-colors duration-300">
                {stat.label.toUpperCase()}
              </p>
              <p className="font-anton text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none text-ink transition-colors duration-300 tracking-tight mt-4 sm:mt-6">
                <span>{formatStat(stat.value)}</span>
                <span className="text-brand group-hover:text-white transition-colors duration-300">
                  {stat.suffix}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default StatsSection;
