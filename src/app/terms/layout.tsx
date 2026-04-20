import type { Metadata } from "next";

const siteUrl = "https://nick.sa";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for booking and using NICK Automotive Films services.",
  alternates: {
    canonical: `${siteUrl}/terms`,
    languages: { en: `${siteUrl}/terms`, ar: `${siteUrl}/terms?lang=ar`, "x-default": `${siteUrl}/terms` },
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
