import type { Metadata } from "next";

const siteUrl = "https://nick.sa";

export const metadata: Metadata = {
  title: "Track Your Booking — Reschedule or Cancel",
  description: "Look up, reschedule, or cancel your NICK Automotive Films booking using your confirmation number.",
  alternates: {
    canonical: `${siteUrl}/track`,
    languages: { en: `${siteUrl}/track`, ar: `${siteUrl}/track?lang=ar`, "x-default": `${siteUrl}/track` },
  },
  robots: { index: false, follow: false }, // utility page — keep out of search
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
