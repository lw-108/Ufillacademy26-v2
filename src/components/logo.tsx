interface LogoProps {
  className?: string;
  compact?: boolean;
}

/** Text logo — "U FILL ACADEMY" matching official brand identity */
export const Logo = ({ className = "", compact = false }: LogoProps) => {
  if (compact) {
    return (
      <div className={`inline-flex items-end select-none ${className}`}>
        {/* Compact Logo for Navbar / Sheets */}
        <span
          className="font-nsec font-bold text-[#0026ff] text-4xl sm:text-5xl leading-[0.82] tracking-tighter"
          style={{ fontFamily: "'NSEC', 'Instrument Serif', Georgia, serif" }}
        >
          U
        </span>
        <div className="flex flex-col justify-end ml-1.5 sm:ml-2 pb-0.5 -space-y-0.5">
          {/* Top row: "FILL" on the left, Book Icon on the right directly above 'Y' */}
          <div className="flex items-center justify-between w-full gap-2">
            <span className="font-league font-bold text-xs sm:text-sm tracking-[0.02em] text-black uppercase leading-none">
              FILL
            </span>
            <svg
              className="w-3.5 h-2.5 sm:w-4 sm:h-3 text-black shrink-0"
              viewBox="0 0 48 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M24 6C18 3 8 3 3 6V27C8 24 18 24 24 27V6Z" />
              <path d="M24 6C30 3 40 3 45 6V27C40 24 30 24 24 27V6Z" />
              <path d="M24 6V27" strokeWidth="2.8" />
              <path d="M7 10C12 8 18 8 21 10" strokeWidth="1.4" />
              <path d="M7 14C12 12 18 12 21 14" strokeWidth="1.4" />
              <path d="M7 18C12 16 18 16 21 18" strokeWidth="1.4" />
              <path d="M27 10C30 8 36 8 41 10" strokeWidth="1.4" />
              <path d="M27 14C30 12 36 12 41 14" strokeWidth="1.4" />
              <path d="M27 18C30 16 36 16 41 18" strokeWidth="1.4" />
            </svg>
          </div>
          {/* Bottom row: "ACADEMY" */}
          <span className="font-league font-bold text-xs sm:text-sm tracking-[0.02em] text-black uppercase leading-none whitespace-nowrap">
            ACADEMY
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-end select-none ${className}`}>
      {/* The large bold "U" in official brand blue */}
      <span
        className="font-nsec font-bold text-[#0026ff] text-8xl sm:text-9xl md:text-[135px] lg:text-[155px] leading-[0.8] tracking-tighter"
        style={{ fontFamily: "'NSEC', 'Instrument Serif', Georgia, serif" }}
      >
        U
      </span>

      {/* Right Stack: Positioned at the LOWER RIGHT of the big "U" with tight line gap */}
      <div className="flex flex-col justify-end ml-2 sm:ml-2.5 md:ml-3 pb-0.5 sm:pb-1 md:pb-1.5 -space-y-0.5 sm:-space-y-1">
        {/* Top row: "FILL" text on the left, Book Icon on the right aligned above 'Y' in ACADEMY */}
        <div className="flex items-center justify-between w-full gap-2 sm:gap-3">
          <span className="font-league font-bold text-2xl sm:text-[28px] md:text-[36px] lg:text-[42px] tracking-[0.02em] text-black leading-none whitespace-nowrap">
            FILL
          </span>
          {/* Open Book Line-Art Icon placed directly above the 'Y' */}
          <svg
            className="w-6 h-4 sm:w-7 sm:h-5 md:w-9 md:h-6 lg:w-11 lg:h-7.5 text-black shrink-0"
            viewBox="0 0 48 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Left page outline */}
            <path d="M24 6C18 3 8 3 3 6V27C8 24 18 24 24 27V6Z" />
            {/* Right page outline */}
            <path d="M24 6C30 3 40 3 45 6V27C40 24 30 24 24 27V6Z" />
            {/* Center spine */}
            <path d="M24 6V27" strokeWidth="2.8" />
            {/* Internal page lines - Left */}
            <path d="M7 10C12 8 18 8 21 10" strokeWidth="1.4" />
            <path d="M7 14C12 12 18 12 21 14" strokeWidth="1.4" />
            <path d="M7 18C12 16 18 16 21 18" strokeWidth="1.4" />
            {/* Internal page lines - Right */}
            <path d="M27 10C30 8 36 8 41 10" strokeWidth="1.4" />
            <path d="M27 14C30 12 36 12 41 14" strokeWidth="1.4" />
            <path d="M27 18C30 16 36 16 41 18" strokeWidth="1.4" />
          </svg>
        </div>

        {/* Bottom row: "ACADEMY" with trailing 'Y' directly under the book icon */}
        <div>
          <span className="font-league font-bold text-2xl sm:text-[28px] md:text-[36px] lg:text-[42px] tracking-[0.02em] text-black leading-none whitespace-nowrap block">
            ACADEMY
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;