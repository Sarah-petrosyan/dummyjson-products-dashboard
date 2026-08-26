import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM = `You turn shopping requests into search filters.
Reply with ONLY a JSON object. No explanation, no markdown code fences.
Use exactly this shape: {"category": string or null, "maxPrice": number or null}
Use null for anything the request does not mention.`;

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

        return Response.json({ q, raw });
    },
};