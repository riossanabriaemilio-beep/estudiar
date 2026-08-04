/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F6F2",
        panel: "#FFFFFF",
        ink: "#1A1A22",
        muted: "#6B6B76",
        line: "#E7E4DC",
        tinta: "#3A2F7A",     // acento principal
        tintaSoft: "#EDE9FB",
        oro: "#B9862B",        // totales / destacados (guiño a tus Excel)
        oroSoft: "#F6EFD9",
        ok: "#2E7D5B",
        okSoft: "#E1F0E8",
        flojo: "#C0453A",
        flojoSoft: "#F7E4E1",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26,26,34,.04), 0 8px 24px -12px rgba(26,26,34,.12)",
      },
    },
  },
  plugins: [],
};
