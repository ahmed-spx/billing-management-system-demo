import { useCallback, useEffect, useState } from 'react'

type Mode = 'light' | 'dark'
const KEY = 'nhc-theme'

function read(): Mode | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function systemMode(): Mode {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Theme toggle for the AppBar. Writes `data-theme` on <html> so the CSS tokens
 * in theme.css switch palettes. Falls back to the OS preference when
 * the viewer has never chosen.
 */
export function useTheme() {
  const [mode, setMode] = useState<Mode>(() => read() ?? systemMode())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    try {
      localStorage.setItem(KEY, mode)
    } catch {
      /* storage may be unavailable; the attribute is enough for this session */
    }
  }, [mode])

  const toggle = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'))
  }, [])

  return { mode, toggle }
}
