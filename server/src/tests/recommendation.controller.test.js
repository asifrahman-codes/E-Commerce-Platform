import { describe, expect, it, vi } from "vitest";

vi.mock("../services/recommendation.service.js", () => ({
  getPersonalizedRecommendations: vi.fn(),
}));

import * as recommendationService from "../services/recommendation.service.js";
import { getPersonalizedRecommendations } from "../controllers/recommendation.controller.js";

describe("recommendation controller", () => {
  it("scopes personalized recommendations to the authenticated user", async () => {
    recommendationService.getPersonalizedRecommendations
      .mockResolvedValue({ products: [] });
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    await getPersonalizedRecommendations(
      {
        user: { user_id: 29 },
        query: { user_id: "88", limit: "5" },
      },
      response,
      next
    );

    expect(recommendationService.getPersonalizedRecommendations)
      .toHaveBeenCalledWith(29, { limit: "5" });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });
});
