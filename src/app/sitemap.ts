import type { MetadataRoute } from "next";

const siteUrl = "https://nick-fawn.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: { en: siteUrl, ar: `${siteUrl}?lang=ar` },
      },
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: { en: `${siteUrl}/about`, ar: `${siteUrl}/about?lang=ar` },
      },
    },
    {
      url: `${siteUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: { en: `${siteUrl}/services`, ar: `${siteUrl}/services?lang=ar` },
      },
    },
    {
      url: `${siteUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: { en: `${siteUrl}/gallery`, ar: `${siteUrl}/gallery?lang=ar` },
      },
    },
    {
      url: `${siteUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: { en: `${siteUrl}/booking`, ar: `${siteUrl}/booking?lang=ar` },
      },
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: { en: `${siteUrl}/contact`, ar: `${siteUrl}/contact?lang=ar` },
      },
    },
  ];
}
