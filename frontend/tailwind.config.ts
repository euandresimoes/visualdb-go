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
        border: "hsl(240 8% 20%)",
        input: "hsl(240 8% 16%)",
        ring: "hsla(155, 81%, 42%, 1.00)",
        background: "hsl(240 10% 8%)",
        foreground: "hsl(0 0% 95%)",
        primary: {
          DEFAULT: "hsla(155, 81%, 42%, 1.00)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(240 8% 14%)",
          foreground: "hsl(0 0% 90%)",
        },
        destructive: {
          DEFAULT: "hsl(0 70% 55%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(240 8% 12%)",
          foreground: "hsl(240 5% 65%)",
        },
        accent: {
          DEFAULT: "hsl(240 8% 16%)",
          foreground: "hsl(0 0% 95%)",
        },
        popover: {
          DEFAULT: "hsl(240 10% 10%)",
          foreground: "hsl(0 0% 95%)",
        },
        card: {
          DEFAULT: "hsl(240 8% 12%)",
          foreground: "hsl(0 0% 95%)",
        },
        sidebar: {
          DEFAULT: "hsl(240 10% 8%)",
          foreground: "hsl(0 0% 85%)",
          primary: "hsla(155, 81%, 42%, 1.00)",
          "primary-foreground": "hsl(0 0% 100%)",
          accent: "hsl(240 8% 16%)",
          "accent-foreground": "hsl(0 0% 95%)",
          border: "hsl(240 8% 16%)",
          ring: "hsla(155, 81%, 42%, 1.00)",
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
        lg: "0 8px 24px -4px rgb(0 0 0 / 0.5)",
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
