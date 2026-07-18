import createSerwist from "@serwist/next"
import type { NextConfig } from "next"

const withSerwist = createSerwist({
  swSrc: "sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/", revision: process.env.NEXT_PUBLIC_BUILD_ID || "1" }],
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  outputFileTracingRoot: process.cwd(),

}

export default withSerwist(nextConfig)
