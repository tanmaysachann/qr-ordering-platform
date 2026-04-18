"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Sync state with whatever the anti-flash script already applied
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };

  return { dark, toggle };
}
