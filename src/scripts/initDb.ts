import { Client } from "pg";

const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "pass",
  database: "db",
  port: 5432,
});

//do begin check for type because
//it will give error if i create twice
//and if not exists not work in type creation

async function initDb() {
  try {
    await client.connect();
    console.log("Connected to db");
    const query = [
      `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
  `,
      `
        DO $$
        BEGIN
            IF NOT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'booking_status'
            ) THEN
            CREATE TYPE booking_status AS ENUM (
                'booked',
                'completed',
                'cancelled'
            );
            END IF;
        END $$;
  `,
      `
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id),
            car_name TEXT NOT NULL,
            days INT NOT NULL CHECK (days > 0),
            rent_per_day INT NOT NULL CHECK (rent_per_day > 0),
            status booking_status NOT NULL DEFAULT 'booked',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
  `,
    ];

    for (const q of query) {
      await client.query(q);
    }
  } catch (error) {
    console.error("DB init failed", error);
  } finally {
    console.log("hello");
    client.end();
  }
}

initDb();
