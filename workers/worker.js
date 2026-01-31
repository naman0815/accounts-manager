/**
 * Cloudflare Worker to proxy requests to Hugging Face Inference API
 * 
 * Usage:
 * POST /
 * Body: { prompt: "..." }
 * Headers: Authorization: Bearer <HF_TOKEN> (Optional if hardcoded below)
 */

export default {
    async fetch(request, env, ctx) {
        // 1. Handle CORS Preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
            });
        }

        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        try {
            // Get Token from Request Header OR Environment Variable
            const authHeader = request.headers.get("Authorization");
            const token = authHeader ? authHeader.replace("Bearer ", "") : env.HF_TOKEN;

            if (!token) {
                return new Response(JSON.stringify({ error: "Missing Hugging Face Token" }), {
                    status: 401,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }

            // 2. Call Hugging Face API (OpenAI Compatible Endpoint)
            // The frontend now sends the full { model, messages, ... } body
            const requestBody = await request.json();

            const hfResponse = await fetch(
                `https://router.huggingface.co/v1/chat/completions`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!hfResponse.ok) {
                const errText = await hfResponse.text();
                return new Response(JSON.stringify({ error: `HF Error ${hfResponse.status}: ${errText}` }), {
                    status: hfResponse.status,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }

            const data = await hfResponse.json();

            // 3. Return Response
            return new Response(JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });

        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
    },
};
