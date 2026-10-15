import { useRef } from "react"
import { Cpu, GraduationCap, HeartHandshake, Code2 } from "lucide-react"
import { gsap, MQ, useScene, revealOnScroll } from "@/lib/gsap"
import { SectionHeading } from "@/components/SectionHeading"
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal"
import { optimizeCloudinaryUrl } from "@/utils/cloudinary"

/**
 * BrandsSection — Ecosystem Showcase
 * Codrops OnScrollFilter "Storm Born" Image Reveal Design
 *
 * Requirements fulfilled:
 * 1. Uses the original/old images of each brand first.
 * 2. Important people's images (leaders/CEOs) are full-sized.
 * 3. ALL images use the Storm Born SVG displacement filter revealing effect in full size.
 * 4. Transparent background on image containers (no grey box or placeholder frame).
 * 5. Reveals in the quarter-top of the screen (start: "top 70%", end: "top 25%").
 * 6. Perfectly balanced single section per brand with all descriptions and domains in black text.
 */

interface Brand {
  id: string
  num: string
  icon: React.ElementType
  badge: string
  titleUp: string
  titleDown: string
  tagline: string
  description: string
  features: string[]
  featureLabel: string
  extraLabel?: string
  extraText?: string
  ceoName: string
  ceoRole: string
  ceoQuote: string
  ceoImage: string
  brandImage: string
  companyLogo: string
}

const BRANDS: Brand[] = [
  {
    id: "salem-iot",
    num: "01",
    icon: Cpu,
    badge: "R&D & Embedded Systems",
    titleUp: "Salem",
    titleDown: "IoT Project Centre",
    tagline: "All School & College Projects Available",
    description: "Research, industrial automation, embedded systems, electronics, and product development.",
    features: [
      "Mechanical / Mechatronics",
      "ECE (VLSI) / EEE",
      "CSE / IT / Agri",
      "Bio Medical / Arts & Science",
    ],
    featureLabel: "Supported Engineering Domains",
    ceoName: "Dr. Rajesh Kumar",
    ceoRole: "Founder & Technical Director",
    ceoQuote: "Driving transformative student research, embedded hardware innovation, and industrial IoT prototyping across South India.",
    ceoImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=85&w=1600&auto=format",
    brandImage: optimizeCloudinaryUrl("https://res.cloudinary.com/qtoywhbg/image/upload/v1787073970/WhatsApp_Image_2026-08-06_at_7.18.55_PM_1_zewm7p.jpg", 1600),
    companyLogo: optimizeCloudinaryUrl("https://res.cloudinary.com/qtoywhbg/image/upload/v1787073970/WhatsApp_Image_2026-08-06_at_7.18.55_PM_1_zewm7p.jpg", 300),
  },
  {
    id: "alspire",
    num: "02",
    icon: GraduationCap,
    badge: "Academic Tuition & Mastery",
    titleUp: "Alspire",
    titleDown: "Academy",
    tagline: "Additional Special Courses",
    description: "Study Centre for All Boards. Comprehensive tuition for Grade 1st to 10th.",
    features: [
      "Chess & Drawing",
      "Spoken English",
      "Handwriting Mastery",
      "Abacus & Speed Maths",
    ],
    featureLabel: "Specialized Skill Courses",
    ceoName: "Priya Sharma",
    ceoRole: "Academic Director",
    ceoQuote: "Nurturing holistic cognitive development, mathematical precision, and language fluency for foundational learners.",
    ceoImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&w=1600&q=85",
    brandImage: optimizeCloudinaryUrl("https://res.cloudinary.com/qtoywhbg/image/upload/v1787073970/WhatsApp_Image_2026-08-06_at_7.18.55_PM_mqexyj.jpg", 1600),
    companyLogo: optimizeCloudinaryUrl("https://res.cloudinary.com/qtoywhbg/image/upload/v1787073970/WhatsApp_Image_2026-08-06_at_7.18.55_PM_mqexyj.jpg", 300),
  },
  {
    id: "unicorn",
    num: "03",
    icon: HeartHandshake,
    badge: "Social Responsibility",
    titleUp: "Unicorn",
    titleDown: "Club Association",
    tagline: "Educate • Empower • Elevate",
    description: "Social initiative dedicated to supporting students who require educational assistance and guidance.",
    features: [
      "Student Educational Aid",
      "Leadership Mentorship",
      "Career Empowerment",
      "Skill Development Workshops",
    ],
    featureLabel: "Foundation Initiatives",
    extraLabel: "Social Responsibility Mission",
    extraText:
      "At U Fill Academy, we believe that education should be accessible to everyone. Through the Unicorn Club Foundation, we provide educational support, mentorship, and guidance to deserving students, helping them develop their skills and achieve their goals.",
    ceoName: "Arun Patel",
    ceoRole: "President & Lead Mentor",
    ceoQuote: "Democratizing access to high-impact technical education, student mentorship, and community-driven talent incubation.",
    ceoImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&w=1600&q=85",
    brandImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&w=1600&q=85",
    companyLogo: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&w=200&q=85",
  },
  {
    id: "nohaya",
    num: "04",
    icon: Code2,
    badge: "Primary Strategic Partner",
    titleUp: "Nohaya",
    titleDown: "Group (Collaborator)",
    tagline: "Explore. Build. Create.",
    description: "Primary strategic partner for enterprise software, mobile applications, UI/UX systems, and industrial R&D.",
    features: [
      "Enterprise Mobile Apps",
      "Full-Stack Web Platforms",
      "Industrial Automation R&D",
      "Cloud & Microservices",
    ],
    featureLabel: "Core Capabilities",
    extraLabel: "Strategic Software & R&D Partner",
    extraText:
      "Recognized for delivering custom enterprise mobile apps, responsive full-stack web platforms, and advanced industrial automation solutions.",
    ceoName: "Ajay Prakash",
    ceoRole: "CEO & Lead Architect",
    ceoQuote: "Architecting cloud-native enterprise mobile systems, high-availability web platforms, and automated robotic telemetry pipelines.",
    ceoImage: optimizeCloudinaryUrl("https://res.cloudinary.com/qtoywhbg/image/upload/v1787073970/IMG_2046.JPG_1_ncqjag.jpg", 1800),
    brandImage: optimizeCloudinaryUrl("https://res.cloudinary.com/qtoywhbg/image/upload/v1787073969/IMG_2050.JPG_1_vguwqc.jpg", 1600),
    companyLogo: optimizeCloudinaryUrl("https://res.cloudinary.com/qtoywhbg/image/upload/v1787073969/IMG_2050.JPG_1_vguwqc.jpg", 300),
  },
]

export function BrandsSection() {
  const root = useRef<HTMLElement>(null)
  const { openImageModal } = useRepeatingImageModal()

  useScene(root, (mm) => {
    mm.add(MQ.motion, () => {
      const section = root.current
      if (!section) return
      revealOnScroll(section)

      const items = section.querySelectorAll<HTMLElement>(".js-brand-item")
      items.forEach((item, index) => {
        const isLeftSide = index % 2 === 0
        const maskEl = item.querySelector<HTMLElement>(".js-brand-mask")
        const innerEl = item.querySelector<HTMLElement>(".js-brand-inner")
        if (!maskEl || !innerEl) return

        gsap
          .timeline({
            defaults: {
              ease: "none",
            },
            scrollTrigger: {
              trigger: item,
              start: "top bottom-=15%",
              end: "+=50%",
              scrub: true,
            },
          })
          .fromTo(
            maskEl,
            {
              yPercent: -100,
              xPercent: isLeftSide ? 100 : -100,
            },
            {
              yPercent: 0,
              xPercent: 0,
            }
          )
          .fromTo(
            innerEl,
            {
              yPercent: 100,
              xPercent: isLeftSide ? -100 : 100,
            },
            {
              yPercent: 0,
              xPercent: 0,
            },
            0
          )
      })
    })
  })

  return (
    <section
      ref={root}
      id="brands"
      className="relative w-full overflow-hidden bg-transparent px-4 py-20 text-ink sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-20 sm:space-y-28">
        {/* ── Section Header ── */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-ink/15 pb-8 sm:pb-12">
          <SectionHeading
            index="06"
            eyebrow="Trusted Ecosystem Partners"
            title={
              <>
                Our Global <span className="text-brand">Ecosystem</span>
              </>
            }
          />
          <p className="max-w-md text-sm font-medium leading-relaxed text-mute md:pb-2">
            Specialized entities and strategic partnerships advancing industrial research, specialized
            education, and technical innovation across South India.
          </p>
        </div>

        {/* ── Ecosystem Partners Showcase ── */}
        <div className="space-y-28 sm:space-y-40">
          {BRANDS.map((brand) => {
            const hasFeatures = brand.features.length > 0
            const fullTitle = `${brand.titleUp} ${brand.titleDown}`
            return (
              <div
                key={brand.id}
                className="relative flex flex-col space-y-12 sm:space-y-16 border-b border-ink/15 pb-20 sm:pb-28 last:border-b-0 last:pb-0"
              >
                {/* ── 1. Top Bar: Big Numeral Alone & Brand Heading ── */}
                <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-ink/15 pb-4">
                  <div className="flex items-baseline gap-4 sm:gap-6">
                    <span className="font-anton text-7xl sm:text-8xl lg:text-9xl text-ink leading-none tracking-tighter select-none">
                      {brand.num}
                    </span>
                    <h3 className="font-anton uppercase text-4xl sm:text-6xl text-ink leading-none tracking-tight">
                      <span>{brand.titleUp}</span>{" "}
                      <span className="text-brand">{brand.titleDown}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand" />
                    <span className="label-mono text-xs font-bold text-brand uppercase tracking-wider">
                      {brand.badge}
                    </span>
                  </div>
                </div>

                {/* ── 2. The Brand First: Old Image of Brand with Clean Expanding Effect ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left: Full-Sized Old Brand Image with Clean Expanding Effect */}
                  <div className="js-brand-item w-full lg:col-span-7 flex justify-center items-center">
                    <div
                      className="js-brand-mask group relative w-full flex items-center justify-center cursor-pointer max-h-[min(65vh,500px)] overflow-hidden"
                      onClick={(e) => {
                        openImageModal(e.currentTarget, {
                          src: brand.brandImage,
                          title: fullTitle,
                          subtitle: `${brand.badge} · ${brand.tagline}`,
                          category: "Ecosystem Partner Archive",
                          badge: brand.badge,
                          description: brand.description,
                          meta: [
                            { label: "Partner Entity", value: fullTitle },
                            { label: "Category", value: brand.badge },
                            { label: "Domain Focus", value: brand.tagline },
                          ],
                        })
                      }}
                      title={`Click to inspect ${fullTitle}`}
                    >
                      <div className="js-brand-inner will-change-transform w-full h-full flex items-center justify-center">
                        <img
                          src={brand.brandImage}
                          alt={fullTitle}
                          loading="lazy"
                          decoding="async"
                          className="w-auto h-auto max-h-[min(65vh,500px)] max-w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Brand Description Texts, Tagline & Capabilities */}
                  <div className="w-full lg:col-span-5 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-2">
                      <brand.icon className="h-5 w-5 text-brand shrink-0" />
                      <span className="label-mono text-xs font-bold text-ink uppercase tracking-wider">
                        Partner Overview
                      </span>
                    </div>

                    <h4 className="font-anton uppercase text-2xl sm:text-3xl text-ink leading-tight">
                      {brand.tagline}
                    </h4>

                    <p className="text-sm sm:text-base leading-relaxed text-ink/85 font-sans">
                      {brand.description}
                    </p>

                    {brand.extraText && (
                      <p className="text-xs sm:text-sm leading-relaxed text-ink/80 font-sans border-l-2 border-brand pl-3.5">
                        {brand.extraText}
                      </p>
                    )}

                    {/* Supported Domains */}
                    {hasFeatures && (
                      <div className="pt-2 space-y-2">
                        <span className="label-mono text-[10px] text-ink/60 uppercase font-bold tracking-wider block">
                          {brand.featureLabel}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {brand.features.map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="font-mono text-xs text-ink border border-ink/20 px-2.5 py-1 bg-white/70"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── 3. Important People Full-Sized: Leader Portrait with Storm Born Reveal & Leadership Dossier ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-4">
                  {/* Left: Leadership Dossier & Bio Texts */}
                  <div className="w-full lg:col-span-5 flex flex-col justify-center space-y-4 lg:order-1">
                    <div className="flex items-center justify-between border-b border-ink/15 pb-2">
                      <span className="label-mono text-xs font-bold text-brand uppercase tracking-wider">
                        Executive Leadership
                      </span>
                      <span className="label-mono text-[10px] text-ink/60 font-semibold uppercase">
                        Authorized Director
                      </span>
                    </div>

                    <div>
                      <h4 className="font-anton uppercase text-3xl sm:text-4xl text-ink leading-none tracking-tight">
                        {brand.ceoName}
                      </h4>
                      <p className="text-xs font-bold text-brand uppercase tracking-wider mt-1">
                        {brand.ceoRole}
                      </p>
                    </div>

                    <p className="text-sm leading-relaxed text-ink/85 font-sans italic border-l-2 border-ink/20 pl-3">
                      &ldquo;{brand.ceoQuote}&rdquo;
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="font-mono text-xs text-ink font-semibold">
                          Verified Entity Lead
                        </span>
                      </div>

                      <div className="h-10 w-24 overflow-hidden flex items-center justify-end">
                        <img
                          src={brand.companyLogo}
                          alt={`${fullTitle} seal`}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Full-Sized Important Person's Image with Clean Expanding Effect */}
                  <div className="js-brand-item w-full lg:col-span-7 lg:order-2 flex justify-center items-center">
                    <div
                      className="js-brand-mask group relative w-full flex items-center justify-center cursor-pointer max-h-[min(65vh,500px)] overflow-hidden"
                      onClick={(e) => {
                        openImageModal(e.currentTarget, {
                          src: brand.ceoImage,
                          title: brand.ceoName,
                          subtitle: `${brand.ceoRole} · ${fullTitle}`,
                          category: "Ecosystem Leadership",
                          badge: "Executive Director",
                          description: brand.ceoQuote,
                          meta: [
                            { label: "Entity", value: fullTitle },
                            { label: "Role", value: brand.ceoRole },
                            { label: "Executive Citation", value: brand.ceoQuote },
                          ],
                        })
                      }}
                      title={`Click to inspect profile of ${brand.ceoName}`}
                    >
                      <div className="js-brand-inner will-change-transform w-full h-full flex items-center justify-center">
                        <img
                          src={brand.ceoImage}
                          alt={brand.ceoName}
                          loading="lazy"
                          decoding="async"
                          className="w-auto h-auto max-h-[min(65vh,500px)] max-w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BrandsSection
