import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://paytrue.co.in",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://paytrue.co.in/about",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://paytrue.co.in/contact",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://paytrue.co.in/services",
      lastModified: new Date(),
      priority: 0.9,
    },
  ];
}