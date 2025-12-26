import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        /* ---------- BASE DARK NEUTRO ---------- */
        background: "#0F0F0F",
        foreground: "hsl(210 6% 88%)",

        border: "hsl(210 4% 17%)",
        input: "hsl(210 4% 15%)",

        muted: {
          DEFAULT: "hsl(210 4% 13%)",
          foreground: "hsl(210 5% 55%)",
        },

        ring: "hsl(155 40% 42%)",

        /* ---------- MAIN VIEW (MAIS CONTRASTE) ---------- */
        primaryView: {
          DEFAULT: "#121212",
        },

        /* ---------- BRAND (MENOS VERDE) ---------- */
        primary: {
          DEFAULT: "hsl(155 40% 45%)",
          foreground: "hsl(0 0% 100%)",
        },

        secondary: {
          DEFAULT: "hsl(210 4% 14%)",
          foreground: "hsl(210 6% 85%)",
        },

        destructive: {
          DEFAULT: "hsl(0 55% 50%)",
          foreground: "hsl(0 0% 100%)",
        },

        accent: {
          DEFAULT: "hsl(210 4% 16%)",
          foreground: "hsl(210 6% 88%)",
        },

        popover: {
          DEFAULT: "hsl(210 4% 14%)",
          foreground: "hsl(210 6% 88%)",
        },

        card: {
          DEFAULT: "hsl(210 4% 15%)",
          foreground: "hsl(210 6% 88%)",
        },

        /* ---------- SIDEBAR = BACKGROUND ---------- */
        sidebar: {
          DEFAULT: "#0F0F0F",
          foreground: "hsl(210 6% 78%)",
          primary: "hsl(155 40% 45%)",
          "primary-foreground": "hsl(0 0% 100%)",
          accent: "hsl(210 4% 14%)",
          "accent-foreground": "hsl(210 6% 88%)",
          border: "hsl(210 4% 17%)",
          ring: "hsl(155 40% 45%)",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        "2xs": "0 1px 2px 0 rgb(0 0 0 / 0.3)",
        xs: "0 1px 3px 0 rgb(0 0 0 / 0.4)",
        sm: "0 2px 6px -1px rgb(0 0 0 / 0.4)",
        md: "0 4px 12px -2px rgb(0 0 0 / 0.5)",
        lg: "0 0 10px 0px rgb(0 0 0 / 0.8)",
        xl: "0 16px 48px -8px rgb(0 0 0 / 0.6)",
        "2xl": "0 24px 64px -12px rgb(0 0 0 / 0.7)",
      },
      fontFamily: {
        sans: [
          "Lato",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
        serif: [
          "EB Garamond",
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "Times",
          "serif",
        ],
        mono: [
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
