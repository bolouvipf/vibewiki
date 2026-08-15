import createSerwist from "@serwist/next"
import type { NextConfig } from "next"

// Révision unique par build : évite un cache PWA périmé après mise à jour.
const buildRevision = process.env.NEXT_PUBLIC_BUILD_ID || new Date().toISOString()

const withSerwist = createSerwist({
  swSrc: "sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/", revision: buildRevision }],
})

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  outputFileTracingRoot: process.cwd(),
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default withSerwist(nextConfig)
