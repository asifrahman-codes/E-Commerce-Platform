import { pool } from "../database/index.js";

export async function lockQuestionSubmitter(connection, userId) {
    const [rows] = await connection.execute(
        `SELECT user_id FROM users WHERE user_id = ? FOR UPDATE`,
        [userId]
    );
    return rows[0] ?? null;
}

export async function findActiveProduct(connection, productId) {
    const [rows] = await connection.execute(
        `SELECT product_id FROM products
         WHERE product_id = ? AND status = 'ACTIVE'
         LIMIT 1`,
        [productId]
    );
    return rows[0] ?? null;
}

export async function countRecentQuestions(connection, userId) {
    const [rows] = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM product_questions
         WHERE user_id = ?
           AND created_at >= UTC_TIMESTAMP() - INTERVAL 1 DAY`,
        [userId]
    );
    return Number(rows[0].total);
}

export async function insertQuestion(connection, {
    productId,
    userId,
    question,
    questionHash
}) {
    const [result] = await connection.execute(
        `INSERT INTO product_questions
            (product_id, user_id, question_text, question_hash)
         VALUES (?, ?, ?, ?)`,
        [productId, userId, question, questionHash]
    );
    return result.insertId;
}

export async function countApprovedQuestions(productId, connection = pool) {
    const [rows] = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM product_questions
         WHERE product_id = ? AND status = 'APPROVED'`,
        [productId]
    );
    return Number(rows[0].total);
}

export async function listApprovedQuestions(
    productId,
    { limit, offset },
    connection = pool
) {
    const safeLimit = Number.isSafeInteger(Number(limit))
        ? Math.min(Math.max(Number(limit), 1), 50)
        : 10;
    const safeOffset = Number.isSafeInteger(Number(offset))
        ? Math.max(Number(offset), 0)
        : 0;
    const [rows] = await connection.execute(
        `SELECT q.question_id, q.question_text, q.created_at,
                a.answer_id, a.answer_text, a.created_at AS answered_at,
                (SELECT COUNT(*) FROM product_answer_votes v
                 WHERE v.answer_id = a.answer_id) AS useful_count
         FROM product_questions q
         LEFT JOIN product_answers a
           ON a.question_id = q.question_id
          AND a.status = 'APPROVED'
         WHERE q.product_id = ?
           AND q.status = 'APPROVED'
         ORDER BY q.created_at DESC, q.question_id DESC
         LIMIT ${safeLimit} OFFSET ${safeOffset}`,
        [productId]
    );
    return rows;
}

export async function listAdminQuestions({
    status,
    search,
    limit,
    offset
}, connection = pool) {
    const conditions = [];
    const params = [];
    if (status) {
        conditions.push("q.status = ?");
        params.push(status);
    }
    if (search) {
        conditions.push("(q.question_text LIKE ? OR p.name LIKE ? OR a.answer_text LIKE ?)");
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const safeLimit = Number.isSafeInteger(Number(limit))
        ? Math.min(Math.max(Number(limit), 1), 100)
        : 10;
    const safeOffset = Number.isSafeInteger(Number(offset))
        ? Math.max(Number(offset), 0)
        : 0;
    const [rows] = await connection.execute(
        `SELECT q.question_id, q.product_id, q.user_id, q.question_text,
                q.status, q.created_at, q.moderation_reason,
                p.name AS product_name,
                a.answer_id, a.answer_text, a.status AS answer_status,
                a.moderation_reason AS answer_moderation_reason
         FROM product_questions q
         JOIN products p ON p.product_id = q.product_id
         LEFT JOIN product_answers a ON a.question_id = q.question_id
         ${where}
         ORDER BY q.created_at DESC, q.question_id DESC
         LIMIT ${safeLimit} OFFSET ${safeOffset}`,
        params
    );
    return rows;
}

export async function countAdminQuestions({ status, search }, connection = pool) {
    const conditions = [];
    const params = [];
    if (status) {
        conditions.push("q.status = ?");
        params.push(status);
    }
    if (search) {
        conditions.push("(q.question_text LIKE ? OR p.name LIKE ? OR a.answer_text LIKE ?)");
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM product_questions q
         JOIN products p ON p.product_id = q.product_id
         LEFT JOIN product_answers a ON a.question_id = q.question_id
         ${where}`,
        params
    );
    return Number(rows[0].total);
}

export async function findQuestionForUpdate(connection, questionId) {
    const [rows] = await connection.execute(
        `SELECT question_id, user_id, product_id, status
         FROM product_questions
         WHERE question_id = ?
         FOR UPDATE`,
        [questionId]
    );
    return rows[0] ?? null;
}

export async function findAnswerForQuestion(connection, questionId) {
    const [rows] = await connection.execute(
        `SELECT answer_id, status
         FROM product_answers
         WHERE question_id = ?
         LIMIT 1`,
        [questionId]
    );
    return rows[0] ?? null;
}

export async function moderateQuestion(connection, questionId, {
    status,
    adminId,
    reason
}) {
    const [result] = await connection.execute(
        `UPDATE product_questions
         SET status = ?, moderated_by = ?, moderated_at = UTC_TIMESTAMP(),
             moderation_reason = ?
         WHERE question_id = ?`,
        [status, adminId, reason || null, questionId]
    );
    return result.affectedRows > 0;
}

export async function upsertAnswer(connection, {
    questionId,
    adminId,
    answer
}) {
    const [result] = await connection.execute(
        `INSERT INTO product_answers
            (question_id, answered_by, answer_text, status)
         VALUES (?, ?, ?, 'PENDING')
         ON DUPLICATE KEY UPDATE
            answered_by = VALUES(answered_by),
            answer_text = VALUES(answer_text),
            status = 'PENDING',
            moderated_by = NULL,
            moderated_at = NULL,
            moderation_reason = NULL`,
        [questionId, adminId, answer]
    );
    return result.insertId;
}

export async function findAnswerForUpdate(connection, answerId) {
    const [rows] = await connection.execute(
        `SELECT a.answer_id, a.question_id, a.status AS answer_status,
                q.user_id, q.product_id, q.status AS question_status
         FROM product_answers a
         JOIN product_questions q ON q.question_id = a.question_id
         WHERE a.answer_id = ?
         FOR UPDATE`,
        [answerId]
    );
    return rows[0] ?? null;
}

export async function moderateAnswer(connection, answerId, {
    status,
    adminId,
    reason
}) {
    const [result] = await connection.execute(
        `UPDATE product_answers
         SET status = ?, moderated_by = ?, moderated_at = UTC_TIMESTAMP(),
             moderation_reason = ?
         WHERE answer_id = ?`,
        [status, adminId, reason || null, answerId]
    );
    return result.affectedRows > 0;
}

export async function findApprovedAnswer(connection, answerId) {
    const [rows] = await connection.execute(
        `SELECT a.answer_id
         FROM product_answers a
         JOIN product_questions q ON q.question_id = a.question_id
         WHERE a.answer_id = ?
           AND a.status = 'APPROVED'
           AND q.status = 'APPROVED'
         LIMIT 1`,
        [answerId]
    );
    return rows[0] ?? null;
}

export async function insertUsefulVote(connection, answerId, userId) {
    const [result] = await connection.execute(
        `INSERT IGNORE INTO product_answer_votes (answer_id, user_id)
         SELECT a.answer_id, ?
         FROM product_answers a
         JOIN product_questions q ON q.question_id = a.question_id
         WHERE a.answer_id = ?
           AND a.status = 'APPROVED'
           AND q.status = 'APPROVED'`,
        [userId, answerId]
    );
    return result.affectedRows > 0;
}

export async function deleteUsefulVote(connection, answerId, userId) {
    const [result] = await connection.execute(
        `DELETE v FROM product_answer_votes v
         JOIN product_answers a ON a.answer_id = v.answer_id
         JOIN product_questions q ON q.question_id = a.question_id
         WHERE v.answer_id = ? AND v.user_id = ?
           AND a.status = 'APPROVED' AND q.status = 'APPROVED'`,
        [answerId, userId]
    );
    return result.affectedRows > 0;
}

export async function countUsefulVotes(answerId, connection = pool) {
    const [rows] = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM product_answer_votes
         WHERE answer_id = ?`,
        [answerId]
    );
    return Number(rows[0].total);
}
