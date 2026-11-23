const OPENROUTER_URL =
    "https://openrouter.ai/api/v1/embeddings";

const MODEL =
    process.env.AI_EMBEDDING_MODEL ||
    "openai/text-embedding-3-small";

const DIMENSIONS = Number(
    process.env.AI_EMBEDDING_DIMENSIONS || 1536
);

export async function generateEmbeddings(input) {

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        const error = new Error(
            "OPENROUTER_API_KEY is missing."
        );

        error.statusCode = 503;
        throw error;
    }

    const texts = Array.isArray(input) ? input : [input];

    if (
        !texts.length ||
        texts.some(
            (text) =>
                typeof text !== "string" ||
                !text.trim()
        )
    ) {
        throw new Error("Invalid embedding input.");
    }

    let response;
    let result;
    for (let attempt = 0; attempt < 2; attempt++) {
        response = await fetch(OPENROUTER_URL, {
            method: "POST",

            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                model: MODEL,
                input: texts,
                dimensions: DIMENSIONS,
                encoding_format: "float",
            }),

            signal: AbortSignal.timeout(60000),
        });

        result = await response.json();
        if (response.ok) break;
        if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
            await new Promise((resolve) => setTimeout(resolve, 250));
            continue;
        }
        break;
    }

    if (!response.ok) {
        const error = new Error(
            result?.error?.message ||
            "OpenRouter embedding request failed."
        );

        error.statusCode =
            response.status === 429 ? 429 :
            response.status === 402 ? 402 :
            response.status === 401 ? 503 : 502;

        throw error;
    }

    if (
        !Array.isArray(result.data) ||
        result.data.length !== texts.length
    ) {
        throw new Error(
            "Invalid embedding response from OpenRouter."
        );
    }

    const embeddings = result.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);

    for (const embedding of embeddings) {
        if (
            !Array.isArray(embedding) ||
            embedding.length !== DIMENSIONS ||
            !embedding.every(Number.isFinite)
        ) {
            throw new Error(
                "Invalid embedding dimensions."
            );
        }
    }

    return embeddings;
}