export default {
    async fetch(request: Request) {
        return Response.json({ ok: true, message: "the function is alive" });
    },
};
