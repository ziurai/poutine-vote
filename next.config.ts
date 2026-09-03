import type { NextConfig } from "next";

const CANONICAL_HOST = "poutine.mistreet.org";

const nextConfig: NextConfig = {
  async redirects() {
    // Send the *.vercel.app production URLs to the real domain so there is only
    // one address users can land on. Scoped to VERCEL_ENV === "production" so
    // preview deployments and localhost keep working normally.
    if (process.env.VERCEL_ENV !== "production") return [];

    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<host>.*)\\.vercel\\.app" }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
