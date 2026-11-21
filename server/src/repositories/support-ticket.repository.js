import { pool } from "../database/index.js";

export async function insertTicket(connection, {
    customerId,
    subject,
    category,
    priority
}) {
    const [result] = await connection.execute(
        `INSERT INTO support_tickets
            (customer_id, subject, category, priority)
         VALUES (?, ?, ?, ?)`,
        [customerId, subject, category, priority]
    );
    return result.insertId;
}

export async function insertTicketMessage(connection, {
    ticketId,
    senderId,
    senderRole,
    message
}) {
    const [result] = await connection.execute(
        `INSERT INTO support_ticket_messages
            (ticket_id, sender_id, sender_role, message_text)
         VALUES (?, ?, ?, ?)`,
        [ticketId, senderId, senderRole, message]
    );
    await connection.execute(
        `UPDATE support_tickets
         SET updated_at = CURRENT_TIMESTAMP
         WHERE ticket_id = ?`,
        [ticketId]
    );
    return result.insertId;
}

export async function lockTicket(connection, ticketId) {
    const [rows] = await connection.execute(
        `SELECT ticket_id, customer_id, assigned_admin_id, status, priority
         FROM support_tickets
         WHERE ticket_id = ?
         FOR UPDATE`,
        [ticketId]
    );
    return rows[0] ?? null;
}

export async function getCustomerTicket(userId, ticketId, connection = pool) {
    const [rows] = await connection.execute(
        `SELECT ticket_id, subject, category, priority, status,
                created_at, updated_at
         FROM support_tickets
         WHERE ticket_id = ? AND customer_id = ?
         LIMIT 1`,
        [ticketId, userId]
    );
    return rows[0] ?? null;
}

export async function getAdminTicket(ticketId, connection = pool) {
    const [rows] = await connection.execute(
        `SELECT t.ticket_id, t.customer_id, t.assigned_admin_id, t.subject,
                t.category, t.priority, t.status, t.created_at, t.updated_at,
                CONCAT_WS(' ', c.first_name, c.last_name) AS customer_name,
                c.email AS customer_email,
                CONCAT_WS(' ', a.first_name, a.last_name) AS assignee_name
         FROM support_tickets t
         JOIN users c ON c.user_id = t.customer_id
         LEFT JOIN users a ON a.user_id = t.assigned_admin_id
         WHERE t.ticket_id = ?
         LIMIT 1`,
        [ticketId]
    );
    return rows[0] ?? null;
}

export async function countTicketMessages(ticketId, connection = pool) {
    const [rows] = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM support_ticket_messages
         WHERE ticket_id = ?`,
        [ticketId]
    );
    return Number(rows[0].total);
}

export async function listTicketMessages(ticketId, {
    limit,
    offset
}, connection = pool) {
    const [rows] = await connection.execute(
        `SELECT m.message_id, m.sender_role, m.message_text, m.created_at
         FROM support_ticket_messages m
         WHERE m.ticket_id = ?
         ORDER BY m.created_at DESC, m.message_id DESC
         LIMIT ? OFFSET ?`,
        [ticketId, limit, offset]
    );
    return rows.reverse();
}

function ticketFilters({ customerId, status, category, priority, search }) {
    const conditions = [];
    const params = [];
    if (customerId !== undefined) {
        conditions.push("t.customer_id = ?");
        params.push(customerId);
    }
    if (status) {
        conditions.push("t.status = ?");
        params.push(status);
    }
    if (category) {
        conditions.push("t.category = ?");
        params.push(category);
    }
    if (priority) {
        conditions.push("t.priority = ?");
        params.push(priority);
    }
    if (search) {
        const pattern = `%${search}%`;
        conditions.push(`(
            t.subject LIKE ? OR CAST(t.ticket_id AS CHAR) LIKE ?
            OR c.email LIKE ?
            OR CONCAT_WS(' ', c.first_name, c.last_name) LIKE ?
        )`);
        params.push(pattern, pattern, pattern, pattern);
    }
    return {
        where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
        params
    };
}

export async function listCustomerTickets(userId, filters, connection = pool) {
    const { where, params } = ticketFilters({
        ...filters,
        customerId: userId
    });
    const [rows] = await connection.execute(
        `SELECT t.ticket_id, t.subject, t.category, t.priority, t.status,
                t.created_at, t.updated_at,
                (SELECT m.message_text
                 FROM support_ticket_messages m
                 WHERE m.ticket_id = t.ticket_id
                 ORDER BY m.created_at DESC, m.message_id DESC
                 LIMIT 1) AS latest_message
         FROM support_tickets t
         JOIN users c ON c.user_id = t.customer_id
         ${where}
         ORDER BY t.updated_at DESC, t.ticket_id DESC
         LIMIT ? OFFSET ?`,
        [...params, filters.limit, filters.offset]
    );
    return rows;
}

export async function listAdminTickets(filters, connection = pool) {
    const { where, params } = ticketFilters(filters);
    const [rows] = await connection.execute(
        `SELECT t.ticket_id, t.customer_id, t.assigned_admin_id, t.subject,
                t.category, t.priority, t.status, t.created_at, t.updated_at,
                CONCAT_WS(' ', c.first_name, c.last_name) AS customer_name,
                c.email AS customer_email,
                CONCAT_WS(' ', a.first_name, a.last_name) AS assignee_name
         FROM support_tickets t
         JOIN users c ON c.user_id = t.customer_id
         LEFT JOIN users a ON a.user_id = t.assigned_admin_id
         ${where}
         ORDER BY FIELD(t.priority, 'URGENT', 'HIGH', 'NORMAL', 'LOW'),
                  t.updated_at DESC, t.ticket_id DESC
         LIMIT ? OFFSET ?`,
        [...params, filters.limit, filters.offset]
    );
    return rows;
}

export async function countTickets(filters, connection = pool) {
    const { where, params } = ticketFilters(filters);
    const [rows] = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM support_tickets t
         JOIN users c ON c.user_id = t.customer_id
         ${where}`,
        params
    );
    return Number(rows[0].total);
}

export async function updateTicket(connection, ticketId, {
    status,
    priority
}) {
    const assignments = [];
    const params = [];
    if (status !== undefined) {
        assignments.push("status = ?");
        params.push(status);
    }
    if (priority !== undefined) {
        assignments.push("priority = ?");
        params.push(priority);
    }
    if (!assignments.length) return;
    params.push(ticketId);
    await connection.execute(
        `UPDATE support_tickets SET ${assignments.join(", ")}
         WHERE ticket_id = ?`,
        params
    );
}

export async function assignTicket(connection, ticketId, adminId) {
    await connection.execute(
        `UPDATE support_tickets
         SET assigned_admin_id = ?
         WHERE ticket_id = ?`,
        [adminId, ticketId]
    );
}

export async function findActiveAdminIds(connection = pool) {
    const [rows] = await connection.execute(
        `SELECT u.user_id
         FROM users u
         JOIN roles r ON r.role_id = u.role_id
         WHERE LOWER(r.name) = 'admin' AND u.status = 'ACTIVE'
         ORDER BY u.user_id`
    );
    return rows.map((row) => row.user_id);
}
