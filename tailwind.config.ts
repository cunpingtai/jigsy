import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
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
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "slide-top-left": {
          "0%": {
            transform: "translate(-100%, -100%)",
          },
          "100%": {
            transform: "translate(0, 0)",
          },
        },
        "slide-top-right": {
          "0%": {
            transform: "translate(100%, -100%)",
          },
          "100%": {
            transform: "translate(0, 0)",
          },
        },
        "slide-bottom-left": {
          "0%": {
            transform: "translate(-100%, 100%)",
          },
          "100%": {
            transform: "translate(0, 0)",
          },
        },
        "slide-bottom-right": {
          "0%": {
            transform: "translate(100%, 100%)",
          },
          "100%": {
            transform: "translate(0, 0)",
          },
        },
        "fade-slide-top-left": {
          "0%": {
            transform: "translate(-100%, -100%)",
            opacity: "0",
            "background-image":
              "linear-gradient(to bottom right, rgb(168 85 247 / 0%), rgb(236 72 153 / 0%))",
          },
          "100%": {
            transform: "translate(0, 0)",
            opacity: "1",
            "background-image":
              "linear-gradient(to bottom right, rgb(168 85 247 / 100%), rgb(236 72 153 / 100%))",
          },
        },
        "fade-slide-top-right": {
          "0%": {
            transform: "translate(100%, -100%)",
            opacity: "0",
            "background-image":
              "linear-gradient(to bottom left, rgb(59 130 246 / 0%), rgb(168 85 247 / 0%))",
          },
          "100%": {
            transform: "translate(0, 0)",
            opacity: "1",
            "background-image":
              "linear-gradient(to bottom left, rgb(59 130 246 / 100%), rgb(168 85 247 / 100%))",
          },
        },
        "fade-slide-bottom-left": {
          "0%": {
            transform: "translate(-100%, 100%)",
            opacity: "0",
            "background-image":
              "linear-gradient(to top right, rgb(236 72 153 / 0%), rgb(249 115 22 / 0%))",
          },
          "100%": {
            transform: "translate(0, 0)",
            opacity: "1",
            "background-image":
              "linear-gradient(to top right, rgb(236 72 153 / 100%), rgb(249 115 22 / 100%))",
          },
        },
        "fade-slide-bottom-right": {
          "0%": {
            transform: "translate(100%, 100%)",
            opacity: "0",
            "background-image":
              "linear-gradient(to top left, rgb(249 115 22 / 0%), rgb(234 179 8 / 0%))",
          },
          "100%": {
            transform: "translate(0, 0)",
            opacity: "1",
            "background-image":
              "linear-gradient(to top left, rgb(249 115 22 / 100%), rgb(234 179 8 / 100%))",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-top-left": "slide-top-left 0.8s ease-out",
        "slide-top-right": "slide-top-right 0.8s ease-out",
        "slide-bottom-left": "slide-bottom-left 0.8s ease-out",
        "slide-bottom-right": "slide-bottom-right 0.8s ease-out",
        "fade-slide-top-left": "fade-slide-top-left 1s ease-out forwards",
        "fade-slide-top-right": "fade-slide-top-right 1s ease-out forwards",
        "fade-slide-bottom-left": "fade-slide-bottom-left 1s ease-out forwards",
        "fade-slide-bottom-right":
          "fade-slide-bottom-right 1s ease-out forwards",
      },
    },
  },
  plugins: [animatePlugin],
} satisfies Config;
