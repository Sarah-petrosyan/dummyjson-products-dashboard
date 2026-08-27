# Evals — /api/search

Ten-ish inputs and the filter each one should produce. Run these after any change to the
system prompt: a prompt change can silently break a case that was already correct.

Endpoint: `/api/search?q=<query>` → `{ category, maxPrice, unavailable, needsPrice }`

| # | Query | category | maxPrice | unavailable | needsPrice |
|---|-------|----------|----------|-------------|------------|
| 1 | cheap phones under 500 | smartphones | 500 | false | false |
| 2 | under 20 dollars | null | 20 | false | false |
| 3 | something for my dog | null | null | **true** | false |
| 4 | womens shoes | womens-shoes | null | false | false |
| 5 | a laptop for under 1000 | laptops | 1000 | false | false |
| 6 | tablets under 300 | tablets | 300 | false | false |
| 7 | sunglasses | sunglasses | null | false | false |
| 8 | car insurance | null | null | **true** | false |
| 9 | wsjnwnewfn | null | null | false | false |
| 10 | i need a gift for my wife | null | null | false | false |
| 11 | something cheap for my kitchen | kitchen-accessories | null | false | **true** |
| 12 | affordable laptops | laptops | null | false | **true** |

## Decisions recorded here on purpose

**"under 20" returns `maxPrice: 20`, and the filter uses `<=`.** So an item costing exactly
$20.00 is shown. Strictly, "under 20" means less than 20 — this is a deliberate choice to
match how shoppers actually read it, not an off-by-one bug.

**Gibberish is `unavailable: false`, not true.** `unavailable` means "we don't sell that kind
of product". Gibberish isn't a product we lack — it's no request at all. The two states get
different messages: "We don't carry anything like that" vs "No filters applied".

**The model must never invent a price.** Row 11 originally returned `maxPrice: 50` — a number
nobody supplied. The prompt now forbids inventing one and sets `needsPrice` instead, so the
user is asked for their own figure.

## Known gaps

- Run by hand. A script that hits all twelve and diffs against this table is the next step.
- Only one category per query — "cheap laptops and tablets" can't be expressed.
- No check on how *sensible* results are, only that the filter object is correct.