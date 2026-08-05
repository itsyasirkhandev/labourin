# A11Y Decisions Log (Pattern Memory)

> **Purpose:** cross-turn memory of choices between **equally conformant alternatives**.

## Decisions

- **Modal Dialogs & Mobile Drawers** → Radix UI `Dialog` and `Sheet` primitives — provides focus trapping, aria-modal, title/description linkage, and Escape key dismissal out of the box. (2026-08-05)
- **Toast Notifications** → `sonner` via `Toaster` primitive with `aria-live` region — automated polite status announcements. (2026-08-05)
- **Theme Switcher** → `<button>` with `aria-label="Switch to {opposite} mode"` and `aria-hidden="true"` on inner Phosphor SVGs. (2026-08-05)
