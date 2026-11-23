
import { generateAIResponse } from "./ai.service.js";

const CONTENT_INSTRUCTIONS = {

    product_description: `
Generate a professional e-commerce product description.

Include:
- Product introduction
- Main benefits
- Important features
- Customer value

Do not invent product specifications.
`,

    seo: `
Generate SEO content.

Return:
- SEO title
- Meta description
- Suggested keywords
- Search-friendly product description

Do not make unsupported product claims.
`,

    marketing: `
Create persuasive marketing content.

Include:
- Marketing headline
- Main selling points
- Target customer
- Call to action

Avoid misleading claims.
`,

    social_caption: `
Create engaging social media captions.

Return:
- Three caption variations
- Relevant hashtags
- Call to action
`,

    campaign: `
Create an e-commerce promotional campaign.

Include:
- Campaign name
- Campaign objective
- Target audience
- Promotional concept
- Suggested channels
- Suggested duration
- Success metrics

Do not invent actual sales results.
`,

};

export async function generateAIContent({
    type,
    product_name,
    details = "",
}) {

    const instruction = CONTENT_INSTRUCTIONS[type];

    if (!instruction) {
        throw new Error("INVALID_CONTENT_TYPE");
    }

    const prompt = `
TASK:

${instruction}

PRODUCT NAME:

${product_name || "General ShopSphere campaign"}

PRODUCT DETAILS:

${details || "No additional details supplied."}

Generate polished, practical content for ShopSphere.
`;

    const content = await generateAIResponse({

        prompt,

        systemInstruction: `
You are ShopSphere's professional e-commerce
copywriting and marketing assistant.

Write original, useful and accurate content.

Never invent product specifications, certifications,
discounts, warranties or product features.

Return well-formatted Markdown.
`,

        temperature: 0.7,

    });

    return {

        type,

        product_name: product_name || null,

        content,

        generated_at: new Date().toISOString(),

    };

}
