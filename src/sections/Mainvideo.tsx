"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { gsap, CONDITIONS, useScene } from "@/lib/gsap";
import { SectionHeading } from "@/components/SectionHeading";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

const VIDEO_SRC = optimizeCloudinaryUrl(
  "https://res.cloudinary.com/qtoywhbg/video/upload/v1786351053/aiaiai_online-video-cutter.com_rtsgzz.mp4"
);

// Cloudinary can render any frame of a video as an image — used so the
// frame has real content before the (large) video file is fetched.
const POSTER_SRC = VIDEO_SRC.replace(
  "/video/upload/",
  "/video/upload/so_1,f_jpg,q_auto,w_1600/"
).replace(/\.mp4$/, ".jpg");

const formatTime = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

export function Mainvideo() {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);

  // Only start fetching the video when it's about to be scrolled to.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          io.disconnect();
        }
      },
      { rootMargin: "900px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setIsPlaying(false));
    else video.pause();
  };

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const ratio = video.duration ? video.currentTime / video.duration : 0;
    if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
    if (timeRef.current) {
      timeRef.current.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration;
  };

  useScene(root, (mm) => {
    // Tablet / desktop: the frame is pinned and expands from a small inset
    // window to full-bleed as the user scrolls. On phones and with reduced
    // motion nothing is set up, so the video simply sits in the page.
    mm.add(CONDITIONS.full, () => {
      const stage = stageRef.current!;
      const frame = stage.querySelector<HTMLElement>("[data-frame]")!;
      const video = stage.querySelector<HTMLElement>("video")!;
      const hint = stage.querySelector<HTMLElement>("[data-hint]");
      const ui = stage.querySelector<HTMLElement>("[data-ui]");

      gsap.set(video, { scale: 1.35 });
      gsap.set(ui, { autoAlpha: 0, y: 16 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=125%",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
          defaults: { ease: "none" },
        })
        // fromTo with identically-shaped strings: browsers normalise a
        // computed `inset(20% 28% ...)` to a shorter form, which makes GSAP
        // misalign the numbers if the start value is read back instead.
        .fromTo(
          frame,
          { clipPath: "inset(20% 28% 20% 28% round 20px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1, ease: "power2.inOut" },
          0
        )
        .to(video, { scale: 1, duration: 1, ease: "power2.inOut" }, 0)
        .to(hint, { autoAlpha: 0, duration: 0.15 }, 0)
        .to(ui, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.7)
        .to({}, { duration: 0.25 }); // brief hold at full-bleed
    });
  });

  return (
    <section id="main-video" ref={root} className="relative bg-transparent pt-24 sm:pt-32">
      <div className="mx-auto mb-12 max-w-7xl px-4 sm:mb-16 sm:px-6 lg:px-8">
        <SectionHeading
          index="03"
          eyebrow="Featured Showcase Video"
          title={
            <>
              Experience Innovation in <span className="text-brand">Motion</span>
            </>
          }
        />
      </div>

      <div
        ref={stageRef}
        className="relative mx-4 aspect-video overflow-hidden bg-transparent sm:mx-6 md:mx-0 md:aspect-auto md:h-screen"
      >
        <div data-frame className="absolute inset-0 overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={nearViewport ? VIDEO_SRC : undefined}
            poster={POSTER_SRC}
            muted={isMuted}
            playsInline
            preload={nearViewport ? "metadata" : "none"}
            className="absolute inset-0 h-full w-full cursor-pointer object-cover will-change-transform"
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onTimeUpdate}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"
          />

          {/* Transport bar */}
          <div
            data-ui
            className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 px-4 pb-4 sm:gap-4 sm:px-8 sm:pb-8"
          >
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              className="flex h-11 w-11 shrink-0 items-center justify-center bg-white text-ink transition-colors hover:bg-brand hover:text-white"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 translate-x-px fill-current" />
              )}
            </button>

            <div
              role="progressbar"
              aria-label="Video progress"
              onClick={seek}
              className="group relative h-6 flex-1 cursor-pointer"
            >
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/40" />
              <span
                ref={progressRef}
                className="absolute inset-x-0 top-1/2 h-[3px] origin-left -translate-y-1/2 scale-x-0 bg-white"
              />
            </div>

            <span ref={timeRef} className="label-mono hidden text-white sm:block">
              0:00 / 0:00
            </span>

            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/60 text-white transition-colors hover:bg-white hover:text-ink"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <p
          data-hint
          className="label-mono pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-ink md:block"
        >
          Scroll to expand
        </p>
      </div>
    </section>
  );
}

export default Mainvideo;
