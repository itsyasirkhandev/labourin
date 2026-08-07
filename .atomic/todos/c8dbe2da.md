{
  "id": "c8dbe2da",
  "title": "Fix React Doctor warnings (39 issues in 24 files)",
  "tags": [],
  "status": "open",
  "created_at": "2026-08-07T10:43:30.914Z"
}

Issues to fix:
- unused-file (15 SVG files)
- no-array-index-as-key (4 files)
- no-transition-all (4 instances)
- no-scale-from-zero (3 instances)
- rendering-svg-precision (5 files)
- no-giant-component (1 file)

Files:
- components/templates/nova/sections/header.tsx
- components/templates/nova/sections/hero-logo.tsx
- components/templates/nova/sections/logo-cloud-1.tsx
- components/templates/nova/sections/testimonials-1.tsx
- components/templates/nova/svgs/*.tsx (15 files)

Strategy: Read react-doctor skill, inspect files, fix each category.
