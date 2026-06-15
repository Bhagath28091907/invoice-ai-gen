## Stretch Logo on Invoice PDF

### Goal
Slightly stretch the logo image on the invoice PDF both horizontally and vertically so it is clearly visible, while keeping every other element's alignment unchanged.

### Current State
- Logo is drawn as a perfect square: 16mm × 16mm
- Positioned at the top-right corner

### Change
- Change `logoSize` from a single value to separate width and height variables
- Increase width slightly (e.g., 18mm) for horizontal stretch
- Increase height slightly (e.g., 17mm) for vertical stretch
- Keep the same top-right corner position so nothing else shifts

### Verification
- Generate a test PDF and visually confirm the logo is more visible
- Confirm TAX INVOICE header, Invoice No, Date, and all other elements remain in their exact original positions

### Files Modified
- `src/lib/pdf-generator.ts` (the logo `addImage` call, ~line 72)