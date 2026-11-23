
import { generateAIResponse } from "./ai.service.js";

import {
    getAdminBusinessContext,
} from "./ai-admin-context.service.js";

const ADMIN_SYSTEM_PROMPT = `
You are ShopSphere AI Admin Assistant.

You are an intelligent business analyst for an e-commerce platform.

You help administrators understand:

- Sales performance
- Revenue trends
- Orders
- Customers
- Inventory
- Product performance
- Business opportunities
- Marketing opportunities

IMPORTANT RULES:

1. Use the supplied business data.
2. Never invent statistics.
3. Clearly identify missing information.
4. Explain findings in simple language.
5. Provide actionable recommendations.
6. Distinguish facts from predictions.
7. Never expose private customer information.
8. Never generate SQL.
9. Never modify database records.
10. Never claim that an action was completed.
11. Do not assume that order value equals collected revenue.
12. Respect payment status when discussing revenue.

Use readable Markdown.

When appropriate, organize your answer using:
- Business overview
- Important findings
- Potential risks
- Recommendations
- Priority actions
`;

export async function processAdminMessage({
    message,
    history = [],
}) {

    if (
        typeof message !== "string" ||
        !message.trim()
    ) {
        throw new Error("ADMIN_MESSAGE_REQUIRED");
    }

    const context = await getAdminBusinessContext();

    const conversation = history
        .slice(-6)
        .map(item => {

            return `${item.role}: ${item.content}`;

        })
        .join("\n");

    const prompt = `
CURRENT BUSINESS DATA:

${JSON.stringify(context, null, 2)}

RECENT CONVERSATION:

${conversation}

ADMIN QUESTION:

${message.trim()}

Answer the administrator using the actual business data.

Provide specific recommendations whenever possible.
`;

    let response;

    try {
        response = await generateAIResponse({
            prompt,
            systemInstruction: ADMIN_SYSTEM_PROMPT,
            temperature: 0.4,
        });
    } catch (error) {
        const overview = context.overview || {};
        const inventory = context.inventory?.statistics || {};
        const sales = Array.isArray(context.sales_analytics)
            ? context.sales_analytics
            : [];

        const latestSales = sales
            .slice(-7)
            .reduce(
                (total, item) => total + Number(item.revenue || item.order_value || 0),
                0
            );

        response =
            "## Business overview\n" +
            `- Total orders: ${Number(overview.total_orders || 0)}\n` +
            `- Delivered orders: ${Number(overview.delivered_orders || 0)}\n` +
            `- Paid revenue: ${Number(overview.total_revenue || 0)}\n` +
            `- Customers: ${Number(overview.total_customers || 0)}\n` +
            `- Low-stock variants: ${Number(inventory.low_stock || overview.low_stock_variants || 0)}\n\n` +
            "## Provider status\n" +
            "The AI provider is temporarily unavailable. The figures above are retrieved directly from ShopSphere analytics.\n\n" +
            "## Suggested next actions\n" +
            "- Review low-stock variants and restocking priorities.\n" +
            "- Review recent sales trends before changing inventory.\n" +
            "- Investigate cancelled or pending orders in the order dashboard.";

        if (Number.isFinite(latestSales)) {
            response += `\n\nThe available latest-sales rows show ${latestSales} in recorded revenue/order value.`;
        }
    }

    return {

        response,

        data_timestamp: context.generated_at,

        context_sections: [
            "business_overview",
            "sales_analytics",
            "orders",
            "customers",
            "inventory",
            "product_performance",
        ],

    };

}
