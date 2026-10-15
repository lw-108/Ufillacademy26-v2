"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

export type CardNavItem = {
  label: string;
  links: CardNavLink[];
};

const navItems: CardNavItem[] = [
  {
    label: "About & Leadership",
    links: [
      { label: "About Us", href: "#about", ariaLabel: "About U Fill Academy" },
      { label: "Vision & Mission", href: "#vision-mission", ariaLabel: "Vision and Mission" },
      { label: "Leadership", href: "#leadership", ariaLabel: "Academy Leadership" },
    ],
  },
  {
    label: "Ecosystem & Programs",
    links: [
      { label: "Framework", href: "#framework", ariaLabel: "Learning Framework" },
      { label: "Brands", href: "#brands", ariaLabel: "Associated Brands" },
      { label: "Events", href: "#events", ariaLabel: "Events & Summits" },
      { label: "Future Vision", href: "#roadmap", ariaLabel: "Future Roadmap" },
    ],
  },
  {
    label: "Connect & Register",
    links: [
      { label: "Contact Us", href: "#contact", ariaLabel: "Contact Information" },
      { label: "Specializations", href: "#specializations", ariaLabel: "Course Specializations" },
    ],
  },
];

const BAR_HEIGHT = 60;

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const showAnimRef = useRef<gsap.core.Tween | null>(null);
  const openRef = useRef(false);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const nav = navRef.current;
    if (!wrap || !nav) return;

    const ctx = gsap.context(() => {
      // ── Menu expand / collapse ────────────────────────────────────────
      // The nav is a fixed 60px bar; the card panel sits below it in normal
      // flow (clipped by overflow-hidden), so the expanded height is simply
      // the nav's own scrollHeight — no per-breakpoint magic numbers.
      gsap.set(nav, { height: BAR_HEIGHT });
      gsap.set(cardsRef.current, { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap.set(nav, { height: "auto" });
        },
      });
      tl.to(nav, { height: () => nav.scrollHeight, duration: 0.5 }).to(
        cardsRef.current,
        { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.07 },
        "-=0.25"
      );
      menuTl.current = tl;

      // ── Auto-hide on scroll down & re-appear on scroll up ──────────────
      const showAnim = gsap
        .from(wrap, {
          yPercent: -120,
          paused: true,
          duration: 0.32,
          ease: "power2.out",
        })
        .progress(1);
      showAnimRef.current = showAnim;

      let lastScrollY = window.scrollY || 0;

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const currentScrollY = self.scroll();

          // Never hide while the menu dropdown is open
          if (openRef.current) {
            showAnim.play();
            lastScrollY = currentScrollY;
            return;
          }

          // Always show near the top of the page
          if (currentScrollY <= 80) {
            showAnim.play();
            lastScrollY = currentScrollY;
            return;
          }

          const diff = currentScrollY - lastScrollY;

          // Ignore micro-jitter (< 8px)
          if (Math.abs(diff) < 8) return;

          if (diff > 0 && self.direction === 1) {
            // Scrolling down -> hide navbar
            showAnim.reverse();
          } else if (diff < 0 && self.direction === -1) {
            // Scrolling up -> re-appear navbar
            showAnim.play();
          }

          lastScrollY = currentScrollY;
        },
      });
    }, wrap);

    return () => {
      ctx.revert();
      menuTl.current = null;
      showAnimRef.current = null;
    };
  }, []);

  const open = useCallback(() => {
    const tl = menuTl.current;
    if (!tl) return;
    openRef.current = true;
    setIsOpen(true);
    // Ensure navbar is visible when menu opens
    showAnimRef.current?.play();
    // Re-measure from the collapsed bar so the target height is current.
    gsap.set(navRef.current, { height: BAR_HEIGHT });
    tl.invalidate().play(0);
  }, []);

  const close = useCallback(() => {
    const tl = menuTl.current;
    if (!tl || !openRef.current) return;
    openRef.current = false;
    setIsOpen(false);
    // Freeze the auto height as a number so the reverse tween starts from it.
    gsap.set(navRef.current, { height: navRef.current?.offsetHeight });
    tl.reverse();
  }, []);

  const toggle = () => (isOpen ? close() : open());

  return (
    <div
      ref={wrapRef}
      data-site-navbar
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-3 sm:px-4 will-change-transform"
    >
      <nav
        ref={navRef}
        aria-label="Primary"
        className="pointer-events-auto relative w-full max-w-[960px] overflow-hidden border border-t-0 border-ink/15 bg-white/95 backdrop-blur-md"
      >
        {/* Top bar */}
        <div className="relative flex h-[60px] items-center justify-between px-4">
          <button
            type="button"
            onClick={toggle}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="group flex h-10 w-10 flex-col items-start justify-center gap-[6px]"
          >
            <span
              className={`h-[2px] bg-ink transition-all duration-300 ${
                isOpen ? "w-6 translate-y-[4px] rotate-45" : "w-6 group-hover:w-4"
              }`}
            />
            <span
              className={`h-[2px] bg-ink transition-all duration-300 ${
                isOpen ? "w-6 -translate-y-[4px] -rotate-45" : "w-4 group-hover:w-6"
              }`}
            />
          </button>

          <a
            href="#top"
            aria-label="U Fill Academy — back to top"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
          >
            <img
              className="h-[42px] w-auto"
              src="https://res.cloudinary.com/qtoywhbg/image/upload/f_auto,q_auto,w_120/v1786457080/urobo_ypvuhc.png"
              alt=""
              width={42}
              height={42}
            />
          </a>

          <a
            href="#specializations"
            className="label-mono hidden h-[38px] items-center bg-ink px-5 text-white transition-colors duration-300 hover:bg-brand sm:inline-flex"
          >
            Get Started
          </a>
        </div>

        {/* Expandable card panel: Transparent + Backdrop-blur-md (No dark popup) */}
        <div
          className="flex flex-col gap-3 p-3 pt-1 md:flex-row"
          aria-hidden={!isOpen}
        >
          {navItems.map((item, idx) => (
            <div
              key={item.label}
              ref={(el) => {
                if (el) cardsRef.current[idx] = el;
              }}
              className="flex min-w-0 flex-1 flex-col justify-between gap-6 rounded-xl border border-ink/10 bg-white/70 backdrop-blur-md p-4 text-ink md:min-h-[190px] shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-ink/10 pb-2.5">
                <span className="text-[15px] font-semibold tracking-tight text-ink">{item.label}</span>
                <span className="label-mono text-mute">0{idx + 1}</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {item.links.map((lnk) => (
                  <li key={lnk.href}>
                    <a
                      href={lnk.href}
                      aria-label={lnk.ariaLabel}
                      onClick={close}
                      tabIndex={isOpen ? 0 : -1}
                      className="group flex items-center justify-between py-1 text-sm font-medium text-mute transition-colors hover:text-brand"
                    >
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        {lnk.label}
                      </span>
                      <ArrowUpRight
                        className="h-3.5 w-3.5 text-mute transition-colors group-hover:text-brand"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
