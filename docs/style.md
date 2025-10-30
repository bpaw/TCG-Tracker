NativeWind Style Guide — Gamer Energy Theme (Expo + React Native)

This guide is written as a build spec for a code LLM (Claude/Cursor) to implement a NativeWind-powered design system in an Expo React Native app. It defines setup, tokens, best-practice organization, typography, color system, layout principles, accessibility, and example components. Iconography, motion, and audience sections are intentionally omitted per product decision.

0) Goals

Ship a coherent, themeable UI using NativeWind (Tailwind for RN).

Keep styling composable, semantic, and scalable.

Enforce accessibility + contrast and dark-first design.

Brand tone: Gamer Energy (electric accents on dark surfaces).

1) Stack & Setup

Install & configure:

# inside an Expo project
npm install nativewind
# (if not present)
npx expo install react-native-svg


babel.config.js

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};


tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class", // we'll control via a theme store
  theme: {
    extend: {
      colors: {
        // Core brand
        brand: {
          violet: "#7C4DFF",   // Electric violet (primary)
          charcoal: "#121826", // Background / canvas
          // Status & meta
          emerald: "#4ADE80",  // Success / Win
          coral:   "#F87171",  // Error / Loss
          amber:   "#FBBF24",  // Highlight / Meta
        },
        // Surfaces (dark-first)
        surface: {
          0:  "#0D1117", // deep canvas (rare)
          100:"#121826", // main app background (charcoal)
          200:"#1A2131", // section bg
          300:"#222A3D", // cards
          400:"#2C354D", // elevated cards / headers
        },
        // Greys for text on dark
        grayd: {
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1F2937",
          900: "#0B1220"
        }
      },
      fontFamily: {
        // Load these using expo-font if not system-available
        sans: ["Inter", "System"],
        display: ["Poppins", "System"],
        mono: ["JetBrains Mono", "System"]
      },
      // Typographic scale tuned for mobile
      fontSize: {
        xs:   [12, 18],
        sm:   [14, 20],
        base: [16, 24],
        lg:   [18, 26],
        xl:   [20, 28],
        "2xl":[24, 32],
        "3xl":[28, 36]
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      },
      spacing: {
        4.5: "18px",
        15: "60px"
      },
      // Shadows: subtle, mobile-friendly
      boxShadow: {
        card: "0px 6px 14px rgba(0,0,0,0.25)"
      },
    },
  },
  plugins: [],
};


Note: We prefer dark theme as default (charcoal background, surface cards). Light theme can be added later by extending tokens and toggling className="light" on the root container.

2) Project Structure (Styling Best Practices)
src/
  design/
    theme.ts            # theme switch helpers (dark/light), spacing, radii
    tokens.ts           # exported color + type tokens (source of truth)
    classes.ts          # semantic class recipes (strings for NativeWind)
  components/
    atoms/              # Button, Text, Badge, Card, Chip, Divider...
    molecules/          # KPI block, FormRow, ListItem...
    organisms/          # FilterBar, MatchCard, DeckCard...
  screens/
    DashboardScreen.tsx
    LogMatchScreen.tsx
    MatchHistoryScreen.tsx
    DecksScreen.tsx
    ...
  stores/
    themeStore.ts       # zustand store for theme mode


Guidelines

Tokens → Classes → Components flow:

tokens define raw values (colors, fonts, spacing).

classes define semantic recipes using NativeWind utilities (e.g., "card", "btn/primary"), so screens don’t repeat utility strings.

components consume those semantic classes, exposing props for variants (intent="primary" | "neutral", size="sm|md|lg").

Keep screens dumb, compose molecules/organisms from atoms.

Prefer composition over deep props; keep variants minimal.

3) Tokens (TS source of truth)

src/design/tokens.ts

export const colors = {
  brand: {
    violet: "#7C4DFF",
    charcoal: "#121826",
    emerald: "#4ADE80",
    coral:   "#F87171",
    amber:   "#FBBF24",
  },
  surface: {
    0:"#0D1117",
    100:"#121826",
    200:"#1A2131",
    300:"#222A3D",
    400:"#2C354D",
  },
  text: {
    primary: "#E2E8F0", // grayd-200
    secondary: "#94A3B8", // grayd-400
    muted: "#64748B" // grayd-500
  }
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20 };
export const spacing = { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 };

export const typeScale = {
  title: "text-2xl font-semibold",
  h1: "text-xl font-semibold",
  h2: "text-lg font-semibold",
  body: "text-base",
  caption: "text-sm"
};

4) Semantic Class Recipes (NativeWind)

src/design/classes.ts

// Card containers
export const card = "bg-surface-300 rounded-2xl p-4 shadow-card";
export const cardElevated = "bg-surface-400 rounded-2xl p-4 shadow-card";

// Text styles (compose with typeScale where helpful)
export const textPrimary = "text-grayd-200";
export const textSecondary = "text-grayd-400";
export const textMuted = "text-grayd-500";

// Buttons
export const btnBase =
  "rounded-2xl px-4 py-3 active:opacity-90 items-center justify-center";
export const btnPrimary =
  `${btnBase} bg-brand-violet`;
export const btnNeutral =
  `${btnBase} bg-surface-400`;
export const btnSuccess =
  `${btnBase} bg-brand-emerald`;
export const btnDanger  =
  `${btnBase} bg-brand-coral`;

// Chips / Status
export const chipBase = "px-3 py-1 rounded-xl";
export const chipWin  = `${chipBase} bg-brand-emerald/20 text-brand-emerald`;
export const chipLoss = `${chipBase} bg-brand-coral/20 text-brand-coral`;
export const chipMeta = `${chipBase} bg-brand-amber/20 text-brand-amber`;

// Layout helpers
export const screen = "flex-1 bg-surface-100 px-4 pt-4";
export const row = "flex-row items-center";
export const col = "flex-col";
export const divider = "h-px bg-surface-400/40 my-3";


Why semantic classes?
They keep screens declarative and consistent, make global visual changes trivial, and reduce copy-pasted utility strings.

5) Typography Rules

Fonts: Inter for body/data (font-sans), Poppins for headings (font-display), JetBrains Mono for numeric stats (font-mono).

Hierarchy (examples):

Title: font-display text-2xl text-grayd-100

H1: font-display text-xl text-grayd-100

Body: font-sans text-base text-grayd-200

Caption/Meta: font-sans text-sm text-grayd-400

Numbers: Use mono font selectively for KPIs to prevent layout jump.

Example:

<Text className="font-display text-xl text-grayd-100">Analytics</Text>
<Text className="font-sans text-base text-grayd-200">You’ve logged 42 matches.</Text>
<Text className="font-mono text-lg text-grayd-100">61.9%</Text>

6) Layout Principles (mark these in code comments)

Glanceability first: One insight per card; don’t overload.

Thumb reach: Primary actions near bottom/right on mobile; large hit targets (min-h-12).

Progressive disclosure: Hide advanced filters/fields behind collapsible sections.

Consistency: Uniform spacing scale (8/12/16/20/24). Use p-4, gap-3/4.

Minimal Modal Use: Prefer inline drawers/sheets for quick edits.

Information Scent: Summaries on top, details drill-down.

7) Accessibility (required)

Contrast: Ensure text on dark surfaces meets WCAG AA (≥ 4.5:1).

Non-color cues: Win/Loss uses icon/shape or text label plus color.

Dynamic Type: Respect font scaling; avoid fixed heights where possible.

Touch targets: ≥ 44×44 dp; add py-3/px-4 to buttons and list items.

Haptics: (Can add later; documented here to keep in mind.)

8) Theme Control (Dark-first)

src/stores/themeStore.ts (Zustand example)

import { create } from "zustand";

type ThemeMode = "dark" | "light";
interface ThemeState {
  mode: ThemeMode;
  toggle(): void;
  set(mode: ThemeMode): void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "dark",
  toggle: () => set({ mode: get().mode === "dark" ? "light" : "dark" }),
  set: (mode) => set({ mode })
}));


Root container toggles class:

import { useThemeStore } from "@/stores/themeStore";
import { View } from "react-native";

export function ThemedRoot({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore(s => s.mode);
  return (
    <View className={mode === "dark" ? "dark bg-surface-100" : "bg-white"}>
      {children}
    </View>
  );
}

9) Example Components
Button (atom)
// src/components/atoms/Button.tsx
import { Pressable, Text, ViewProps } from "react-native";
import { btnPrimary, btnNeutral } from "@/design/classes";

type Props = ViewProps & {
  title: string;
  intent?: "primary" | "neutral" | "success" | "danger";
};

const intentClass = {
  primary: btnPrimary,
  neutral: btnNeutral,
  success: "bg-brand-emerald " + btnNeutral,
  danger:  "bg-brand-coral "   + btnNeutral,
};

export function Button({ title, intent = "primary", ...rest }: Props) {
  const cls = intentClass[intent];
  return (
    <Pressable className={cls} {...rest}>
      <Text className="text-white font-semibold">{title}</Text>
    </Pressable>
  );
}

Card (atom)
// src/components/atoms/Card.tsx
import { View, ViewProps } from "react-native";
import { card } from "@/design/classes";

export function Card({ className = "", ...props }: ViewProps & { className?: string }) {
  return <View className={`${card} ${className}`} {...props} />;
}

KPI (molecule)
// src/components/molecules/KPI.tsx
import { View, Text } from "react-native";

export function KPI({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <View className="rounded-2xl bg-surface-300 p-3">
      <Text className="text-grayd-400 text-sm">{label}</Text>
      <Text className="font-mono text-2xl text-grayd-100 mt-1">{value}</Text>
      {delta && <Text className="text-brand-amber text-xs mt-0.5">{delta}</Text>}
    </View>
  );
}

Chip (atom)
// src/components/atoms/Chip.tsx
import { Text, View } from "react-native";
import { chipWin, chipLoss, chipMeta } from "@/design/classes";

export function Chip({ kind, text }: { kind: "win" | "loss" | "meta"; text: string }) {
  const cls = kind === "win" ? chipWin : kind === "loss" ? chipLoss : chipMeta;
  return (
    <View className={cls}>
      <Text className="text-xs font-medium">{text}</Text>
    </View>
  );
}

10) Usage Examples in Screens

Dashboard KPI row

<View className="flex-row gap-3">
  <KPI label="Win Rate" value="61.9%" delta="+4.2% last 30d" />
  <KPI label="Matches"  value="42" />
</View>


Primary action placement

<View className="mt-6">
  <Button title="Log New Match" intent="primary" />
</View>


Card list

<Card className="mt-4">
  <Text className="font-display text-lg text-grayd-100">Recent Matches</Text>
  <View className="mt-3">
    {/* list items... */}
  </View>
</Card>

11) Code Review Checklist (for the LLM & devs)

✅ No inline style objects unless dynamic; prefer className.

✅ Use semantic class recipes (classes.ts) instead of repeating utility strings.

✅ Respect spacing scale and radii consistently.

✅ Keep contrast acceptable on dark surfaces.

✅ Ensure hit areas ≥ 44dp and text sizes ≥ 14pt body.

✅ Use mono numerals for KPIs/analytics.

✅ Avoid hardcoding colors; reference tokens.

✅ Dark-first: screens render correctly with mode="dark".

12) Deliverables

tailwind.config.js configured with tokens.

src/design/{tokens.ts,classes.ts,theme.ts}.

src/stores/themeStore.ts with dark/light toggle.

Sample atoms: Button, Card, Chip, Divider, Text wrappers.

Sample molecules: KPI, ListItem, FormRow.

Apply on Dashboard, LogMatch, MatchHistory, Decks screens.

TL;DR

Implement NativeWind with a Gamer Energy dark theme using electric violet and charcoal surfaces, emerald/coral/amber for status/meta, Inter/Poppins/JetBrains Mono typography, and semantic class recipes to keep UIs consistent, accessible, and fast to iterate.