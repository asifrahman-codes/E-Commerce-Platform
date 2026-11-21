import asyncHandler from "../utils/asyncHandler.js";
import * as supportTicketService from "../services/support-ticket.service.js";

function success(res, data, message = "Success", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export const createTicket = asyncHandler(async (req, res) =>
  success(
    res,
    await supportTicketService.createSupportTicket(
      req.user.user_id,
      req.body
    ),
    "Support ticket created.",
    201
  )
);

export const listMyTickets = asyncHandler(async (req, res) =>
  success(
    res,
    await supportTicketService.getCustomerTickets(
      req.user.user_id,
      req.query
    )
  )
);

export const getMyTicket = asyncHandler(async (req, res) =>
  success(
    res,
    await supportTicketService.getCustomerTicket(
      req.user.user_id,
      req.params.ticketId,
      req.query
    )
  )
);

export const replyAsCustomer = asyncHandler(async (req, res) =>
  success(
    res,
    await supportTicketService.replyAsCustomer(
      req.user.user_id,
      req.params.ticketId,
      req.body.message
    ),
    "Reply added.",
    201
  )
);

export const listAdminTickets = asyncHandler(async (req, res) =>
  success(res, await supportTicketService.getAdminTickets(req.query))
);

export const getAdminTicket = asyncHandler(async (req, res) =>
  success(
    res,
    await supportTicketService.getAdminTicket(
      req.params.ticketId,
      req.query
    )
  )
);

export const replyAsAdmin = asyncHandler(async (req, res) =>
  success(
    res,
    await supportTicketService.replyAsAdmin(
      req.user.user_id,
      req.params.ticketId,
      req.body.message
    ),
    "Reply sent.",
    201
  )
);

export const updateAdminTicket = asyncHandler(async (req, res) =>
  success(
    res,
    await supportTicketService.updateAdminTicket(
      req.user.user_id,
      req.params.ticketId,
      req.body
    ),
    "Ticket updated."
  )
);

export const assignTicketToMe = asyncHandler(async (req, res) =>
  success(
    res,
    await supportTicketService.assignTicketToAdmin(
      req.user.user_id,
      req.params.ticketId
    ),
    "Ticket assigned to you."
  )
);
