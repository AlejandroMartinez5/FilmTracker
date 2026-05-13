const { pool } = require("../config/db");

const create = async ({
  recipientAuthId,
  actorAuthId = null,
  type,
  title,
  body,
  metadata = {}
}) => {
  const query = `
    INSERT INTO notifications (
      recipient_auth_id,
      actor_auth_id,
      type,
      title,
      body,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const result = await pool.query(query, [
    recipientAuthId,
    actorAuthId,
    type,
    title,
    body,
    JSON.stringify(metadata)
  ]);

  return result.rows[0];
};

const countByRecipient = async (authId, filters = {}) => {
  const values = [authId];
  const conditions = ["recipient_auth_id = $1"];

  if (filters.status === "unread") {
    conditions.push("read_at IS NULL");
  }

  if (filters.status === "read") {
    conditions.push("read_at IS NOT NULL");
  }

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }

  const query = `
    SELECT COUNT(*) AS total
    FROM notifications
    WHERE ${conditions.join(" AND ")}
  `;

  const result = await pool.query(query, values);
  return Number(result.rows[0].total);
};

const findByRecipient = async (authId, filters, { limit, offset }) => {
  const values = [authId];
  const conditions = ["recipient_auth_id = $1"];

  if (filters.status === "unread") {
    conditions.push("read_at IS NULL");
  }

  if (filters.status === "read") {
    conditions.push("read_at IS NOT NULL");
  }

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }

  values.push(limit, offset);

  const query = `
    SELECT *
    FROM notifications
    WHERE ${conditions.join(" AND ")}
    ORDER BY created_at DESC
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

const countUnread = async (authId) => {
  const query = `
    SELECT COUNT(*) AS total
    FROM notifications
    WHERE recipient_auth_id = $1 AND read_at IS NULL
  `;

  const result = await pool.query(query, [authId]);
  return Number(result.rows[0].total);
};

const findByIdForRecipient = async (notificationId, authId) => {
  const query = `
    SELECT *
    FROM notifications
    WHERE id = $1 AND recipient_auth_id = $2
  `;

  const result = await pool.query(query, [notificationId, authId]);
  return result.rows[0] || null;
};

const markAsRead = async (notificationId, authId) => {
  const query = `
    UPDATE notifications
    SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
    WHERE id = $1 AND recipient_auth_id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [notificationId, authId]);
  return result.rows[0] || null;
};

const markAllAsRead = async (authId) => {
  const query = `
    UPDATE notifications
    SET read_at = CURRENT_TIMESTAMP
    WHERE recipient_auth_id = $1 AND read_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, [authId]);
  return result.rows;
};

const remove = async (notificationId, authId) => {
  const query = `
    DELETE FROM notifications
    WHERE id = $1 AND recipient_auth_id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [notificationId, authId]);
  return result.rows[0] || null;
};

module.exports = {
  create,
  countByRecipient,
  findByRecipient,
  countUnread,
  findByIdForRecipient,
  markAsRead,
  markAllAsRead,
  remove
};
