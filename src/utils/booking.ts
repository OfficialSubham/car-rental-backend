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

export async function updateBookingStatus(
  userId: number,
  status: string,
  bookingId: number
) {
  const { rows } = await pool.query(
    `
    UPDATE bookings SET status=$1 WHERE (id = $2 AND user_id = $3) RETURNING id, car_name, days, rent_per_day, status;
  `,
    [status, bookingId, userId]
  );
  return rows;
}

export async function updateBooking(
  userId: number,
  carName: string,
  days: number,
  rentPerDay: number,
  bookingId: number
) {
  const { rows } = await pool.query(
    `
    UPDATE bookings SET car_name=$1, days=$2, rent_per_day = $3  WHERE (id = $4 AND user_id = $5) RETURNING id, car_name, days, rent_per_day, status;
  `,
    [carName, days, rentPerDay, bookingId, userId]
  );
  return rows;
}

export async function isBookingExisted(bookingId: number) {
  const { rows } = await pool.query(
    `
    SELECT * FROM bookings WHERE id = $1;  
  `,
    [bookingId]
  );
  return rows;
}

export async function deleteBooking(bookingId: number, userId: number) {
  const { rows } = await pool.query(
    `
    DELETE FROM bookings WHERE (id = $1 AND user_id = $2) RETURNING id;
  `,
    [bookingId, userId]
  );

  return rows;
}
