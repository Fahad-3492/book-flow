const {
  getAvailabilityForDay,
  getBookingsForDate,
  findBookingById,
  findBookingsByUser,
  findAllBookings,
  createBooking,
  updateBookingStatus,
  updateBookingPayment,
  getAllAvailability,
  setAvailability,
  deleteAvailability,
  getDashboardStats,
} = require('../models/bookingModel');
const { findServiceById } = require('../models/serviceModel');
const { timeToMinutes, generateAvailableSlots, isSlotAvailable } = require('../utils/slotCalculator');

// GET /api/bookings/available-slots?serviceId=1&date=2026-07-15
async function getAvailableSlots(req, res, next) {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({ error: 'serviceId and date query params are required.' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'date must be in YYYY-MM-DD format.' });
    }

    const service = await findServiceById(serviceId);
    if (!service || !service.is_active) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // JS Date's getDay(): 0=Sunday...6=Saturday — matches our day_of_week convention.
    // Parsed as UTC noon to avoid the date shifting by a day due to local timezone.
    const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();

    const availabilityWindows = await getAvailabilityForDay(dayOfWeek);
    const existingBookingsRaw = await getBookingsForDate(date);

    const existingBookings = existingBookingsRaw.map((b) => {
      const bookingDate = new Date(b.booking_datetime);
      const startMinutes = bookingDate.getUTCHours() * 60 + bookingDate.getUTCMinutes();
      return { startMinutes, durationMinutes: b.duration_minutes };
    });

    const slots = generateAvailableSlots({
      availabilityWindows,
      existingBookings,
      serviceDurationMinutes: service.duration_minutes,
    });

    res.json({ date, serviceId: service.id, slots });
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings  (authenticated customer)
async function createBookingHandler(req, res, next) {
  try {
    const { serviceId, date, time, notes } = req.body;
    const userId = req.user.id;

    const service = await findServiceById(serviceId);
    if (!service || !service.is_active) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();
    const availabilityWindows = await getAvailabilityForDay(dayOfWeek);

    if (availabilityWindows.length === 0) {
      return res.status(400).json({ error: 'No availability on this day.' });
    }

    const requestedStartMinutes = timeToMinutes(time);

    // Confirm the requested time actually falls inside a working window.
    const withinAWindow = availabilityWindows.some((w) => {
      const winStart = timeToMinutes(w.start_time);
      const winEnd = timeToMinutes(w.end_time);
      return (
        requestedStartMinutes >= winStart &&
        requestedStartMinutes + service.duration_minutes <= winEnd
      );
    });
    if (!withinAWindow) {
      return res.status(400).json({ error: 'Requested time is outside business hours.' });
    }

    // Re-check against live bookings right before insert — this is the
    // authoritative guard against double-booking; the slots list shown
    // to the user earlier could be stale by the time they submit.
    const existingBookingsRaw = await getBookingsForDate(date);
    const existingBookings = existingBookingsRaw.map((b) => {
      const bookingDate = new Date(b.booking_datetime);
      const startMinutes = bookingDate.getUTCHours() * 60 + bookingDate.getUTCMinutes();
      return { startMinutes, durationMinutes: b.duration_minutes };
    });

    const available = isSlotAvailable({
      requestedStartMinutes,
      serviceDurationMinutes: service.duration_minutes,
      existingBookings,
    });

    if (!available) {
      return res.status(409).json({ error: 'That time slot was just booked. Please pick another.' });
    }

    const bookingDatetime = `${date} ${time}:00`;
    const booking = await createBooking({ userId, serviceId, bookingDatetime, notes });

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/my  (authenticated customer — their own bookings)
async function getMyBookings(req, res, next) {
  try {
    const bookings = await findBookingsByUser(req.user.id);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/:id  (the booking's owner, or an admin)
async function getBooking(req, res, next) {
  try {
    const booking = await findBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have access to this booking.' });
    }
    res.json({ booking });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/bookings  (admin — all bookings)
async function listAllBookingsAdmin(req, res, next) {
  try {
    const bookings = await findAllBookings();
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/bookings/:id/status  (admin — confirm/cancel/complete)
async function updateBookingStatusAdmin(req, res, next) {
  try {
    const existing = await findBookingById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    const booking = await updateBookingStatus(req.params.id, req.body.status);
    res.json({ booking });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/availability  (admin — manage weekly working hours)
async function getAvailabilityAdmin(req, res, next) {
  try {
    const availability = await getAllAvailability();
    res.json({ availability });
  } catch (err) {
    next(err);
  }
}

async function setAvailabilityAdmin(req, res, next) {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    const entry = await setAvailability(dayOfWeek, startTime, endTime);
    res.status(201).json({ availability: entry });
  } catch (err) {
    next(err);
  }
}

async function deleteAvailabilityAdmin(req, res, next) {
  try {
    await deleteAvailability(req.params.id);
    res.json({ message: 'Availability window removed.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/stats  (admin — dashboard summary numbers)
async function getStatsAdmin(req, res, next) {
  try {
    const stats = await getDashboardStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAvailableSlots,
  createBookingHandler,
  getMyBookings,
  getBooking,
  listAllBookingsAdmin,
  updateBookingStatusAdmin,
  getAvailabilityAdmin,
  setAvailabilityAdmin,
  deleteAvailabilityAdmin,
  getStatsAdmin,
};
