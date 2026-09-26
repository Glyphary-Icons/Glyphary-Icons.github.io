import { useCallback, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "glyphary-theme";

function readTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const toggleTheme = useCallback(() => {
    setTheme((previous) => {
      const next: Theme = previous === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage unavailable — theme still applies for this session */
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
