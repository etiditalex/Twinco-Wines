import type { MetadataRoute } from "next";
import { commerce } from "@/content/commerce";

export default function robots(): MetadataRoute.Robots {
  if (commerce.catalogMode !== "live") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
  };
}
