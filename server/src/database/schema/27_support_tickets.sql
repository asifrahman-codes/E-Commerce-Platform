CREATE TABLE support_tickets (
    ticket_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    assigned_admin_id INT DEFAULT NULL,
    subject VARCHAR(180) NOT NULL,
    category ENUM(
        'ORDER', 'PAYMENT', 'SHIPPING', 'RETURNS', 'PRODUCT', 'ACCOUNT', 'OTHER'
    ) NOT NULL,
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')
        NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_support_ticket_customer
        FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_support_ticket_assignee
        FOREIGN KEY (assigned_admin_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_support_tickets_customer_updated
    ON support_tickets(customer_id, updated_at, ticket_id);
CREATE INDEX idx_support_tickets_status_priority
    ON support_tickets(status, priority, updated_at, ticket_id);
CREATE INDEX idx_support_tickets_category_status
    ON support_tickets(category, status, updated_at);
CREATE INDEX idx_support_tickets_assignee
    ON support_tickets(assigned_admin_id, status, updated_at);

CREATE TABLE support_ticket_messages (
    message_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT UNSIGNED NOT NULL,
    sender_id INT DEFAULT NULL,
    sender_role ENUM('CUSTOMER', 'ADMIN') NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_support_message_ticket
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
    CONSTRAINT fk_support_message_sender
        FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_support_messages_ticket_created
    ON support_ticket_messages(ticket_id, created_at, message_id);
