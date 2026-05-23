## Problem

On `lg+` viewports (your current 1050px), clicking a Greek word darkens the page and shows nothing because the mobile `Sheet` opens at every breakpoint. Only its `SheetContent` is hidden with `lg:hidden` — the `SheetOverlay` (dark backdrop) still renders and blocks the desktop right-column `WordAnalysisPanel` behind it.

Console also shows: `DialogContent requires a DialogTitle` — the mobile sheet has no accessible title.

## Fix (in `src/routes/reader.$ref.tsx`)

1. Gate the mobile Sheet behind a viewport check so it never mounts on `lg+`:
   - Use the existing `useIsMobile` hook from `src/hooks/use-mobile.tsx` (or a small `useMediaQuery('(max-width: 1023px)')`) to compute `isCompact`.
   - Render the `<Sheet>` block only when `isCompact` is true. This removes both the overlay and the content on desktop, so the persistent right-column panel is the sole UI.
   - Keep `open={!!selectedToken}` and `onOpenChange` logic unchanged.

2. Add an accessible title inside `SheetContent`:
   - Import `SheetHeader`, `SheetTitle`, `SheetDescription` from `@/components/ui/sheet`.
   - Wrap them in `VisuallyHidden` (`@radix-ui/react-visually-hidden`, already a transitive dep via shadcn) so the panel's existing visual header stays unchanged but screen readers / Radix get a title + description.
   - Title: `Word analysis` (or the selected lemma). Description: short fixed string.

3. No changes needed to `WordAnalysisPanel` or any other file.

## Why this approach

- The current `lg:hidden` on `SheetContent` is a CSS-only hide; Radix still mounts the portal + overlay + focus trap regardless of Tailwind classes. Conditional render is the only correct fix.
- `useIsMobile` is already in the project, so no new dependency.
- Keeps the URL-driven `?w=...` selection model intact — desktop reads it via the right column, mobile reads it via the Sheet.

## Out of scope

- No changes to data layer, styling tokens, or other routes.
- The existing breakpoint (`lg`, 1024px) for switching layouts is preserved.
