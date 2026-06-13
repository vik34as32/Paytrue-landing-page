import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://paytrue.in",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://paytrue.in/about",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://paytrue.in/contact",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://paytrue.in/services",
      lastModified: new Date(),
      priority: 0.9,
    },
  ];
}