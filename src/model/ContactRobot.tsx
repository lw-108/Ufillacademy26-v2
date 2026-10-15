import { useState, useEffect, useRef } from "react";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

const ROBOT_IMAGES = [
  "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457080/urobo_ypvuhc.png",
  "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457081/learningrobo_qpmvit.png",
  "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457078/teachingrobo_ktl4nt.png",
  "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457079/enggrobo_cpfqh4.png",
  "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457078/pilot_pt2mom.png",
  "https://res.cloudinary.com/qtoywhbg/image/upload/v1786457076/couplesrobo_d1s2an.png",
].map((url) => optimizeCloudinaryUrl(url, 800));

interface ContactRobotProps {
  className?: string;
}

export function ContactRobotCanvas({ className = "" }: ContactRobotProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: number | undefined;
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!timer) {
          timer = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ROBOT_IMAGES.length);
          }, 3500);
        }
      } else {
        if (timer) {
          clearInterval(timer);
          timer = undefined;
        }
      }
    }, { threshold: 0.1 });

    io.observe(el);

    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      {ROBOT_IMAGES.map((imgUrl, index) => (
        <img
          key={imgUrl}
          src={imgUrl}
          alt={`U-Fill Academy Robot ${index + 1}`}
          className={`absolute max-h-full max-w-[90%] w-auto h-auto object-contain transition-all duration-700 ease-in-out drop-shadow-[0_4px_12px_rgba(0,38,255,0.2)] ${
            index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          }`}
        />
      ))}
    </div>
  );
}

export default ContactRobotCanvas;
