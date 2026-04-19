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

  // Sync document attributes whenever locale changes.
  // Body font-family is handled by the `[dir="rtl"] body` rule in globals.css,
  // so we only toggle lang/dir here — mutating body.style caused a hydration mismatch.
  useEffect(() => {
    const dir: Dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;

    const dict = dictionaries[locale];
    document.title = dict.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", dict.meta.description);
  }, [locale]);

  const toggleLocale = useCallback(() => {
    const next: Locale = locale === "en" ? "ar" : "en";
    setLocale(next);
    localStorage.setItem("nick-lang", next);

    // Update URL so the user can copy/share the Arabic link
    const url = new URL(window.location.href);
    if (next === "ar") {
      url.searchParams.set("lang", "ar");
    } else {
      url.searchParams.delete("lang");
    }
    window.history.replaceState({}, "", url.toString());
  }, [locale]);

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
