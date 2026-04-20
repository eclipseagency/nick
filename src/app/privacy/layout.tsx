import type { Metadata } from "next";

const siteUrl = "https://nick.sa";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NICK Automotive Films collects, uses, and protects your personal information.",
  alternates: {
    canonical: `${siteUrl}/privacy`,
    languages: { en: `${siteUrl}/privacy`, ar: `${siteUrl}/privacy?lang=ar`, "x-default": `${siteUrl}/privacy` },
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
