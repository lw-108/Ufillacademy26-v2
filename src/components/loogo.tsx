import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  imageClassName?: string
  textClassName?: string
  showText?: boolean
  size?: number
}

export function Logo({
  className,
  imageClassName,
  textClassName,
  showText = true,
  size = 40,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="https://res.cloudinary.com/qtoywhbg/image/upload/v1786457080/urobo_ypvuhc.png"
        alt="U Fill Academy logo"
        width={size}
        height={size}
        className={cn("object-contain shrink-0", imageClassName)}
      />
      {showText && (
        <span
          className={cn(
            "text-lg font-black tracking-tight uppercase leading-none text-neutral-900 dark:text-white",
            textClassName
          )}
        >
          U Fill Academy
        </span>
      )}
    </div>
  )
}