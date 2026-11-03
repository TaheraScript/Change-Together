"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

export const THEME_STORAGE_KEY = "change-together:theme";

/*
 * The theme lives on <html class="dark"> so CSS can flip the whole app.
 * `useSyncExternalStore` reads that class directly — no state syncing in an
 * effect, and it stays in step if the class changes anywhere else.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  // The inline script in the layout resolves the real theme before paint.
  return false;
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains("dark");

    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Storage can be blocked; the theme still applies for this visit.
    }
  };

  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-green-50 hover:text-green-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200"
    >
      {isDark ? (
        <Sun size={18} strokeWidth={1.9} />
      ) : (
        <Moon size={18} strokeWidth={1.9} />
      )}
    </button>
  );
}
