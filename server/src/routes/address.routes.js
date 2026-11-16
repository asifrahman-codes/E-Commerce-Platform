import { Router } from "express";

import {
    listAddresses,
    getAddress,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress
} from "../controllers/address.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
    createAddressSchema,
    updateAddressSchema
} from "../validations/address.validation.js";

const router = Router();

// Every address route is scoped to the authenticated user.
router.use(authMiddleware);

router.get("/", listAddresses);
router.post("/", validate(createAddressSchema), createAddress);

router.get("/:addressId", getAddress);
router.patch("/:addressId", validate(updateAddressSchema), updateAddress);
router.patch("/:addressId/default", setDefaultAddress);
router.delete("/:addressId", deleteAddress);

export default router;
