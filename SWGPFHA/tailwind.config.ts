// tailwind.config.ts
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // 🔽 GLOBAL ANIMATION KEYFRAMES (match your class names)
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(1.5rem)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-up": {
          "0%": { opacity: "0", transform: "translateY(0.75rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },

      // 🔽 GLOBAL ANIMATION SHORTCUTS
      // Uses CSS vars so you can override per-element:
      //  --tw-animate-duration, --tw-animate-ease, --tw-animate-delay, --tw-animate-iteration
      animation: {
        "fade-in":
          "fade-in var(--tw-animate-duration, .5s) var(--tw-animate-ease, ease-out) var(--tw-animate-delay, 0ms) var(--tw-animate-iteration, 1) both",
        "scale-in":
          "scale-in var(--tw-animate-duration, .35s) var(--tw-animate-ease, ease-out) var(--tw-animate-delay, 0ms) var(--tw-animate-iteration, 1) both",
        "slide-in-right":
          "slide-in-right var(--tw-animate-duration, .45s) var(--tw-animate-ease, cubic-bezier(.22,1,.36,1)) var(--tw-animate-delay, 0ms) var(--tw-animate-iteration, 1) both",
        "slide-in-up":
          "slide-in-up var(--tw-animate-duration, .45s) var(--tw-animate-ease, cubic-bezier(.22,1,.36,1)) var(--tw-animate-delay, 0ms) var(--tw-animate-iteration, 1) both",
        float:
          "float var(--tw-animate-duration, 6s) ease-in-out var(--tw-animate-delay, 0ms) var(--tw-animate-iteration, infinite)",
      },

      colors: {
        // shadcn tokens
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Foundation brand mapping
        foundation: {
          blue: "hsl(var(--foundation-blue))",
          purple: "hsl(var(--foundation-purple))",
          green: "hsl(var(--foundation-green))",
          yellow: "hsl(var(--foundation-yellow))",
          cream: "hsl(var(--foundation-cream))",
        },
      },

      boxShadow: {
        foundation: "var(--shadow-foundation)",
        card: "var(--shadow-card)",
      },
      backgroundImage: {
        "gradient-foundation": "var(--gradient-foundation)",
        "gradient-hero": "var(--gradient-hero)",
        "gradient-accent": "var(--gradient-accent)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },

  // Safelist any dynamic classnames you may construct
  safelist: [
    // foundation colors (if dynamic)
    "bg-foundation-blue",
    "bg-foundation-purple",
    "bg-foundation-green",
    "bg-foundation-yellow",
    "bg-foundation-cream",
    "text-foundation-blue",
    "text-foundation-purple",
    "text-foundation-green",
    "text-foundation-yellow",
    "text-foundation-cream",
    "border-foundation-blue",
    "border-foundation-purple",
    "border-foundation-green",
    "border-foundation-yellow",
    "border-foundation-cream",
    "from-foundation-blue",
    "from-foundation-purple",
    "from-foundation-green",
    "from-foundation-yellow",
    "from-foundation-cream",
    "via-foundation-blue",
    "via-foundation-purple",
    "via-foundation-green",
    "via-foundation-yellow",
    "via-foundation-cream",
    "to-foundation-blue",
    "to-foundation-purple",
    "to-foundation-green",
    "to-foundation-yellow",
    "to-foundation-cream",

    // animation aliases used across pages
    "animate-fade-in",
    "animate-scale-in",
    "animate-slide-in-right",
    "animate-slide-in-up",
    "animate-float",
  ],

  // 🔌 Plugins: tailwindcss-animate + tiny util helpers for duration/ease/delay/iteration
  plugins: [
    animate,
    plugin(function ({ addUtilities, theme }) {
      const durations = {
        150: "150ms",
        200: "200ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
        700: "700ms",
        1000: "1000ms",
      };
      const delays = {
        75: "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
        500: "500ms",
        700: "700ms",
        1000: "1000ms",
      };
      const eases = {
        "out": "ease-out",
        "in": "ease-in",
        "in-out": "ease-in-out",
        "soft": "cubic-bezier(.22,1,.36,1)",
      };

      // utilities like: animate-duration-300 / animate-delay-200 / animate-ease-soft / animate-iterate-infinite
      const durationUtils = Object.fromEntries(
        Object.entries(durations).map(([k, v]) => [
          `.animate-duration-${k}`,
          { "--tw-animate-duration": v } as Record<string, string>,
        ])
      );
      const delayUtils = Object.fromEntries(
        Object.entries(delays).map(([k, v]) => [
          `.animate-delay-${k}`,
          { "--tw-animate-delay": v } as Record<string, string>,
        ])
      );
      const easeUtils = Object.fromEntries(
        Object.entries(eases).map(([k, v]) => [
          `.animate-ease-${k}`,
          { "--tw-animate-ease": v } as Record<string, string>,
        ])
      );

      addUtilities({
        ...durationUtils,
        ...delayUtils,
        ...easeUtils,
        ".animate-iterate-1": { "--tw-animate-iteration": "1" },
        ".animate-iterate-2": { "--tw-animate-iteration": "2" },
        ".animate-iterate-infinite": { "--tw-animate-iteration": "infinite" },
      });
    }),
  ],
};

export default config;
