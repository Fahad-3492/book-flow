const { pool } = require('../config/db');

// Returns the admin's working hours for one weekday (0=Sun ... 6=Sat).
// A business could have multiple windows in a day (e.g. 9-12 and 14-18),
// so this returns an array, not a single row.
async function getAvailabilityForDay(dayOfWeek) {
  const [rows] = await pool.query(
    'SELECT start_time, end_time FROM availability WHERE day_of_week = ? ORDER BY start_time ASC',
    [dayOfWeek]
  );
  return rows;
}

async function getAllAvailability() {
  const [rows] = await pool.query(
    'SELECT id, day_of_week, start_time, end_time FROM availability ORDER BY day_of_week ASC, start_time ASC'
  );
  return rows;
}

async function setAvailability(dayOfWeek, startTime, endTime) {
  const [result] = await pool.query(
    'INSERT INTO availability (day_of_week, start_time, end_time) VALUES (?, ?, ?)',
    [dayOfWeek, startTime, endTime]
  );
  return { id: result.insertId, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime };
}

async function deleteAvailability(id) {
  await pool.query('DELETE FROM availability WHERE id = ?', [id]);
}

// Returns all non-cancelled bookings that fall on the given calendar date,
// so we can check for overlaps before confirming a new one.
async function getBookingsForDate(dateStr) {
  const [rows] = await pool.query(
    `SELECT b.id, b.booking_datetime, s.duration_minutes
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     WHERE DATE(b.booking_datetime) = ?
       AND b.status != 'cancelled'`,
    [dateStr]
  );
  return rows;
}

async function findBookingById(id) {
  const [rows] = await pool.query(
    `SELECT b.id, b.user_id, b.service_id, b.booking_datetime, b.status, b.payment_status,
            b.stripe_payment_intent_id, b.notes, b.created_at,
            s.name AS service_name, s.price, s.duration_minutes,
            u.name AS customer_name, u.email AS customer_email
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     JOIN users u ON u.id = b.user_id
     WHERE b.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findBookingsByUser(userId) {
  const [rows] = await pool.query(
    `SELECT b.id, b.booking_datetime, b.status, b.payment_status, b.notes,
            s.name AS service_name, s.price, s.duration_minutes
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     WHERE b.user_id = ?
     ORDER BY b.booking_datetime DESC`,
    [userId]
  );
  return rows;
}

// Admin view — every booking, most recent first, with customer + service info joined in.
async function findAllBookings() {
  const [rows] = await pool.query(
    `SELECT b.id, b.user_id, b.service_id, b.booking_datetime, b.status, b.payment_status, b.notes,
            s.name AS service_name, s.price, s.duration_minutes,
            u.name AS customer_name, u.email AS customer_email
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     JOIN users u ON u.id = b.user_id
     ORDER BY b.booking_datetime DESC`
  );
  return rows;
}

async function createBooking({ userId, serviceId, bookingDatetime, notes }) {
  const [result] = await pool.query(
    `INSERT INTO bookings (user_id, service_id, booking_datetime, notes, status, payment_status)
     VALUES (?, ?, ?, ?, 'pending', 'unpaid')`,
    [userId, serviceId, bookingDatetime, notes || null]
  );
  return findBookingById(result.insertId);
}

async function updateBookingStatus(id, status) {
  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
  return findBookingById(id);
}

async function updateBookingPayment(id, paymentStatus, stripePaymentIntentId) {
  await pool.query(
    'UPDATE bookings SET payment_status = ?, stripe_payment_intent_id = ? WHERE id = ?',
    [paymentStatus, stripePaymentIntentId || null, id]
  );
  return findBookingById(id);
}

// Admin dashboard summary — total revenue from paid bookings, counts by
// status, and today's bookings. Computed with simple aggregate queries
// rather than pulling every row into JS and summing in memory.
async function getDashboardStats() {
  const [[revenueRow]] = await pool.query(
    `SELECT COALESCE(SUM(s.price), 0) AS total_revenue
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     WHERE b.payment_status = 'paid'`
  );

  const [statusRows] = await pool.query(
    `SELECT status, COUNT(*) AS count
     FROM bookings
     GROUP BY status`
  );

  const [[todayRow]] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM bookings
     WHERE DATE(booking_datetime) = CURDATE()
       AND status != 'cancelled'`
  );

  const statusCounts = { pending: 0, confirmed: 0, cancelled: 0, completed: 0 };
  for (const row of statusRows) {
    statusCounts[row.status] = row.count;
  }

  return {
    totalRevenue: Number(revenueRow.total_revenue),
    bookingsToday: todayRow.count,
    statusCounts,
  };
}

module.exports = {
  getAvailabilityForDay,
  getAllAvailability,
  setAvailability,
  deleteAvailability,
  getBookingsForDate,
  findBookingById,
  findBookingsByUser,
  findAllBookings,
  createBooking,
  updateBookingStatus,
  updateBookingPayment,
  getDashboardStats,
};
