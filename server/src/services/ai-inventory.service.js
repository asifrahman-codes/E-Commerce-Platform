
import {
    getLowStockVariants,
    getFastMovingProducts,
    getSlowMovingProducts,
    getInventoryStatistics,
} from "../repositories/ai-inventory.repository.js";

import { generateAIResponse } from "./ai.service.js";

const INVENTORY_SYSTEM_PROMPT = `
You are ShopSphere AI, an experienced e-commerce inventory analyst.

Analyze the supplied inventory data.

Your responsibilities:
1. Identify products at risk of stockout.
2. Identify fast-moving products.
3. Identify slow-moving products.
4. Suggest sensible restocking priorities.
5. Identify possible overstock situations.
6. Explain your recommendations clearly.

Rules:
- Use ONLY the supplied database information.
- Never invent stock quantities or sales figures.
- Never claim a product will run out on an exact date without
  sufficient historical data.
- Do not claim that inventory has been changed.
- Do not execute database operations.
- Clearly distinguish actual data from estimates.
- Give practical recommendations.
- Respond in readable Markdown.
`;

export async function getInventoryIntelligence() {

    const [
        statistics,
        lowStock,
        fastMoving,
        slowMoving,
    ] = await Promise.all([

        getInventoryStatistics(),

        getLowStockVariants(5),

        getFastMovingProducts(30),

        getSlowMovingProducts(30),

    ]);

    const inventoryData = {

        statistics,

        low_stock_products: lowStock,

        fast_moving_products: fastMoving,

        slow_moving_products: slowMoving,

    };

    const prompt = `
Analyze this actual ShopSphere inventory data.

INVENTORY DATA:

${JSON.stringify(inventoryData, null, 2)}

Provide:

1. Inventory health overview.
2. Critical stock warnings.
3. Fast-moving products.
4. Slow-moving products.
5. Restocking recommendations.
6. Products requiring attention.
7. Prioritized action plan.

For each restocking recommendation explain
why the product needs attention.

Do not invent supplier lead times or reorder quantities.
`;

    const analysis = await generateAIResponse({

        prompt,

        systemInstruction: INVENTORY_SYSTEM_PROMPT,

        temperature: 0.3,

    });

    return {

        statistics: {

            total_variants: Number(
                statistics.total_variants || 0
            ),

            total_stock: Number(
                statistics.total_stock || 0
            ),

            out_of_stock: Number(
                statistics.out_of_stock || 0
            ),

            low_stock: Number(
                statistics.low_stock || 0
            ),

            healthy_stock: Number(
                statistics.healthy_stock || 0
            ),

        },

        low_stock_products: lowStock,

        fast_moving_products: fastMoving,

        slow_moving_products: slowMoving,

        ai_analysis: analysis,

        generated_at: new Date().toISOString(),

    };
}
