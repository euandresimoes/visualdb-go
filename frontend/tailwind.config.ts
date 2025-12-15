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
        // superfícies neutras (quase cinza, pouquíssimo teal)
        border: "hsl(210 6% 14%)",
        input: "hsl(210 6% 12%)",
        muted: {
          DEFAULT: "hsl(210 6% 4%)",
          foreground: "hsl(210 5% 65%)",
        },

        background: "hsl(168 71% 0%)",
        foreground: "hsl(0 0% 95%)",

        ring: "hsl(155 81% 42%)",

        primary: {
          DEFAULT: "hsl(155 81% 42%)",
          foreground: "hsl(0 0% 100%)",
        },

        secondary: {
          DEFAULT: "hsl(210 6% 10%)",
          foreground: "hsl(0 0% 90%)",
        },

        destructive: {
          DEFAULT: "hsl(0 70% 55%)",
          foreground: "hsl(0 0% 100%)",
        },

        accent: {
          DEFAULT: "hsl(210 6% 12%)",
          foreground: "hsl(0 0% 95%)",
        },

        popover: {
          DEFAULT: "hsl(210 6% 6%)",
          foreground: "hsl(0 0% 95%)",
        },

        card: {
          DEFAULT: "hsl(210 6% 7%)",
          foreground: "hsl(0 0% 95%)",
        },

        sidebar: {
          DEFAULT: "hsl(168 71% 0%)",
          foreground: "hsl(210 6% 85%)",
          primary: "hsl(155 81% 42%)",
          "primary-foreground": "hsl(0 0% 100%)",
          accent: "hsl(210 6% 11%)",
          "accent-foreground": "hsl(0 0% 95%)",
          border: "hsl(210 6% 13%)",
          ring: "hsl(155 81% 42%)",
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
