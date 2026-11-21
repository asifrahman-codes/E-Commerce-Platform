import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  connection: { execute: vi.fn() },
  lockQuestionSubmitter: vi.fn(),
  findActiveProduct: vi.fn(),
  countRecentQuestions: vi.fn(),
  insertQuestion: vi.fn(),
  createNotification: vi.fn(),
}));

vi.mock("../database/index.js", () => ({
  pool: { execute: vi.fn() },
}));
vi.mock("../utils/transaction.js", () => ({
  default: async (callback) => callback(m.connection),
}));
vi.mock("../repositories/product-qa.repository.js", () => ({
  lockQuestionSubmitter: m.lockQuestionSubmitter,
  findActiveProduct: m.findActiveProduct,
  countRecentQuestions: m.countRecentQuestions,
  insertQuestion: m.insertQuestion,
}));
vi.mock("../services/notification.service.js", () => ({
  createNotification: m.createNotification,
}));

import { createProductQuestion } from "../services/product-qa.service.js";

beforeEach(() => {
  vi.clearAllMocks();
  m.lockQuestionSubmitter.mockResolvedValue({ user_id: 5 });
  m.findActiveProduct.mockResolvedValue({ product_id: 2 });
  m.countRecentQuestions.mockResolvedValue(0);
  m.insertQuestion.mockResolvedValue(17);
});

describe("product questions", () => {
  it("creates a pending question without exposing customer details", async () => {
    await expect(createProductQuestion(5, 2, "Is this product waterproof?"))
      .resolves.toEqual({ question_id: 17, status: "PENDING" });

    expect(m.insertQuestion).toHaveBeenCalledWith(
      m.connection,
      expect.objectContaining({
        productId: 2,
        userId: 5,
        question: "Is this product waterproof?",
        questionHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    );
  });

  it("rejects contact details before persisting a public question", async () => {
    await expect(createProductQuestion(5, 2, "Email me at customer@example.com please"))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(m.insertQuestion).not.toHaveBeenCalled();
  });

  it("turns the database duplicate constraint into a conflict response", async () => {
    m.insertQuestion.mockRejectedValue({ code: "ER_DUP_ENTRY" });
    await expect(createProductQuestion(5, 2, "Is this product waterproof?"))
      .rejects.toMatchObject({ statusCode: 409 });
  });
});
