// Pure functions for slot math — no DB calls here, so this logic can be
// tested in isolation and reused by both the public booking flow and
// any future admin calendar view.

// Converts "HH:MM:SS" or "HH:MM" to minutes since midnight, for easy arithmetic.
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTimeStr(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Given the day's working windows (e.g. [{start_time:'09:00:00', end_time:'17:00:00'}])
// and a list of existing bookings (each with a start time + duration), returns
// an array of available slot start times (as "HH:MM" strings) for a service
// of the given duration.
function generateAvailableSlots({ availabilityWindows, existingBookings, serviceDurationMinutes, slotIntervalMinutes = 30 }) {
  if (!availabilityWindows || availabilityWindows.length === 0) {
    return []; // business isn't open this day at all
  }

  // Build a list of [start, end] minute ranges that are already taken.
  const busyRanges = existingBookings.map((b) => {
    const start = b.startMinutes;
    const end = start + b.durationMinutes;
    return [start, end];
  });

  const slots = [];

  for (const window of availabilityWindows) {
    const windowStart = timeToMinutes(window.start_time);
    const windowEnd = timeToMinutes(window.end_time);

    for (let candidateStart = windowStart; candidateStart + serviceDurationMinutes <= windowEnd; candidateStart += slotIntervalMinutes) {
      const candidateEnd = candidateStart + serviceDurationMinutes;

      const overlaps = busyRanges.some(([busyStart, busyEnd]) => {
        // Two ranges overlap unless one ends before the other starts.
        return candidateStart < busyEnd && candidateEnd > busyStart;
      });

      if (!overlaps) {
        slots.push(minutesToTimeStr(candidateStart));
      }
    }
  }

  return slots;
}

// Checks whether a specific requested start time conflicts with existing bookings.
// Used as the final server-side guard right before creating a booking, since the
// list of "available slots" shown to the user could be stale by the time they submit.
function isSlotAvailable({ requestedStartMinutes, serviceDurationMinutes, existingBookings }) {
  const requestedEnd = requestedStartMinutes + serviceDurationMinutes;
  return !existingBookings.some((b) => {
    const busyStart = b.startMinutes;
    const busyEnd = busyStart + b.durationMinutes;
    return requestedStartMinutes < busyEnd && requestedEnd > busyStart;
  });
}

module.exports = { timeToMinutes, minutesToTimeStr, generateAvailableSlots, isSlotAvailable };
