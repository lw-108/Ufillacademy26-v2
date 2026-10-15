import { useRef } from "react"
import {
  Sparkles,
  Compass,
  Target,
  CheckCircle2,
  ArrowUpRight,
  Users,
  GraduationCap,
  FlaskConical,
} from "lucide-react"
// import { Logo } from "@/components/loogo"
import { ScrollSplitCard } from "@/components/ui/scroll-split-card"
import { SectionHeading } from "@/components/SectionHeading"
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal"
import { CONDITIONS, MQ, revealOnScroll, useScene } from "@/lib/gsap"
import { useMediaQuery } from "@/lib/use-media-query"
import { optimizeCloudinaryUrl } from "@/utils/cloudinary"

interface MediaCardProps {
  src: string
  alt: string
  title: string
  subtitle: string
}

function MediaCard({ src, alt, title, subtitle }: MediaCardProps) {
  const { openImageModal } = useRepeatingImageModal()
  const fullSrc = optimizeCloudinaryUrl(src, 700)

  return (
    <article
      data-reveal
      onClick={(e) => {
        openImageModal(e.currentTarget, {
          src: fullSrc,
          alt,
          title,
          subtitle,
          category: "Vision & Innovation",
          badge: "U Fill Academy",
          description: `${title} — ${subtitle}. An integral pillar in U Fill Academy's mission to bridge education and future tech.`,
          meta: [
            { label: "Pillar", value: title },
            { label: "Domain", value: subtitle },
            { label: "Institution", value: "U Fill Academy" },
          ],
        })
      }}
      title={`Click to inspect ${title}`}
      className="group relative flex flex-col border border-ink bg-white transition-all duration-300 hover:bg-neutral-50 cursor-pointer hover:border-brand shadow-xs"
    >
      <div className="relative aspect-square overflow-hidden border-b border-ink bg-neutral-100 group-hover:border-brand transition-colors">
        <img
          src={fullSrc}
          alt={alt}
          width={700}
          height={700}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
      </div>
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <h4 className="text-lg font-semibold leading-tight tracking-tight text-ink group-hover:text-brand transition-colors duration-300">
            {title}
          </h4>
          <p className="mt-1.5 text-sm text-mute group-hover:text-brand transition-colors">
            {subtitle}
          </p>
        </div>
        <ArrowUpRight
          className="mt-0.5 h-5 w-5 shrink-0 text-ink transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
          aria-hidden
        />
      </div>
    </article>
  )
}

const missionItems = [
  "Deliver high-quality practical education.",
  "Promote creativity and innovation.",
  "Develop technical knowledge & hands-on skills.",
  "Prepare students for future career opportunities.",
]

const goalItems = [
  "Bridge traditional education with future tech.",
  "Empower 100,000+ students with robotics & AI skills.",
  "Establish advanced R&D prototyping labs across Tamil Nadu.",
]

const statItems = [
  { icon: Users, value: "100,000+", label: "Students Empowered" },
  { icon: GraduationCap, value: "Statewide", label: "Learning Programs" },
  { icon: FlaskConical, value: "R&D Labs", label: "Prototyping Access" },
]

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

const pillars = [
  {
    key: "vision",
    title: "Our Vision",
    icon: <Sparkles className="h-7 w-7" />,
    description: (
      <p>
        To become one of India&apos;s most trusted educational institutions in technology,
        innovation, research, and skill development.
      </p>
    ),
  },
  {
    key: "mission",
    title: "Our Mission",
    icon: <Compass className="h-7 w-7" />,
    description: <Checklist items={missionItems} />,
  },
  {
    key: "goals",
    title: "Our Goals",
    icon: <Target className="h-7 w-7" />,
    description: <Checklist items={goalItems} />,
  },
]

export function VisionMissionSection() {
  const root = useRef<HTMLElement>(null)
  // The scroll-flip needs a pin, so it's tablet+ with motion allowed. Everyone
  // else (phones, reduced motion) gets the same content as plain cards.
  const canScrollFlip = useMediaQuery(CONDITIONS.full)

  useScene(root, (mm) => {
    mm.add(MQ.motion, () => revealOnScroll(root.current!))
  }, [canScrollFlip])

  return (
    <section id="vision-mission" ref={root} className="relative bg-transparent px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-20 sm:space-y-28">
        <SectionHeading
          index="04"
          eyebrow="Our Future Insights"
          title={
            <>
              Our <span className="text-brand">Mission</span> &amp; Vision
            </>
          }
          lead="See the vision, mission, and goals driving U Fill Academy's mission to bring AI, robotics, and future-ready skills to every learner across Tamil Nadu."
        />

        {/* 1. Cards Split & Turn Over Effect */}
        {canScrollFlip ? (
          <ScrollSplitCard
            imageSrc="https://res.cloudinary.com/qtoywhbg/image/upload/v1786457077/bluemountain_osoead.png"
            cards={pillars}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article
                key={pillar.key}
                data-reveal
                className="flex min-h-[300px] flex-col bg-brand p-7 text-white"
              >
                <div className="mb-auto flex items-center justify-between text-white">
                  {pillar.icon}
                </div>
                <h3 className="mb-4 mt-8 border-t border-white/25 pt-4 font-anton uppercase text-3xl leading-tight">
                  {pillar.title}
                </h3>
                <div className="text-sm leading-relaxed text-white/80">{pillar.description}</div>
              </article>
            ))}
          </div>
        )}

        {/* 2. Normal U Fill Academy Cards in Brand Blue */}
        <div data-reveal className="relative overflow-hidden border border-ink bg-brand backdrop-blur-md text-white">
          <div className="flex min-h-[240px] flex-col justify-between p-8 sm:min-h-[420px] sm:p-12">
            <div className="space-y-2">
              <h3 className="font-anton text-[clamp(3.5rem,11vw,9rem)] uppercase leading-[0.88] tracking-tight">
                U-Fill
                <br />
                Academy
              </h3>
            </div>
          </div>
          <dl className="grid grid-cols-1 border-t border-white/25 sm:grid-cols-3">
            {statItems.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className={`flex items-center gap-4 px-6 py-5 sm:px-8 ${i > 0 ? "border-t border-white/25 sm:border-l sm:border-t-0" : ""}`}
              >
                <Icon className="h-5 w-5 shrink-0 text-white/70" aria-hidden />
                <div className="min-w-0">
                  <dd className="font-anton text-xl leading-none tracking-tight">{value}</dd>
                  <dt className="label-mono mt-2 text-[10px] text-white/60">{label}</dt>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* 3. What is U Fill Academy? */}
        <div className="grid grid-cols-1 gap-8 border-t border-ink pt-10 lg:grid-cols-12 lg:gap-12">
          <div data-reveal className="space-y-4 lg:col-span-5">
            <p className="label-mono text-brand">AI-Powered Platform</p>
            <h3 className="font-anton uppercase text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-tight text-ink">
              What is <span className="text-brand">U Fill</span>?
            </h3>
          </div>
          <div
            data-reveal
            className="space-y-5 text-base font-medium leading-relaxed text-mute sm:text-lg lg:col-span-7"
          >
            <p>
              U Fill Academy is an{" "}
              <strong className="font-semibold text-ink">AI-powered educational platform</strong>{" "}
              purpose-built to enhance the entire skill development lifecycle — from Analysis
              through Design, Development, Robotics, and Quality.
            </p>
            <p>
              By integrating hands-on hardware lab technology, automated learning pathways, and
              real-world project analytics, U Fill Academy delivers unparalleled career
              visibility and mastery.
            </p>
          </div>
        </div>

        {/* 4. Media cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <MediaCard
            src="https://res.cloudinary.com/qtoywhbg/image/upload/v1786457081/learningrobo_qpmvit.png"
            alt="Students learning with robot"
            title="Interactive Learning"
            subtitle="AI-powered education for all"
          />
          <MediaCard
            src="https://res.cloudinary.com/qtoywhbg/image/upload/v1786457078/teachingrobo_ktl4nt.png"
            alt="Teaching session with robot"
            title="Expert Guidance"
            subtitle="Personalized mentoring approach"
          />
          <MediaCard
            src="https://res.cloudinary.com/qtoywhbg/image/upload/v1786457076/couplesrobo_d1s2an.png"
            alt="Community learning with robots"
            title="Community Building"
            subtitle="Education that uplifts families"
          />
        </div>
      </div>
    </section>
  )
}

export default VisionMissionSection
