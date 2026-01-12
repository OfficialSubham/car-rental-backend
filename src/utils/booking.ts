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
