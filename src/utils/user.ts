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

export async function loginUser(username: string) {
  const { rows } = await pool.query(
    `
    SELECT id, password FROM users WHERE username = $1
    `,
    [username]
  );
  return rows;
}
