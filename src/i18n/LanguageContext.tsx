"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Dictionary } from "./types";
import { en } from "./en";
import { ar } from "./ar";

type Locale = "en" | "ar";
type Dir = "ltr" | "rtl";

interface LanguageContextValue {
  locale: Locale;
  t: Dictionary;
  dir: Dir;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  t: en,
  dir: "ltr",
  toggleLocale: () => {},
});

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  // Read URL param (priority) or localStorage on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang === "ar" || urlLang === "en") {
      setLocale(urlLang);
      localStorage.setItem("nick-lang", urlLang);
    } else {
      const saved = localStorage.getItem("nick-lang") as Locale | null;
      if (saved === "ar" || saved === "en") {
        setLocale(saved);
      }
    }
  }, []);

  // Sync document attributes whenever locale changes
  useEffect(() => {
    const dir: Dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;

    // Swap body font for Arabic
    if (locale === "ar") {
      document.body.style.fontFamily = "var(--font-ar), system-ui, sans-serif";
    } else {
      document.body.style.fontFamily = "var(--font-sans), system-ui, sans-serif";
    }

    // Update document title & meta description
    const dict = dictionaries[locale];
    document.title = dict.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", dict.meta.description);
  }, [locale]);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "en" ? "ar" : "en";
      localStorage.setItem("nick-lang", next);

      // Update URL so the user can copy/share the Arabic link
      const url = new URL(window.location.href);
      if (next === "ar") {
        url.searchParams.set("lang", "ar");
      } else {
        url.searchParams.delete("lang");
      }
      window.history.replaceState({}, "", url.toString());

      return next;
    });
  }, []);

  const dir: Dir = locale === "ar" ? "rtl" : "ltr";
  const t = dictionaries[locale];

  return (
    <LanguageContext.Provider value={{ locale, t, dir, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
