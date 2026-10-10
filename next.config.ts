import type { NextConfig } from "next";

// Old Wix URLs that should keep working after the migration.
const WIX_MINISTRY_PATHS = [
  "/casais-1",
  "/doulos",
  "/ebd",
  "/eleve",
  "/evangelismo",
  "/grupo-de-louvor",
  "/grupos-pequenos",
  "/infantil",
  "/integracao",
  "/jovens",
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
  async redirects() {
    return [
      ...WIX_MINISTRY_PATHS.map((source) => ({
        source,
        destination: "/ministerios",
        permanent: true,
      })),
      { source: "/localizacao", destination: "/contato", permanent: true },
      { source: "/devocional", destination: "/", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
