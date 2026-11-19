import { Router } from "express";

import authMiddleware
    from "../middleware/auth.middleware.js";

import authorizeRoles
    from "../middleware/role.middleware.js";

import {
    getAdminDashboardController
} from "../controllers/admin.controller.js";


const router = Router();


/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
| GET /api/v1/admin/dashboard
|--------------------------------------------------------------------------
*/

router.get(
    "/dashboard",
    authMiddleware,
    authorizeRoles("ADMIN"),
    getAdminDashboardController
);


export default router;