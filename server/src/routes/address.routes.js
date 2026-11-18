import { Router } from "express";

import {
    getMyAddresses,
    createMyAddress,
    updateMyAddress,
    deleteMyAddress,
    setMyDefaultAddress,
} from "../controllers/address.controller.js";

// Replace with your existing authentication middleware.
import authenticate from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getMyAddresses);
router.post("/", createMyAddress);
router.patch("/:addressId", updateMyAddress);
router.delete("/:addressId", deleteMyAddress);
router.patch("/:addressId/default", setMyDefaultAddress);

export default router;