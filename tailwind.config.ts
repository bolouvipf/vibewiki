import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marine: "#1E2D4F",
        compass: "#D9A441",
        terrain: "#EEF0EA",
        alert: "#B5502F",
        moss: "#5B7A5E",
        ink: "#202A22",
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Karla", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
}

export default config
