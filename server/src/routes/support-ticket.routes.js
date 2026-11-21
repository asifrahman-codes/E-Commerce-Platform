import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import * as controller from "../controllers/support-ticket.controller.js";
import {
    createSupportTicketSchema,
    supportMessageSchema,
    updateSupportTicketSchema
} from "../validations/support-ticket.validation.js";

const router = Router();

router.post(
    "/tickets",
    authenticate,
    validate(createSupportTicketSchema),
    controller.createTicket
);
router.get("/tickets", authenticate, controller.listMyTickets);
router.get("/tickets/:ticketId", authenticate, controller.getMyTicket);
router.post(
    "/tickets/:ticketId/messages",
    authenticate,
    validate(supportMessageSchema),
    controller.replyAsCustomer
);

router.get(
    "/admin/tickets",
    authenticate,
    authorize("admin"),
    controller.listAdminTickets
);
router.get(
    "/admin/tickets/:ticketId",
    authenticate,
    authorize("admin"),
    controller.getAdminTicket
);
router.post(
    "/admin/tickets/:ticketId/messages",
    authenticate,
    authorize("admin"),
    validate(supportMessageSchema),
    controller.replyAsAdmin
);
router.patch(
    "/admin/tickets/:ticketId",
    authenticate,
    authorize("admin"),
    validate(updateSupportTicketSchema),
    controller.updateAdminTicket
);
router.patch(
    "/admin/tickets/:ticketId/assign-to-me",
    authenticate,
    authorize("admin"),
    controller.assignTicketToMe
);

export default router;
