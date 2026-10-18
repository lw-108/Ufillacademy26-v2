"use client";
import { useRef, useState } from "react";
import ContactRobotCanvas from "@/model/ContactRobot";
import {
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  Clock,
  Zap,
  Users,
  BookOpen,
  Sparkles,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { gsap, MQ, revealOnScroll, useScene } from "@/lib/gsap";
import { useFitText } from "@/lib/use-fit-text";
import { SectionHeading } from "@/components/SectionHeading";

interface ContactItem {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

const CONTACT_INFO: ContactItem[] = [
  { icon: MapPin, label: "Visit Us", value: "Perundurai Road, Erode, TN 638052" },
  { icon: Mail, label: "Email Us", value: "info@ufillacademy.com", href: "mailto:info@ufillacademy.com" },
  { icon: Phone, label: "Call Us", value: "+91 98765 43210", href: "tel:+919876543210" },
  { icon: Clock, label: "Working Hours", value: "Mon – Sat, 9:00 AM – 6:00 PM" },
];

const FEATURES = [
  { icon: Zap, title: "Fast Track Enrollment", copy: "Apply today, start classes within the week" },
  { icon: BookOpen, title: "Hands-On Curriculum", copy: "Real robots, real code, real projects" },
  { icon: Users, title: "Industry Mentors", copy: "Taught by working engineers, not just teachers" },
  { icon: Sparkles, title: "Not Sure Yet?", copy: "Free trial class — no obligation at all" },
];

const FOOTER_COLUMNS = [
  {
    title: "Our Programs",
    links: [
      ["AI & Machine Learning", "#specializations"],
      ["Robotics & Electronics", "#specializations"],
      ["IoT & Automation", "#specializations"],
      ["Drone Tech & 3D Design", "#specializations"],
    ],
  },
  {
    title: "Academy",
    links: [
      ["About Us", "#about"],
      ["Vision & Mission", "#vision-mission"],
      ["Leadership", "#leadership"],
      ["Future Horizons", "#roadmap"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Admissions Help", "#contact"],
      ["Contact Us", "#contact"],
      ["Privacy Policy", "#"],
      ["Terms of Service", "#"],
    ],
  },
];

// Sharp, transparent inputs with a brand-blue underline that thickens on focus.
const inputClass =
  "w-full rounded-none border border-ink/20 border-b-2 border-b-brand/60 bg-transparent px-3.5 py-2.5 text-xs sm:text-[13px] text-ink placeholder:text-ink/40 transition-colors focus:border-brand focus:border-b-brand focus:outline-none focus:ring-0";

/* ─── Original social brand logos (inline SVG, inherit currentColor) ─── */
type IconProps = { className?: string };

const LinkedInIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const XIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const InstagramIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
    <circle cx="12" cy="12" r="4.3" />
    <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const YouTubeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const SOCIALS: { label: string; href: string; Icon: (p: IconProps) => JSX.Element }[] = [
  { label: "LinkedIn", href: "#", Icon: LinkedInIcon },
  { label: "Twitter (X)", href: "#", Icon: XIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "YouTube", href: "#", Icon: YouTubeIcon },
];

/** Four brand-blue corner brackets that frame a panel. */
function Corners() {
  const base = "pointer-events-none absolute h-3 w-3 border-brand";
  return (
    <>
      <span aria-hidden className={`${base} -left-px -top-px border-l-2 border-t-2`} />
      <span aria-hidden className={`${base} -right-px -top-px border-r-2 border-t-2`} />
      <span aria-hidden className={`${base} -bottom-px -left-px border-b-2 border-l-2`} />
      <span aria-hidden className={`${base} -bottom-px -right-px border-b-2 border-r-2`} />
    </>
  );
}

type Status = "idle" | "sent";

export function ContactFooterSection() {
  const root = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const wordmarkRef = useFitText<HTMLParagraphElement>();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const update = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStatus("idle");
    setFormData((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sent");
    setFormData({ firstName: "", lastName: "", email: "", message: "" });
  };

  useScene(root, (mm) => {
    mm.add(MQ.motion, () => revealOnScroll(root.current!));
  });

  useScene(footerRef, (mm) => {
    mm.add(MQ.motion, () => {
      const el = footerRef.current!;
      const word = el.querySelector<HTMLElement>("[data-wordmark]");
      if (word) {
        // The wordmark rises out of a clipped slot when the footer arrives.
        gsap.set(word, { yPercent: 100 });
        gsap.to(word, {
          yPercent: 0,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: { trigger: word, start: "top bottom-=4%", once: true },
        });
      }
      revealOnScroll(el);
    });
  });

  return (
    <>
      {/* ─── CONTACT SECTION ─── */}
      <section
        ref={root}
        id="contact"
        className="relative z-10 w-full bg-transparent px-4 py-14 text-ink sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl space-y-10 sm:space-y-12">
          <SectionHeading
            index="15"
            eyebrow="Get In Touch"
            title={
              <>
                Let&apos;s Build the <span className="text-brand">Future</span> Together
              </>
            }
            lead="Have questions about our programs? Ready to enroll? Reach out to us and we'll get back to you faster than a servo motor responds."
            wide
            className="[&_[data-title]]:mt-4 [&_[data-title]]:text-[clamp(2.2rem,5vw,3.75rem)] [&_[data-lead]]:mt-3 [&_[data-lead]]:text-sm sm:[&_[data-lead]]:text-base"
          />

          {/* Contact info — one joined bar, cells share borders, fill brand-blue on hover */}
          <dl
            data-reveal
            className="grid grid-cols-1 border border-ink/15 sm:grid-cols-2 lg:grid-cols-4"
          >
            {CONTACT_INFO.map((item, i) => {
              const Icon = item.icon;
              const body = (
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-brand/40 text-brand transition-colors duration-300 group-hover:border-white group-hover:bg-white/15 group-hover:text-white">
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <dt className="label-mono text-[9px] uppercase tracking-wider text-brand transition-colors duration-300 group-hover:text-white/80">
                      {item.label}
                    </dt>
                    <dd className="mt-1 line-clamp-2 text-[12px] font-medium leading-snug text-ink transition-colors duration-300 group-hover:text-white sm:text-[13px]">
                      {item.value}
                    </dd>
                  </div>
                </div>
              );
              const cell = `group relative block bg-transparent p-4 transition-colors duration-300 hover:bg-brand ${
                i > 0 ? "border-t border-ink/15 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(even)]:border-l lg:border-t-0 lg:[&:nth-child(n+2)]:border-l" : ""
              } ${item.href ? "cursor-pointer" : "cursor-default"}`;
              return item.href ? (
                <a key={item.label} href={item.href} className={cell}>
                  {body}
                </a>
              ) : (
                <div key={item.label} className={cell}>
                  {body}
                </div>
              );
            })}
          </dl>

          {/* Campus map + inquiry form */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: campus location */}
            <div
              data-reveal
              className="relative flex flex-col justify-between gap-5 border border-ink/15 bg-transparent p-5 sm:p-6 lg:col-span-5"
            >
              <Corners />
              <div className="border-l-4 border-brand pl-3.5">
                <span className="label-mono text-[9px] font-semibold uppercase tracking-wider text-brand">
                  Our Campus
                </span>
                <h3 className="mt-0.5 font-anton text-xl uppercase leading-tight tracking-tight text-ink sm:text-2xl">
                  Visit U-Fill Academy
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-mute">
                  Experience our state-of-the-art robotics labs, AI workstations, and hands-on maker spaces in person.
                </p>
              </div>

              <div className="relative h-[220px] w-full overflow-hidden border border-brand/40 bg-transparent sm:h-[260px] lg:h-full lg:min-h-[260px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4806.988670028622!2d78.09146527584583!3d11.720451441070573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babf9d715659a89%3A0x2bf07b1380ac8cad!2sU%20Fill%20Academy!5e1!3m2!1sen!2sin!4v1786904585535!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="U Fill Academy Map Location"
                />
                <div className="label-mono pointer-events-none absolute bottom-0 left-0 z-10 flex items-center gap-1.5 bg-brand px-3 py-1.5 text-[9px] font-medium text-white">
                  <MapPin className="h-3 w-3" />
                  <span>Perundurai Rd, Erode</span>
                </div>
              </div>
            </div>

            {/* Right: form with mascot */}
            <div
              data-reveal
              className="relative border border-ink/15 bg-transparent p-5 sm:p-6 lg:col-span-7"
            >
              <Corners />
              <div className="flex items-center justify-between gap-3 border-b border-ink/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-brand bg-transparent p-1">
                    <ContactRobotCanvas className="h-full w-full object-contain" />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div>
                    <span className="label-mono text-[9px] font-semibold uppercase tracking-wider text-brand">
                      Connect With Us
                    </span>
                    <h3 className="font-anton text-2xl uppercase leading-tight tracking-tight text-ink sm:text-3xl">
                      Send Us a Message
                    </h3>
                  </div>
                </div>
                <span className="hidden items-center gap-1 border border-brand bg-brand px-2.5 py-1 font-mono text-[10px] text-white sm:inline-flex">
                  ⚡ Quick 24h reply
                </span>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="label-mono text-[9px] text-mute">First name</span>
                    <input
                      type="text"
                      name="firstName"
                      autoComplete="given-name"
                      placeholder="Elon"
                      value={formData.firstName}
                      onChange={update("firstName")}
                      required
                      className={inputClass}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="label-mono text-[9px] text-mute">Last name</span>
                    <input
                      type="text"
                      name="lastName"
                      autoComplete="family-name"
                      placeholder="Musk"
                      value={formData.lastName}
                      onChange={update("lastName")}
                      required
                      className={inputClass}
                    />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="label-mono text-[9px] text-mute">Email address</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="elon@example.com"
                    value={formData.email}
                    onChange={update("email")}
                    required
                    className={inputClass}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="label-mono text-[9px] text-mute">Your message</span>
                  <textarea
                    rows={4}
                    name="message"
                    placeholder="Tell us what programs or technologies you're interested in..."
                    value={formData.message}
                    onChange={update("message")}
                    required
                    className={`${inputClass} resize-none`}
                  />
                </label>

                <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
                  <button
                    type="submit"
                    className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-none border border-brand bg-brand px-7 text-xs font-semibold text-white transition-colors hover:bg-transparent hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto"
                  >
                    <span>Send Message</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  {status === "sent" && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="flex items-center gap-1.5 border-l-2 border-emerald-600 pl-2.5 text-xs font-medium text-emerald-600"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Thank you! We&apos;ll reply soon.</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        ref={footerRef}
        className="relative z-10 overflow-hidden border-t-4 border-brand bg-transparent text-ink"
      >
        {/* Features row — joined cells, blue top rule on hover */}
        <div className="border-b border-ink/15">
          <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                data-reveal
                className={`group relative flex cursor-pointer items-start gap-3 p-4 transition-colors duration-200 hover:bg-brand/5 sm:p-5 ${
                  i > 0
                    ? "border-t border-ink/15 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(even)]:border-l lg:border-t-0 lg:[&:nth-child(n+2)]:border-l"
                    : ""
                }`}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100"
                />
                <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-brand/40 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  <f.icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="space-y-0.5">
                  <p className="label-mono text-[11px] font-semibold text-ink">{f.title}</p>
                  <p className="text-[11px] leading-snug text-mute">{f.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation + brand */}
        <div className="mx-auto max-w-7xl space-y-8 px-4 pb-5 pt-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-sm md:grid-cols-2 lg:grid-cols-5">
            <div data-reveal className="space-y-3 lg:col-span-2">
              <h3 className="inline-block border-b-2 border-brand pb-1 font-anton text-2xl uppercase tracking-tight text-ink">
                U Fill Academy
              </h3>
              <p className="max-w-sm text-xs leading-relaxed text-mute">
                Empowering the next generation of engineers, creators, and innovators with globalized
                Robotics, Artificial Intelligence, and IoT education — from Erode to the world.
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    title={label}
                    className="flex h-9 w-9 items-center justify-center rounded-none border border-brand/50 text-brand transition-colors hover:border-brand hover:bg-brand hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} data-reveal>
                <h4 className="label-mono mb-3 border-l-2 border-brand pl-2 text-[10px] font-semibold uppercase tracking-wider text-ink">
                  {col.title}
                </h4>
                <ul className="space-y-1.5 text-xs text-mute">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Wordmark — rises out of its own clipped slot, brand-blue */}
          <div className="w-full max-w-full overflow-hidden border-y border-ink/15 py-2 sm:py-3">
            <p
              ref={wordmarkRef}
              data-wordmark
              aria-hidden
              className="mx-auto block w-full select-none whitespace-nowrap text-center font-nsec text-[clamp(1.5rem,6.5vw,5.5rem)] leading-none tracking-tighter text-brand"
            >
              U FILL ACADEMY
            </p>
          </div>

          <div className="flex flex-col items-center justify-between gap-2 pt-1 text-[11px] text-mute sm:flex-row">
            <p>© {new Date().getFullYear()} U Fill Academy. All rights reserved.</p>
            <p className="label-mono border-l-2 border-brand pl-2 text-[9px] text-ink">
              Building the Future of Tech Education
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default ContactFooterSection;