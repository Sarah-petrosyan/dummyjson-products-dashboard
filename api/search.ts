import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();


const CATEGORIES = [
    "beauty", "fragrances", "furniture", "groceries", "home-decoration",
    "kitchen-accessories", "laptops", "mens-shirts", "mens-shoes", "mens-watches",
    "mobile-accessories", "motorcycle", "skin-care", "smartphones", "sports-accessories",
    "sunglasses", "tablets", "tops", "vehicle", "womens-bags", "womens-dresses",
    "womens-jewellery", "womens-shoes", "womens-watches",
];

const SYSTEM = `You turn shopping requests into search filters.
Reply with ONLY a JSON object. No explanation, no markdown code fences.
Shape: {"category": string or null, "maxPrice": number or null, "unavailable": true or false, "needsPrice": true or false}
"category" MUST be exactly one of these strings, or null if none fit:
${CATEGORIES.join(", ")}
Set "unavailable" to true ONLY when the request asks for a type of product that is not in that list at all (for example pet supplies, or car insurance). Otherwise set it to false.
"maxPrice" must come from a number the user actually typed. NEVER invent one.
Set "needsPrice" to true when the request implies a price limit (words like cheap, affordable, budget, expensive) but gives no number. Otherwise false.`;

export default {
    async fetch(request: Request) {

        const url = new URL(request.url);
        const q = url.searchParams.get("q") ?? "";

        const message = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 200,
            system: SYSTEM,
            messages: [{ role: "user", content: q }],
        });
        const block = message.content.find(b => b.type === "text");
        const raw = block && block.type === "text" ? block.text : "";

        const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();

        let parsed: any = {};
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            parsed = {};
        }

        const category = CATEGORIES.includes(parsed.category) ? parsed.category : null;
        const maxPrice = typeof parsed.maxPrice === "number" ? parsed.maxPrice : null;
        const unavailable = parsed.unavailable === true;
        const needsPrice = parsed.needsPrice === true;

        return Response.json({ q, category, maxPrice, unavailable, needsPrice });
    },
};