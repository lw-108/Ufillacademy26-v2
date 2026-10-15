import { useRef } from "react"
import { User } from "lucide-react"
import { MQ, revealOnScroll, splitReveal, useScene } from "@/lib/gsap"
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal"
import { optimizeCloudinaryUrl } from "@/utils/cloudinary"

interface TeamMember {
  name: string
  role: string
  subRole?: string
  /** Point this at wherever your team photos actually live under /public */
  photo?: string
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/** Verified-badge icon used next to every team member's name, in brand blue. */
function VerifiedIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function Avatar({ member, className = "" }: { member: TeamMember; className?: string }) {
  const photoUrl = member.photo ? optimizeCloudinaryUrl(member.photo, 400) : undefined
  return (
    <>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={member.name}
          className={`h-full w-full object-cover grayscale transition-[filter] duration-500 hover:grayscale-0 ${className}`}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement
            target.style.display = "none"
            target.nextElementSibling?.classList.remove("hidden")
          }}
        />
      ) : null}
      <div className={`absolute inset-0 flex items-center justify-center bg-neutral-100 ${photoUrl ? "hidden" : ""}`}>
        <User className="w-8 h-8 text-neutral-400" />
      </div>
    </>
  )
}

export function LeadershipSection() {
  const root = useRef<HTMLElement>(null)
  const { openImageModal } = useRepeatingImageModal()

  useScene(root, (mm) => {
    mm.add(MQ.motion, () => {
      const el = root.current!
      const title = el.querySelector<HTMLElement>("[data-title]")
      if (title) splitReveal(title)
      revealOnScroll(el)
    })
  })

  const team: TeamMember[] = [
    { name: "Muthubalaji M.", role: "Founder and Chief Executive Officer", photo: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786797358/muthuna_no8seg.png" },
    { name: "Hari Krishnan", role: "Deputy Managing Director", photo: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786797358/hari_rl8dwj.png" },
    { name: "Divyadharshini", role: "Financial Director", photo: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786797358/divya_xglapk.png" },
    { name: "Uma Maheshwari", role: "Chief Executive Secretary", photo: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786797359/uma_rqpwdy.png" },
    { name: "Vignesh Kumar", role: "Chief Brand Strategist", photo: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786797357/lalo_epajti.png" },
    { name: "Lingesh Warma", role: "AI & Digital Solution Manager", photo: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786797357/saul_u4tuyb.png" },
    {
      name: "Mr. Ajay Prakash M.",
      role: "Nohaya Group CEO & Founder",
      subRole: "U Fill Senior Full Stack Developer",
      photo: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786797357/jessie_papcpi.png",
    },
    {
      name: "Ms. Helan Jesudass",
      role: "Nohaya Group Managing Director",
      subRole: "U Fill Academic Support Executive",
      photo: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786797358/white_axroxz.png",
    },
  ]

  const rows = chunk(team, 4)

  return (
    <section id="leadership" ref={root} className="relative z-10 bg-transparent px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* isolate pins every z-index comparison inside this block to a single,
            predictable stacking context — nothing an ancestor does elsewhere on
            the page can steal a hovered card's place on top. */}
        <div className="isolate">

          {/* Header row, empty gutters flanking it (desktop only) */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_10fr_1fr]">
            <div className="hidden sm:block" />
            <div className="space-y-6 px-5 py-8 sm:px-10 sm:py-14">
              <div className="label-mono flex items-center gap-2.5 text-ink">
                <span className="text-brand">11</span>
                <span aria-hidden className="text-ink/30">/</span>
                <span>Meet Our</span>
              </div>
              <h2
                data-title
                className="font-anton uppercase text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] tracking-tight text-brand"
              >
                Team.
              </h2>
            </div>
            <div className="hidden sm:block" />
          </div>

          {/* ============ Tablet / Desktop — filmstrip without border lines ============ */}
          <div className="hidden sm:block">
            {rows.map((row, ri) => (
              <div
                key={ri}
                className="relative grid grid-cols-[1fr_10fr_1fr]"
              >
                <div />

                <div>
                  {/* Photos — edge to edge, grayscale, no gaps */}
                  <div className="grid grid-cols-4">
                    {row.map((member) => (
                      <div
                        key={member.name}
                        data-reveal="fade"
                        onClick={(e) => {
                          if (member.photo) {
                            openImageModal(e.currentTarget, {
                              src: member.photo,
                              alt: member.name,
                              title: member.name,
                              subtitle: `${member.role}${member.subRole ? ` · ${member.subRole}` : ""}`,
                              category: "Executive Leadership Team",
                              badge: "U Fill Academy Board",
                              description: `${member.name} serves as ${member.role} at U Fill Academy, championing innovative technical curricula, industry partnerships, and transformative student mentorship across South India.`,
                              meta: [
                                { label: "Designation", value: member.role },
                                ...(member.subRole ? [{ label: "Specialty", value: member.subRole }] : []),
                                { label: "Organization", value: "U Fill Academy" },
                                { label: "Profile", value: "Executive Leadership Board" },
                              ],
                            })
                          }
                        }}
                        className="text-ink relative z-0 hover:z-50 aspect-[3/4] bg-neutral-100 cursor-pointer group"
                      >
                        {/* Grows 20px upward on hover (top: 0 → -20px). Living on its
                            own inner box — not the grid cell itself — means the extra
                            height is purely visual and never reflows the grid track or
                            the sibling photos next to it. The very high hover z-index
                            (scoped by `isolate` above) guarantees it paints above every
                            other row, not just the one directly below the header. */}
                        <div className="absolute inset-x-0 bottom-0 top-0 hover:top-[-20px] overflow-hidden transition-[top] duration-300 ease-out shadow-none hover:shadow-xl">
                          <Avatar member={member} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Name / role strip — aligned under each photo */}
                  <div className="grid grid-cols-4">
                    {row.map((member) => (
                      <div
                        key={member.name}
                        className="flex items-start text-ink gap-2 px-4 sm:px-5 py-4 sm:py-5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-1 min-w-0">
                            <p className="text-xl font-anton uppercase tracking-wide font-normal text-ink leading-snug break-words">
                              {member.name}
                            </p>
                            <VerifiedIcon className="w-4 h-4 shrink-0 text-[#0026ff]" />
                          </div>
                          <p className="text-xs text-ink font-medium leading-snug">
                            {member.role}
                          </p>
                          {member.subRole && (
                            <p className="text-xs text-mute font-medium leading-snug italic">
                              {member.subRole}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div />
              </div>
            ))}
          </div>

          {/* ============ Mobile — clean single-column list without border lines ============ */}
          <div className="sm:hidden">
            {team.map((member) => (
              <div
                key={member.name}
                data-reveal
                onClick={(e) => {
                  if (member.photo) {
                    openImageModal(e.currentTarget, {
                      src: member.photo,
                      alt: member.name,
                      title: member.name,
                      subtitle: `${member.role}${member.subRole ? ` · ${member.subRole}` : ""}`,
                      category: "Executive Leadership Team",
                      badge: "U Fill Academy Board",
                      description: `${member.name} serves as ${member.role} at U Fill Academy, championing innovative technical curricula, industry partnerships, and transformative student mentorship across South India.`,
                      meta: [
                        { label: "Designation", value: member.role },
                        ...(member.subRole ? [{ label: "Specialty", value: member.subRole }] : []),
                        { label: "Organization", value: "U Fill Academy" },
                        { label: "Profile", value: "Executive Leadership Board" },
                      ],
                    })
                  }
                }}
                className="flex items-stretch active:bg-neutral-50 transition-colors cursor-pointer px-3 sm:px-4"
              >
                <div className="relative w-20 shrink-0 overflow-hidden my-3 rounded-lg border border-ink/10">
                  <Avatar member={member} />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xl text-ink font-anton uppercase tracking-wide leading-snug break-words">
                      {member.name}
                    </p>
                    <VerifiedIcon className="w-4 h-4 shrink-0 text-[#0026ff]" />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-mute">
                    {member.role}
                  </p>
                  {member.subRole && (
                    <p className="text-[11px] text-mute italic leading-snug">
                      {member.subRole}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LeadershipSection;