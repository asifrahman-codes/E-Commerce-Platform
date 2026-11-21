import asyncHandler from "../utils/asyncHandler.js";
import * as productQaService from "../services/product-qa.service.js";

function success(res, data, message = "Success", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export const listProductQuestions = asyncHandler(async (req, res) =>
  success(
    res,
    await productQaService.getProductQuestions(
      req.params.productId,
      req.query
    )
  )
);

export const createProductQuestion = asyncHandler(async (req, res) =>
  success(
    res,
    await productQaService.createProductQuestion(
      req.user.user_id,
      req.params.productId,
      req.body.question
    ),
    "Question submitted for moderation.",
    201
  )
);

export const listAdminQuestions = asyncHandler(async (req, res) =>
  success(
    res,
    await productQaService.getAdminProductQuestions(req.query)
  )
);

export const moderateQuestion = asyncHandler(async (req, res) =>
  success(
    res,
    await productQaService.moderateProductQuestion(
      req.user.user_id,
      req.params.questionId,
      req.body
    ),
    "Question moderation updated."
  )
);

export const answerQuestion = asyncHandler(async (req, res) =>
  success(
    res,
    await productQaService.answerProductQuestion(
      req.user.user_id,
      req.params.questionId,
      req.body.answer
    ),
    "Answer submitted for moderation.",
    201
  )
);

export const moderateAnswer = asyncHandler(async (req, res) =>
  success(
    res,
    await productQaService.moderateProductAnswer(
      req.user.user_id,
      req.params.answerId,
      req.body
    ),
    "Answer moderation updated."
  )
);

export const markAnswerUseful = asyncHandler(async (req, res) =>
  success(
    res,
    await productQaService.markAnswerUseful(
      req.user.user_id,
      req.params.answerId,
      req.method === "POST"
    )
  )
);
