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

const inputClass =
  "w-full rounded-lg border border-ink/20 bg-transparent px-3.5 py-2.5 text-xs sm:text-[13px] text-ink placeholder:text-ink/40 transition-all focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

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
        className="relative z-10 w-full bg-transparent px-4 py-12 text-ink sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
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

          {/* Contact info — clean, transparent info bar */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_INFO.map((item) => {
              const Icon = item.icon;
              const body = (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink/10 bg-brand/5 text-brand transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <dt className="label-mono text-[9px] uppercase tracking-wider text-mute">
                      {item.label}
                    </dt>
                    <dd className="mt-0.5 text-[12px] sm:text-[13px] font-medium leading-tight text-ink line-clamp-2">
                      {item.value}
                    </dd>
                  </div>
                </div>
              );
              const cell = `group block rounded-xl border border-ink/10 bg-transparent p-3.5 transition-colors duration-200 hover:border-brand/40 ${
                item.href ? "cursor-pointer" : "cursor-default"
              }`;
              return item.href ? (
                <a key={item.label} href={item.href} data-reveal className={cell}>
                  {body}
                </a>
              ) : (
                <div key={item.label} data-reveal className={cell}>
                  {body}
                </div>
              );
            })}
          </div>

          {/* Clean, Simple Dual Grid: Campus Map & Inquiry Form */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Campus Location Card */}
            <div
              data-reveal
              className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-transparent p-5 sm:p-6 lg:col-span-5 space-y-4"
            >
              <div>
                <span className="label-mono text-[9px] font-semibold uppercase tracking-wider text-brand">Our Campus</span>
                <h3 className="font-anton uppercase text-xl sm:text-2xl leading-tight tracking-tight text-ink mt-0.5">Visit U-Fill Academy</h3>
                <p className="mt-1.5 text-xs text-mute leading-relaxed">
                  Experience our state-of-the-art robotics labs, AI workstations, and hands-on maker spaces in person.
                </p>
              </div>

              {/* Clean Map Embed */}
              <div className="relative h-[200px] sm:h-[220px] w-full overflow-hidden rounded-xl border border-ink/10 bg-transparent">
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
                <div className="label-mono pointer-events-none absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/90 px-2.5 py-1 text-[9px] font-medium text-ink shadow-sm backdrop-blur-sm">
                  <MapPin className="h-3 w-3 text-brand" />
                  <span>Perundurai Rd, Erode</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Form with Tiny Mascot */}
            <div data-reveal className="rounded-2xl border border-ink/10 bg-transparent p-5 sm:p-6 lg:col-span-7">
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <div className="flex items-center gap-3">
                  {/* Tiny Mascot Canvas Avatar */}
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-brand/5 p-1 overflow-hidden">
                    <ContactRobotCanvas className="h-full w-full object-contain" />
                    <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div>
                    <span className="label-mono text-[9px] font-semibold uppercase tracking-wider text-brand">Connect With Us</span>
                    <h3 className="font-anton uppercase text-2xl sm:text-3xl leading-tight tracking-tight text-ink">Send Us a Message</h3>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-ink/10 bg-transparent px-2.5 py-1 font-mono text-[10px] text-mute">
                  ⚡ Quick 24h reply
                </span>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    rows={3}
                    name="message"
                    placeholder="Tell us what programs or technologies you're interested in..."
                    value={formData.message}
                    onChange={update("message")}
                    required
                    className={`${inputClass} resize-none`}
                  />
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-brand px-6 text-xs font-semibold text-white transition-all hover:bg-brand/90 active:scale-[0.98]"
                  >
                    <span>Send Message</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  {status === "sent" && (
                    <div role="status" aria-live="polite" className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
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
      <footer ref={footerRef} className="relative z-10 overflow-hidden border-t border-ink/10 bg-transparent text-ink">
        {/* Features Row — Clean & Transparent */}
        <div className="border-b border-ink/10">
          <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                data-reveal
                className={`group flex items-start gap-3 p-3.5 sm:p-4 transition-colors duration-200 hover:bg-brand/5 cursor-pointer ${
                  i > 0
                    ? "border-t border-ink/10 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(even)]:border-l lg:border-t-0 lg:[&:nth-child(n+2)]:border-l"
                    : ""
                }`}
              >
                <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand transition-colors duration-300" aria-hidden />
                <div className="space-y-0.5">
                  <p className="label-mono text-[11px] font-semibold text-ink">{f.title}</p>
                  <p className="text-[11px] leading-tight text-mute">{f.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation and Brand */}
        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 px-4 pb-5 pt-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2 lg:grid-cols-5">
            <div data-reveal className="space-y-3 lg:col-span-2">
              <h3 className="font-anton uppercase text-2xl tracking-tight text-ink">U Fill Academy</h3>
              <p className="max-w-sm text-xs leading-relaxed text-mute">
                Empowering the next generation of engineers, creators, and innovators with globalized
                Robotics, Artificial Intelligence, and IoT education — from Erode to the world.
              </p>
              <div className="flex items-center gap-1.5 pt-0.5">
                {["LinkedIn", "Twitter", "Instagram", "YouTube"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    aria-label={social}
                    title={social}
                    className="label-mono flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 text-[10px] text-ink transition-all hover:border-brand hover:bg-brand hover:text-white"
                  >
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>

            {[
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
            ].map((col) => (
              <div key={col.title} data-reveal>
                <h4 className="label-mono mb-2 text-[10px] uppercase tracking-wider text-ink font-semibold">{col.title}</h4>
                <ul className="space-y-1 text-xs text-mute">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="transition-colors duration-200 hover:text-brand">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Wordmark — rises out of its own clipped slot */}
          <div className="w-full max-w-full overflow-hidden border-t border-ink/10 py-2 sm:py-3">
            <p
              ref={wordmarkRef}
              data-wordmark
              aria-hidden
              className="mx-auto block w-full select-none whitespace-nowrap text-center font-nsec text-[clamp(1.5rem,6.5vw,5.5rem)] leading-none tracking-tighter text-ink"
            >
              U FILL ACADEMY
            </p>
          </div>

          <div className="flex flex-col items-center justify-between gap-2 border-t border-ink/10 pt-3 text-[11px] text-mute sm:flex-row">
            <p>© {new Date().getFullYear()} U Fill Academy. All rights reserved.</p>
            <p className="label-mono text-[9px] text-ink">Building the Future of Tech Education</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default ContactFooterSection;
