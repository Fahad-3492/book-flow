const { pool } = require('../config/db');

// Public-facing list — only active services, customers should never see disabled ones.
async function findActiveServices() {
  const [rows] = await pool.query(
    `SELECT id, name, description, price, duration_minutes, created_at
     FROM services
     WHERE is_active = TRUE
     ORDER BY name ASC`
  );
  return rows;
}

// Admin list — includes inactive services so they can be re-enabled.
async function findAllServices() {
  const [rows] = await pool.query(
    `SELECT id, name, description, price, duration_minutes, is_active, created_at, updated_at
     FROM services
     ORDER BY created_at DESC`
  );
  return rows;
}

async function findServiceById(id) {
  const [rows] = await pool.query(
    `SELECT id, name, description, price, duration_minutes, is_active, created_at, updated_at
     FROM services
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function createService({ name, description, price, durationMinutes }) {
  const [result] = await pool.query(
    `INSERT INTO services (name, description, price, duration_minutes)
     VALUES (?, ?, ?, ?)`,
    [name, description || null, price, durationMinutes]
  );
  return findServiceById(result.insertId);
}

// Builds an UPDATE query using only the fields actually provided,
// so a partial update (e.g. just changing the price) doesn't wipe other fields.
async function updateService(id, fields) {
  const allowed = ['name', 'description', 'price', 'duration_minutes', 'is_active'];
  const setClauses = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (setClauses.length === 0) {
    return findServiceById(id); // nothing to update
  }

  values.push(id);
  await pool.query(`UPDATE services SET ${setClauses.join(', ')} WHERE id = ?`, values);
  return findServiceById(id);
}

// Soft delete by default (is_active = false) so existing bookings that
// reference this service via foreign key are never orphaned.
async function deactivateService(id) {
  await pool.query('UPDATE services SET is_active = FALSE WHERE id = ?', [id]);
  return findServiceById(id);
}

module.exports = {
  findActiveServices,
  findAllServices,
  findServiceById,
  createService,
  updateService,
  deactivateService,
};
