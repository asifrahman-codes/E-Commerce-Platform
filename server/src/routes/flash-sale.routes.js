import { Router } from "express";
import {
    listFlashSalesController
} from "../controllers/flash-sale.controller.js";

const router = Router();
router.get("/", listFlashSalesController);

export default router;
