---
name: After the alert
description: A product-first workbench for free incident guides, local tools and downloads.
colors:
  ink: "#162333"
  text-secondary: "#4b5b6d"
  text-muted: "#59697a"
  canvas: "#f3f6fa"
  surface: "#fff"
  surface-muted: "#eaf0f6"
  border: "#ced8e3"
  border-subtle: "#e0e6ed"
  border-strong: "#8a9aad"
  accent: "#154ce5"
  accent-strong: "#1038a6"
  accent-subtle: "#e8efff"
  success: "#23663f"
  warning: "#90531b"
  danger: "#a92e3e"
typography:
  display:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "48px"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  control: "6px"
  panel: "12px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
    height: "46px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    height: "46px"
---

# Design System: After the alert

## Overview

**Creative North Star: “Product-first workbench”**

After the alert helps a reader move from a product or incident name to the relevant guide, a browser task, or a free download. The homepage puts product search and category selection before the compact guide directory. Each guide row is a single clear route into its playbook. Scripts and templates have their own destinations; browser checks are named tasks that open in place.

The visual system is a quiet, cool-neutral work surface: IBM Plex Sans, dark ink, white reading areas, fine blue-gray rules, and a direct blue for actions and selected in-page tasks. The active primary navigation uses an ink fill with white text. Native links, form controls, disclosures, and visible keyboard focus keep the interface familiar. Guides, scripts, tools, source notes, templates, and donations remain free to access.

**Key Characteristics:**

- Product and task labels lead navigation.
- Blue marks actions and the selected in-page browser task; the active primary destination uses ink and white.
- Compact rows and separated task pages keep choices scannable.
- Evidence limits remain visible wherever a tool result could be overread.

## Colors

The palette pairs a cool blue-gray canvas with ink, white surfaces, and one clear blue action color; green, ochre, and red are reserved for semantic states.

### Primary
- **Route blue** (#154ce5): Links, primary buttons, focus outlines, and selected browser-tool navigation.
- **Deep route blue** (#1038a6): Hover state for blue actions and links.
- **Pale route blue** (#e8efff): Selected or informational blue surface.

### Neutral
- **Ink** (#162333): Main text, prominent headers, and dark download feature surface.
- **Slate text** (#4b5b6d): Supporting copy and navigation labels.
- **Muted slate** (#59697a): Secondary metadata.
- **Cool canvas** (#f3f6fa): Page background.
- **White surface** (#ffffff): Reading panels, controls, and cards.
- **Soft surface** (#eaf0f6): Secondary panels and quiet hover states.
- **Fine rule** (#ced8e3): Dividers and panel outlines.
- **Subtle rule** (#e0e6ed): Low-emphasis row separators.
- **Strong rule** (#8a9aad): Control borders.

### Semantic
- **Confirmed green** (#23663f): Successful local action status.
- **Caution ochre** (#90531b): Warnings and incomplete checks.
- **Error red** (#a92e3e): Action-required results and errors.

## Typography

**Display Font:** IBM Plex Sans (sans-serif fallback)

**Body Font:** IBM Plex Sans (sans-serif fallback)

**Label/Mono Font:** IBM Plex Sans for interface labels; system monospace for code and wallet identifiers.

**Character:** Clear, workmanlike headings and readable body copy. The same family carries navigation, form labels, directory rows, and long-form guides so the resource pages feel like one site.

### Hierarchy
- **Display** (600, 48px, 1.12): Largest lead heading where the page uses the full display scale.
- **Headline** (600, 36px, 1.2): Page and guide headings; mobile styles reduce these sizes.
- **Title** (600, 22px, 1.2): Section and task titles.
- **Body** (400, 16px, 1.55): General reading text and manual prose.
- **Label** (500, 14px, 1.5): Form labels, navigation metadata, and compact controls.
- **Small metadata** (12–14px): Snapshot dates, file details, status notes, and compact supporting text.

## Layout

The shared content grid is capped at 1120px, with 32px outer gutters on wide screens and 16px on phones. A 4px spacing rhythm scales through 8, 12, 16, 20, 24, 32, 40, 48, and 64px. The homepage places search and a native category select before a list of compact, single-action guide rows. Browser tools use expandable native task sections; scripts and downloads are separate pages with direct filenames, requirements, and actions. On phones, the manual's collapsed Contents control appears before the article. The article title and purpose precede the expanded-edition note, then the long-form material continues as one reading surface.

At 800px, wide grids and two-column areas reduce; at 600px, page gutters tighten, product rows and tool forms stack, and the manual becomes a single column. Wide tables stay in their own scroll region. Keep navigation labels and control targets readable at phone widths; do not create horizontal page overflow.

## Elevation & Depth

The interface is flat by default. White surfaces, cool-gray fills, and fine borders distinguish reading areas and tasks; the stylesheet defines no shadow vocabulary. Use color and borders to establish grouping rather than adding elevation effects.

## Shapes

Controls use 6px corners; substantial reading and task panels use 12px corners. Borders stay thin and cool gray. Directory entries and download rows use separators instead of individually boxed cards. Native disclosure summaries retain their familiar disclosure shape and interaction.

## Components

### Buttons
- **Shape:** 6px radius, at least 46px high, with 11px 18px padding.
- **Primary:** Blue fill (#154ce5), white text, medium-weight 15px type.
- **Hover / Focus:** Primary blue deepens to #1038a6; keyboard focus uses a visible 3px blue outline with 4px offset.
- **Secondary:** White fill, strong gray border, ink text; hover shifts to the soft neutral surface.

### Inputs / Fields
- **Style:** White background, strong gray border, 6px corners, 46px minimum height, 10px 12px padding.
- **Focus:** Visible 3px blue outline with 4px offset; search may use a 52px height to support its prominent role.
- **Labels:** Keep labels adjacent to the native input or select. Use muted help text for optionality, units, and evidence limits.

### Navigation
- **Style:** IBM Plex Sans, medium weight, neutral text on a compact row of 44px minimum-height links.
- **State:** The current destination uses an ink fill with white text; selected in-page browser task uses a pale blue fill and blue border.
- **Mobile:** Keep the four primary destinations visible and preserve their labels.

### Guide Rows
- **Style:** White list surface with subtle dividers, one clear product title, a short evidence summary, and a visible route into the guide.
- **Responsive behavior:** Desktop aligns title, summary, and arrow; phone layout stacks the content while keeping the entire row actionable.

### Browser Tool Sections
- Use native `<details>` and `<summary>` for named tasks. The open task is visually explicit and does not discard form data when the reader changes sections.
- Put the required product/evidence and version inputs before optional asset labels. State what each check can and cannot establish near its result.

### Script and Download Entries
- Scripts identify their filename and required runtime, then provide a direct download and a native “How to run” disclosure.
- Keep templates and the complete offline kit on the Downloads page; show file purpose and format beside each download.

### Manual Contents
- On phones, keep the native Contents disclosure collapsed above the article. Start the article with the manual title and purpose before the edition note, so the reference identifies itself in the first viewport.

## Do's and Don'ts

### Do:
- **Do** use IBM Plex Sans for interface and reading text; reserve monospace for code and identifiers.
- **Do** use the established blue tokens for actions, selected in-page tasks, and keyboard focus.
- **Do** make each product row a direct route to its guide and give scripts, browser tasks, and downloads clear labels.
- **Do** retain the tool's evidence limits and each standalone script's input and output limits.
- **Do** preserve native keyboard behavior, visible focus, touch-sized navigation, and scrollable wide tables.
- **Do** keep donations voluntary and separate from access to free materials.

### Don't:
- **Don't** add ASCII decoration, fake data states, or decorative illustrations to the workbench.
- **Don't** turn the guide directory into a grid of generic cards or give one row several competing primary actions.
- **Don't** use gradients, ornamental shadows, or unrelated icons as decoration.
- **Don't** present a version comparison, static file match, or self-recorded checkbox as proof that a system is safe.
