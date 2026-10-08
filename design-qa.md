# Pricing design QA

## Source and implementation

- Source visual truth: user-provided pricing screenshots attached in the conversation; no local source-file path was available.
- Implementation: `http://localhost:3000/pricing`.
- Desktop implementation screenshot: `/tmp/reviewly-pricing-source-size.png`.
- Mobile implementation screenshot: `/tmp/reviewly-pricing-mobile.png`.
- Desktop viewport: 1880 × 1000 CSS px, device scale factor 1.
- Mobile viewport: 390 × 844 CSS px; the full-page capture is 390 × 5374 CSS px.
- State: pricing page at the top of the document; monthly plan cards visible; first FAQ closed in the desktop capture. Mobile menu and FAQ-open states were tested separately.
- Normalization: source and desktop implementation use the same 1880 × 1000 CSS viewport and 1× density. The source is a conversation attachment, so no pixel-level local image diff was available.

## Comparison evidence

- Full view: the implementation preserves the reference's centered marketing header, large two-line pricing headline, four-column plan grid, restrained white/gray palette, rounded borders, and generous vertical rhythm.
- Focused region: the plan grid matches the reference hierarchy with plan name, description, price, pill CTA, `Includes:` label, feature checklist, and a highlighted Production plan. No focused image crop was required because the reference contains no product imagery or dense controls beyond the plan cards.
- Responsive evidence: the 390px capture stacks all four plans vertically and keeps the FAQ and CTA readable without horizontal overflow.

## Findings

- No actionable P0/P1/P2 findings remain.
- P3: the source uses Expo branding while the implementation correctly uses Reviewly branding and Reviewly-specific plan copy. This is an intentional product adaptation, not a fidelity defect.
- P3: the source's Enterprise card shows avatar artwork; the implementation uses a lightweight Users icon to avoid introducing an unrelated asset. The CTA hierarchy remains equivalent.

## Comparison history

- Initial implementation: TypeScript exposed inconsistent optional plan flags; added explicit `popular` and `enterprise` values to every plan object. Rebuilt and re-captured the same viewport.
- Visual comparison follow-up: aligned the Production plan price to the source reference at `$199/month`.
- Post-fix evidence: `/tmp/reviewly-pricing-source-size.png`; production build completed successfully and the browser capture showed the corrected four-card layout.

## Interaction checks

- FAQ buttons toggle `aria-expanded` and reveal the corresponding answer.
- Mobile navigation opens and exposes the Pricing link.
- CTA links target `/sign-up` or the Enterprise contact mail link.
- Browser console errors: none.

## Implementation checklist

- [x] Desktop pricing hero and four-card plan grid.
- [x] FAQ accordion with accessible expanded state.
- [x] Responsive mobile navigation and stacked cards.
- [x] Pricing links connected from the landing and product headers.
- [x] TypeScript, ESLint, diff check, and production build passed.

## Follow-up polish

- Consider replacing the Enterprise Users icon with approved Reviewly team avatar assets if the product has a canonical set.

final result: passed
