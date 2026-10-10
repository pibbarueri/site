import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

const PATHS = ["", "/quem-somos", "/ministerios", "/agenda", "/mensagens", "/contato"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: `${SITE.url}${path}` }));
}
