---
name: After the alert
description: A free, source-linked incident response reference and local toolset.
colors:
  primary: "#1c4de3"
  primary-deep: "#1739a4"
  primary-pale: "#eaf0ff"
  ink: "#172134"
  muted: "#536176"
  canvas: "#f3f5f8"
  surface: "#ffffff"
  surface-soft: "#f7f9fc"
  line: "#dce2eb"
  line-strong: "#bbc5d4"
  success: "#176a45"
  success-bg: "#e8f5ee"
  caution: "#81550d"
  caution-bg: "#fff4d9"
  error: "#9b2f35"
  error-bg: "#fff0f0"
typography:
  display:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "clamp(2.35rem, 5vw, 4rem)"
    fontWeight: 720
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "clamp(1.45rem, 2.5vw, 1.9rem)"
    fontWeight: 680
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.018em"
  body:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.58
  label:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 650
    lineHeight: 1.4
rounded:
  chip: "4px"
  compact: "6px"
  control: "7px"
  panel: "10px"
  feature: "12px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "9px 15px"
    height: "42px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 15px"
    height: "42px"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.compact}"
    padding: "9px 11px"
    height: "43px"
  filter-selected:
    backgroundColor: "{colors.primary-pale}"
    textColor: "{colors.primary-deep}"
    rounded: "5px"
    padding: "5px 9px"
  navigation-main:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    padding: "8px 28px"
  start-panel:
    backgroundColor: "{colors.primary-pale}"
    textColor: "{colors.ink}"
    rounded: "{rounded.feature}"
    padding: "26px"
  incident-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    padding: "20px 0"
---

# Design System: After the alert

## Overview

**Creative North Star: "Public-information wayfinding"**

After the alert is a practical route from a product name to a useful next step. Public Sans, a cool white-and-gray canvas, and a single clear blue action color keep vendor facts, response guides, and local tools easy to scan.

The pages favor direct links and compact information rows over ornamental framing. Users can move from the incident index to an original source, an operational guide, or a browser tool without mistaking a version comparison for a security clearance.

**Key Characteristics:**
- Strong editorial headings over readable, measured body text.
- Compact lists and tables with thin separators.
- Blue actions on quiet, neutral surfaces.
- Responsive navigation and content that remain usable on narrow screens.

## Colors

Deep blue is reserved for actions and active wayfinding; cool neutrals carry the reading surfaces, with distinct green, amber, and red states.

### Primary
- **Route blue** (`{colors.primary}`): Primary links, buttons, focus accents, and selected navigation.
- **Deep route blue** (`{colors.primary-deep}`): Hover and high-contrast action text.
- **Blue wash** (`{colors.primary-pale}`): Selected filters, tool results, and the quick-start panel.

### Neutral
- **Ink** (`{colors.ink}`): Main text and headings.
- **Slate** (`{colors.muted}`): Supporting text, labels, metadata, and secondary navigation.
- **Cool canvas** (`{colors.canvas}`): Overall page background.
- **White surface** (`{colors.surface}`): Form and content surfaces.
- **Soft surface** (`{colors.surface-soft}`): Quiet input and table backgrounds.
- **Fine rule** (`{colors.line}`): Row and section separators.
- **Strong rule** (`{colors.line-strong}`): Input borders and secondary controls.
- **Confirmed green** (`{colors.success}`) and **green wash** (`{colors.success-bg}`): Positive local status.
- **Caution ochre** (`{colors.caution}`) and **ochre wash** (`{colors.caution-bg}`): Caveats and warning callouts.
- **Error red** (`{colors.error}`) and **red wash** (`{colors.error-bg}`): Invalid input and error states.

## Typography

**Display Font:** Public Sans (self-hosted, sans-serif fallback)
**Body Font:** Public Sans (sans-serif fallback)
**Label/Mono Font:** Public Sans for labels; system monospace for code and addresses.

**Character:** Public Sans gives the reference a clear, contemporary reading voice. Compact monospace is limited to executable snippets, identifiers, and wallet addresses.

### Hierarchy
- **Display** (weight 690–720, 54px desktop with a 38px narrow-screen size, line-height 1.08): The home statement.
- **Headline** (weight 680, responsive 23–30.4px, line-height 1.2): Major sections and guide headings.
- **Title** (weight 650, 18px, line-height 1.3): Incident names and subsection labels.
- **Body** (weight 400, 16px, line-height 1.58): General reading; long-form prose uses a 78ch maximum.
- **Label** (weight 650, 12–14px): Filters, form labels, badges, and metadata.

## Layout

The shared content frame is capped at 1180px with 32px desktop side gutters. The home introduction pairs a large statement with a compact blue-tinted start panel; the library pairs a 220px filter rail with a dense list. At 1050px, incident rows reduce columns and the frame narrows. At 760px, the home introduction, tools, guide contents, and library stack; filters wrap for touch. At 500px, navigation and download lists become single-column. Guide and manual tables retain horizontal scrolling where their content needs it. Content columns stay near 78ch for long reading.

## Elevation & Depth

The system is flat: it uses no shadows. Fine borders, quiet surface changes, typography, and spacing establish structure; color marks action and status.

## Shapes

Controls and content regions use modest rectangular corners. Small labels and chips use 4–5px corners, inputs and buttons use 6–7px, and panels use 10–12px. Thin borders define interactive fields and bounded work areas; list rows stay open and use horizontal rules rather than card outlines.

## Components

### Buttons
- **Primary:** Blue fill with white text, compact 42px height, and 9px by 15px padding.
- **Secondary:** White fill, dark text, and a stronger neutral border; hover shifts to a pale blue surface.
- **Hover / Focus:** Hover deepens the blue. Keyboard focus gets a distinct visible outline.
- **Disabled:** Muted text on a pale neutral surface with a visible border.

### Chips
- **Style:** Small neutral labels with a fine border and compact corners.
- **State:** Selected category filters use a pale blue fill and deep blue text; inactive choices remain quiet.

### Cards / Containers
- **Start panel:** One blue-tinted region containing three direct tool links, separated by fine rules.
- **Forms:** White surfaces with a fine border and 10px corners; result panels communicate state with pale blue or semantic status colors.
- **Download feature:** Deep-blue surface with high-contrast copy and a white action button.

### Inputs / Fields
- **Style:** White background, neutral border, 6px corners, and comfortable 43px minimum height.
- **Focus:** Blue border and a light blue focus outline.
- **Error / Disabled:** Red border and tint for invalid fields; disabled controls use muted text and a neutral fill.

### Navigation
- **Style:** Compact Public Sans links with muted default text, blue hover, and a darker active page. The masthead remains horizontal on wide screens and wraps beneath the brand on small screens.
- **Guide contents:** Sticky beside the guide on desktop; moves above the article on narrow screens.

### Incident Rows
- **Style:** Open, three-column desktop rows separate product and severity, summary and next action, and source/guide/tool links. Fine horizontal rules divide entries.
- **Responsive:** Rows become two columns at medium width and one column on mobile; action links move below the descriptive text.

## Do's and Don'ts

### Do:
- **Do** use Public Sans for interface and reading text, reserving monospace for code and identifiers.
- **Do** use blue to mark actions, active navigation, and selected filters.
- **Do** keep incident entries as information rows with light separators.
- **Do** retain visible keyboard focus, semantic form states, and horizontal table access.

### Don't:
- **Don't** add ASCII decoration or bracketed text controls.
- **Don't** turn the incident library into a grid of generic cards.
- **Don't** use gradients, decorative shadows, or icons as ornamental tiles.
- **Don't** use monospace as the general interface typeface.
