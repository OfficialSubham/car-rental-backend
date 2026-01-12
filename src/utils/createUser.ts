import { pool } from "../db/db";

export async function createUser(username: string, password: string) {
  const { rows } = await pool.query(
    `
            INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id;
    `,
    [username, password]
  );
  return rows[0].id;
}
