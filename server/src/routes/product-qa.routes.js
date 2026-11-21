import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import * as controller from "../controllers/product-qa.controller.js";
import {
    answerProductQuestionSchema,
    createProductQuestionSchema,
    moderateProductAnswerSchema,
    moderateProductQuestionSchema
} from "../validations/product-qa.validation.js";

const router = Router();

router.get("/products/:productId/questions", controller.listProductQuestions);
router.post(
    "/products/:productId/questions",
    authenticate,
    validate(createProductQuestionSchema),
    controller.createProductQuestion
);

router.post(
    "/answers/:answerId/useful",
    authenticate,
    controller.markAnswerUseful
);
router.delete(
    "/answers/:answerId/useful",
    authenticate,
    controller.markAnswerUseful
);

router.get(
    "/admin/questions",
    authenticate,
    authorize("admin"),
    controller.listAdminQuestions
);
router.patch(
    "/admin/questions/:questionId/moderation",
    authenticate,
    authorize("admin"),
    validate(moderateProductQuestionSchema),
    controller.moderateQuestion
);
router.put(
    "/admin/questions/:questionId/answer",
    authenticate,
    authorize("admin"),
    validate(answerProductQuestionSchema),
    controller.answerQuestion
);
router.patch(
    "/admin/answers/:answerId/moderation",
    authenticate,
    authorize("admin"),
    validate(moderateProductAnswerSchema),
    controller.moderateAnswer
);

export default router;
