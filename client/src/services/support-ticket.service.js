import api from "./api";
import API_ENDPOINTS from "./endpoints";

const payload = (response) =>
  response?.data?.data ?? response?.data ?? response;

export async function createSupportTicket(data) {
  return payload(await api.post(API_ENDPOINTS.SUPPORT.TICKETS, data));
}

export async function getMySupportTickets(params = {}) {
  return payload(await api.get(API_ENDPOINTS.SUPPORT.TICKETS, { params }));
}

export async function getMySupportTicket(ticketId, params = {}) {
  return payload(await api.get(API_ENDPOINTS.SUPPORT.TICKET(ticketId), { params }));
}

export async function replyToMySupportTicket(ticketId, message) {
  return payload(await api.post(
    API_ENDPOINTS.SUPPORT.TICKET_MESSAGES(ticketId),
    { message }
  ));
}

export async function getAdminSupportTickets(params = {}) {
  return payload(await api.get(API_ENDPOINTS.SUPPORT.ADMIN_TICKETS, { params }));
}

export async function getAdminSupportTicket(ticketId, params = {}) {
  return payload(await api.get(API_ENDPOINTS.SUPPORT.ADMIN_TICKET(ticketId), { params }));
}

export async function replyToSupportTicket(ticketId, message) {
  return payload(await api.post(
    API_ENDPOINTS.SUPPORT.ADMIN_MESSAGES(ticketId),
    { message }
  ));
}

export async function updateSupportTicket(ticketId, data) {
  return payload(await api.patch(
    API_ENDPOINTS.SUPPORT.ADMIN_UPDATE(ticketId),
    data
  ));
}

export async function assignSupportTicketToMe(ticketId) {
  return payload(await api.patch(
    API_ENDPOINTS.SUPPORT.ADMIN_ASSIGN_TO_ME(ticketId)
  ));
}
