import { pool } from "../db/db";

export async function createBooking(
  carName: string,
  days: number,
  rentPerDay: number,
  userId: number
) {
  const { rows } = await pool.query(
    `
        INSERT INTO bookings (car_name, days, rent_per_day, user_id) VALUES ($1, $2, $3, $4) RETURNING id;
    `,
    [carName, days, rentPerDay, userId]
  );
  return rows[0];
}

export async function getBookings(
  userId: number,
  bookingId: number,
  summary: boolean = false
) {
  if (summary) {
    const { rows } = await pool.query(
      `
        SELECT * FROM bookings WHERE (user_id = $1 AND (status = 'booked' OR status = 'completed'));
    `,
      [userId]
    );
    return rows;
  } else {
    const { rows } = await pool.query(
      `
      SELECT id, car_name, days, rent_per_day, status FROM bookings WHERE (id = $1 AND (status = 'booked' OR status = 'completed'));
    `,
      [bookingId]
    );
    return rows;
  }
}
