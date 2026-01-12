import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { createUser, loginUser } from "./utils/user";
import { userValid } from "./middlewares/authMiddleware";
import { bookingSchema } from "./zod/bookSchema";
import { createBooking } from "./utils/booking";

const PORT = process.env.PORT || 3000;
const SALT = process.env.SALT || 10;
const JWT_SECRET = process.env.JWT_SECRET || "";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ success: true, data: { message: "Working fine" } });
});

app.post("/auth/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password)
      return res.status(400).json({
        success: false,
        error: "invalid inputs",
      });
    const hashPass = await hash(password, SALT);
    const userId = await createUser(username, hashPass);
    res.status(201).json({
      success: true,
      data: {
        message: "User created succesfully",
        userId,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(409).json({ success: false, error: "username already exists" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, error: "invalid inputs" });
  try {
    const user = await loginUser(username);

    const verify = await compare(password, user[0].password);
    if (!verify)
      return res
        .status(401)
        .json({ success: false, error: "incorrect password" });
    const token = sign({ userId: user[0].id, username }, JWT_SECRET);
    res.json({
      success: true,
      data: {
        message: "Login successful",
        token,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, error: "user does not  exist" });
  }
});

app.post("/bookings", userValid, async (req, res) => {
  const { carName, days, rentPerDay } = req.body;
  try {
    const { success } = bookingSchema.safeParse({ carName, days, rentPerDay });
    if (!success)
      return res.status(400).json({ success: false, error: "invalid inputs" });
    const { id } = await createBooking(
      carName,
      days,
      rentPerDay,
      req.user.userId
    );

    res.status(201).json({
      success: true,
      data: {
        message: "Booking created successfully",
        bookingId: id,
        totalCost: rentPerDay * days,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error: "invalid inputs" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening in port ${PORT}`);
});
