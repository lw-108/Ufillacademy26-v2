/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

/**
 * The site is light-only (white background, black text). This provider is
 * kept so existing imports keep working, but it pins the document to the
 * light theme and clears any stale "dark" class or stored preference left
 * behind by the previous theme switcher.
 */
type Theme = "light"

type ThemeProviderState = {
  theme: Theme
}

const ThemeProviderContext = React.createContext<ThemeProviderState>({
  theme: "light",
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark")
    root.classList.add("light")
    root.style.colorScheme = "light"
    try {
      localStorage.removeItem("theme")
    } catch {
      /* storage unavailable (private mode) — nothing to clean up */
    }
  }, [])

  return (
    <ThemeProviderContext.Provider value={{ theme: "light" }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => React.useContext(ThemeProviderContext)
