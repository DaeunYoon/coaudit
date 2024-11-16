import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "login-background": "url('/assets/images/loginBackground.png')",
      },
      colors: {
        "background-primary": "#0f0f10",
        "background-secondary": "#131315",
        "background-tertiary": "#131315",
        "primary-accent": "#6e56cf",
        "primary-accent-hover": "#836add",

        //Editor colours
        "editor-background": "#1a1b1b",
        "sidebar-background": "#222222",

        "active-tab": "#1a1b1b",
        "inactive-tab": "#2d2d2d",

        "text-on-dark": "#a0aec0",

        "inactive-sidebar": "#37373d",
        "sidebar-hover": "rgba(184, 184, 184, 0.31)",

        "breadcrumbs-foreground": "rgb(97, 97, 97)",

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
      daisyui: {
        themes: [
          {
            mytheme: {
              primary: "#ff00ff",
              secondary: "#ff00ff",
              accent: "#00ffff",
              neutral: "#ff00ff",
              "base-100": "#ff00ff",
              info: "#0000ff",
              success: "#00ff00",
              warning: "#00ff00",
              error: "#ff0000",
            },
          },
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
};
export default config;
