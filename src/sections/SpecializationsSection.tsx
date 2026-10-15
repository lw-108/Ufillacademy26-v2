"use client";

import { useCallback, useRef, useState } from "react";
import { Bot, Cpu, Wifi, Smartphone, Globe, Plane, type LucideIcon } from "lucide-react";
import { MQ, revealOnScroll, ScrollTrigger, useScene } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/use-media-query";
import { SectionHeading } from "@/components/SectionHeading";
import Specializations3DCanvas, { type Specializations3DCanvasHandle } from "@/components/Specializations3DCanvas";

/**
 * Specializations — one story, told in six chapters.
 *
 * One sticky stage, one chapter at a time:
 *  - The 3D shape morphs from chapter to chapter as you scroll.
 *  - The chapter says what that shape means: the discipline, the promise,
 *    and exactly what you will cover.
 *  - A short rail under the shape shows where you are and lets you jump.
 *
 * The morph finishes before the end of the track, so every chapter
 * (including the final Drone) is fully formed and readable before the stage
 * is released. Reduced motion gets the same content without the pin.
 */

/** Share of the scroll track spent morphing. The rest is a hold on the final shape. */
const SETTLE_AT = 0.82;
/** Scroll distance per chapter, in viewport heights. */
const CHAPTER_VH = 70;

interface Department {
  id: string;
  title: string;
  short: string;
  icon: LucideIcon;
  badge: string;
  story: string;
  courses: string[];
}

const departments: Department[] = [
  {
    id: "ai",
    title: "Artificial Intelligence",
    short: "AI",
    icon: Cpu,
    badge: "Next-Gen AI",
    story: "From training your first model to deploying ethical, real-world AI.",
    courses: [
      "Fundamentals of Artificial Intelligence",
      "Machine Learning",
      "Computer Vision",
      "Prompt Engineering",
      "Natural Language Processing",
      "AI Applications",
    ],
  },
  {
    id: "robotics",
    title: "Robotics",
    short: "Robots",
    icon: Bot,
    badge: "Hardware & Mechatronics",
    story: "From your first soldered circuit to commanding autonomous machines.",
    courses: [
      "Basic Electronics",
      "Arduino Programming",
      "Sensor Integration",
      "Motor Control Systems",
      "Wireless Communication",
      "Humanoid & Industrial Robotics",
    ],
  },
  {
    id: "iot",
    title: "Internet of Things (IoT)",
    short: "IoT",
    icon: Wifi,
    badge: "Smart Automation",
    story: "From a blinking LED to orchestrating a smart factory floor.",
    courses: ["ESP8266 & ESP32", "MQTT Protocols", "Cloud Computing", "Home & Industrial Automation"],
  },
  {
    id: "app",
    title: "Application Development",
    short: "Apps",
    icon: Smartphone,
    badge: "Mobile Apps",
    story: "From no-code prototypes to apps ready for the store.",
    courses: ["MIT App Inventor", "Codes", "Database Management", "API Integration"],
  },
  {
    id: "web",
    title: "Website Development & Languages",
    short: "Web",
    icon: Globe,
    badge: "Software Engineering",
    story: "From your first tag to full-stack production architecture.",
    courses: ["HTML, CSS, JavaScript", "Responsive Web Development", "C, C++, Python, Java"],
  },
  {
    id: "drone",
    title: "Drone Tech & 3D Design",
    short: "Drone",
    icon: Plane,
    badge: "Aeronautics & Prototyping",
    story: "From CAD sketches on screen to prototypes in the air.",
    courses: ["Drone Assembly & Programming", "Flight Control Systems", "3D Modeling & Prototyping"],
  },
];

const LAST = departments.length - 1;

export function SpecializationsSection() {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Specializations3DCanvasHandle>(null);
  const reduce = useMediaQuery(MQ.reduce);

  /** Whole chapter index — drives the text and the rail. */
  const [active, setActive] = useState(0);

  useScene(root, (mm) => {
    mm.add(MQ.motion, () => revealOnScroll(root.current!));

    // One scroll system for the whole section. Progress maps to the chapter,
    // so the shape, the text and the rail can never disagree.
    mm.add(MQ.motion, () => {
      const track = trackRef.current;
      if (!track) return;
      const st = ScrollTrigger.create({
        trigger: track,
        start: "top top+=96",
        end: "bottom bottom",
        scrub: 0.12,
        onUpdate: (self) => {
          const f = Math.min(1, self.progress / SETTLE_AT) * LAST;
          // Imperative update to 3D canvas: zero React reconciliation overhead
          canvasRef.current?.setStage(f);
          const nextActive = Math.round(f);
          setActive((prev) => (prev !== nextActive ? nextActive : prev));
        },
      });
      return () => st.kill();
    });
  });

  /** Rail click: scroll to the chapter's exact point (or just switch, when reduced). */
  const jumpTo = useCallback(
    (i: number) => {
      setActive(i);
      canvasRef.current?.setStage(i);
      const track = trackRef.current;
      if (!track || reduce) return;
      const top = window.scrollY + track.getBoundingClientRect().top;
      const range = track.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + (i / LAST) * SETTLE_AT * range, behavior: "smooth" });
    },
    [reduce]
  );

  const dept = departments[active] ?? departments[0];
  const Icon = dept.icon;

  return (
    <section ref={root} id="specializations" className="relative bg-transparent">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <SectionHeading
          index="07"
          eyebrow="Cutting-Edge Technology"
          title={
            <>
              Pick a path. <span className="text-brand">Build it for real.</span>
            </>
          }
          lead="Six disciplines, one hands-on journey. Scroll to watch each one take shape, and see exactly what you will master."
        />
      </div>

      <div
        ref={trackRef}
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        style={reduce ? undefined : { height: `${departments.length * CHAPTER_VH}svh` }}
      >
        <div
          className={
            reduce
              ? "py-10"
              : "sticky top-24 flex items-center py-4"
          }
        >
          <div className="grid w-full grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-12">
            {/* ── Stage: the shape + chapter rail ── */}
            <figure className="lg:col-span-6">
              <div className="crop-marks relative h-[clamp(200px,34svh,340px)] w-full overflow-hidden border border-ink bg-white lg:h-[min(60svh,560px)]">
                <Specializations3DCanvas
                  ref={canvasRef}
                  currentStage={active}
                  onStageSelect={jumpTo}
                  showDots={false}
                  className="h-full w-full"
                />
              </div>

              <ol className="mt-3 grid grid-cols-6 gap-1.5" aria-label="Chapters">
                {departments.map((d, i) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      aria-current={i === active ? "step" : undefined}
                      className="group block w-full text-left"
                    >
                      <span
                        className={`block h-[3px] w-full transition-colors duration-300 ${
                          i <= active ? "bg-brand" : "bg-ink/15"
                        }`}
                      />
                      <span
                        className={`label-mono mt-2 block truncate text-[9px] transition-colors sm:text-[10px] ${
                          i === active ? "text-ink" : "text-ink/45 group-hover:text-ink/75"
                        }`}
                      >
                        {d.short}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </figure>

            {/* ── Story: the active chapter ── */}
            <div className="lg:col-span-6">
              <div key={active} className="animate-in fade-in slide-in-from-bottom-2 space-y-5 duration-500">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink text-brand">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="label-mono text-brand font-medium">
                    {dept.badge}
                  </span>
                </div>

                <h3 className="font-anton uppercase text-[clamp(2.25rem,4.6vw,4.25rem)] leading-[0.95] tracking-tight text-ink">
                  {dept.title}
                </h3>

                <p className="max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg">{dept.story}</p>

                <div>
                  <p className="label-mono mb-3 text-ink/55">What you will cover</p>
                  <ul className="grid grid-cols-1 gap-px border border-ink/15 bg-ink/15 sm:grid-cols-2">
                    {dept.courses.map((course) => (
                      <li
                        key={course}
                        className="flex items-center gap-2.5 bg-white px-3.5 py-3 text-sm font-medium text-ink"
                      >
                        <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-brand" />
                        {course}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SpecializationsSection;
