## Invoice Logo Size Increase

**Current state:** The logo in `src/lib/pdf-generator.ts` is sized at `14mm`.

**Change:** Increase `logoSize` from `14` to `16` mm — a ~15% enlargement that keeps the logo at the top-right corner without affecting any other alignment (Invoice No, Date, TAX INVOICE, Bill From, table, totals, or signature sections remain exactly as they are).

**File to edit:** `src/lib/pdf-generator.ts` — one-line change in the logo drawing block.