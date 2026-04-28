---
name: Cultural Modernism
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#554336'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#887364'
  outline-variant: '#dbc2b0'
  surface-tint: '#8f4e00'
  primary: '#8f4e00'
  on-primary: '#ffffff'
  primary-container: '#ff9933'
  on-primary-container: '#693800'
  inverse-primary: '#ffb77a'
  secondary: '#156874'
  on-secondary: '#ffffff'
  secondary-container: '#a4ebf9'
  on-secondary-container: '#1c6c78'
  tertiary: '#934b19'
  on-tertiary: '#ffffff'
  tertiary-container: '#f79b62'
  on-tertiary-container: '#713200'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc2'
  primary-fixed-dim: '#ffb77a'
  on-primary-fixed: '#2e1500'
  on-primary-fixed-variant: '#6d3a00'
  secondary-fixed: '#a7eefc'
  secondary-fixed-dim: '#8bd2df'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004e59'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68c'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#753401'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  title-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 20px
  margin-desktop: 40px
  gutter: 16px
  touch-target: 48px
---

## Brand & Style
The brand personality is an **Empowering Companion**: a guide that feels both wise and youthful. This design system bridges the gap between traditional Indian educational values and a forward-looking digital future. 

The style is **Modern Minimalist with Tactile Accents**. It utilizes expansive whitespace (Warm White) to reduce cognitive load for students, while employing "Earthy Accents" and organic motifs to ground the experience in a recognizable cultural context. The UI should feel like a high-quality physical workbook—structured, clean, but full of warmth and encouragement. Elements are soft and approachable to ensure students of all ages feel invited rather than intimidated.

## Colors
The palette is inspired by the natural and cultural landscape of India. 
- **Soft Saffron** is the primary driver, used for calls to action and progress indicators to evoke energy and enlightenment. 
- **Deep Teal** provides a sophisticated contrast for text, headers, and primary navigation, ensuring high legibility and a sense of calm authority. 
- **Warm White** serves as the primary canvas, reducing the harshness of pure white screens for long study sessions.
- **Earthy Accents** (Clay and Ochre) are reserved for decorative elements, illustrations, and secondary icons to provide a "grounded" feel.
- High-contrast accessibility is maintained by ensuring all text-on-background combinations meet WCAG AA standards.

## Typography
This design system utilizes **Be Vietnam Pro** for headlines and **Public Sans** for body and interface text. This combination offers a tech-forward yet highly readable experience.

**Be Vietnam Pro**'s geometric character brings a contemporary, professional tone to headlines, helping organize content with clarity. **Public Sans** is used for body text and labels to ensure maximum accessibility and comfort during long reading sessions. Body text uses a 1.6x line-height to maintain a friendly, open rhythm. Labels and small metadata should always be accompanied by icons to aid comprehension across different literacy levels.

## Layout & Spacing
The layout follows a **Fluid Grid** model with generous safe areas. 
- A mobile-first 4-column grid is used for handsets, scaling to 12 columns for tablets and desktops.
- **Spacing Rhythm:** Based on an 8px baseline grid to ensure mathematical harmony.
- **Touch Targets:** Minimum 48x48px for all interactive elements to accommodate younger users' motor skills.
- Padding inside cards should be at least 24px to prevent content from feeling cramped and to maintain a "friendly" breathability.

## Elevation & Depth
Depth is created through **Tonal Layers** rather than heavy shadows. 
- **Surface Level 0:** Warm White background.
- **Surface Level 1 (Cards):** Pure White with a very soft, low-opacity (4%) Teal-tinted shadow to suggest a physical "lift."
- **Interactive States:** Buttons use a slight vertical offset (2px) and a subtle inner-glow when pressed to mimic a tactile, squishy physical response.
- **Focus States:** High-visibility 3px Saffron outlines are mandatory for all keyboard and screen-reader navigation to satisfy accessibility requirements.

## Shapes
The shape language is defined by "The Soft Square." 
- **Standard Corners:** 16px radius for primary cards to create a friendly, approachable aesthetic.
- **Large Components:** 24px+ for containers and hero sections.
- **Buttons:** Fully rounded (pill-shaped) for primary actions to distinguish them from informational cards.
- **Iconography:** Icons should feature rounded caps and corners (2px stroke width) to mirror the UI’s softness. Avoid sharp 90-degree angles in any UI decoration.

## Components
- **Buttons:** Primary buttons are pill-shaped with Saffron backgrounds and Deep Teal text. Secondary buttons use a Deep Teal outline.
- **Cards:** Must have a minimum 16px corner radius. They should feature a clear "header" area and an optional "footer" for action links.
- **Progress Trackers:** Custom-designed using circular "Path" metaphors common in Indian board games to gamify the learning journey.
- **Navigation:** Bottom navigation for mobile uses the "Icon + Label" pattern. Icons are filled when active and use the Soft Saffron color.
- **Input Fields:** Large 56px height fields with 12px rounded corners. The label is always visible (no floating labels that disappear) for cognitive clarity.
- **Feedback Toasts:** Centered at the top of the screen with a slight "bounce" animation to mimic a supportive nod from a teacher.
- **Subject Chips:** Small, rounded tags using different "Earthy Accents" to categorize subjects (e.g., Terracotta for History, Forest Green for Science).