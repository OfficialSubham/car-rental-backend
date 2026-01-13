import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { createUser, loginUser } from "./utils/user";
import { userValid } from "./middlewares/authMiddleware";
import { bookingSchema, statusSchema } from "./zod/bookSchema";
import {
  createBooking,
  getBookings,
  isBookingExisted,
  updateBooking,
  updateBookingStatus,
} from "./utils/booking";

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

app.get("/bookings", userValid, async (req, res) => {
  const { bookingId, summary } = req.query;
  try {
    if (summary == "true") {
      const row = await getBookings(req.user.userId, Number(bookingId), true);
      let totalAmountSpent = 0;
      let totalBookings = 0;
      row.forEach((d) => {
        totalBookings++;
        totalAmountSpent += d.days * d.rent_per_day;
      });
      res.json({
        success: true,
        data: [
          {
            userId: req.user.userId,
            username: req.user.username,
            totalBookings,
            totalAmountSpent,
          },
        ],
      });
    } else {
      const row = await getBookings(req.user.userId, Number(bookingId));
      res.json({
        success: true,
        data: [{ ...row[0], totalCost: row[0].days * row[0].rent_per_day }],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: false, error: "bookingId not found" });
  }
});

app.put("/bookings/:bookingId", userValid, async (req, res) => {
  const { bookingId } = req.params;
  const isBookingIdValid = await isBookingExisted(Number(bookingId));
  if (isBookingIdValid.length == 0)
    return res.status(404).json({ success: false, error: "booking not found" });
  try {
    if (bookingSchema.safeParse(req.body).success) {
      const { carName, days, rentPerDay } = req.body;
      const row = await updateBooking(
        req.user.userId,
        carName,
        Number(days),
        Number(rentPerDay),
        Number(bookingId)
      );
      if (row.length === 0)
        return res
          .status(403)
          .json({ success: false, error: "booking does not belong to user" });
      res.json({
        success: true,
        data: {
          message: "Booking updated successfully",
          ...row[0],
          totalCost: row[0].days * row[0].rent_per_day,
        },
      });
    } else if (statusSchema.safeParse(req.body).success) {
      const row = await updateBookingStatus(
        req.user.userId,
        req.body.status,
        Number(bookingId)
      );
      if (!row.length)
        return res
          .status(403)
          .json({ success: false, error: "booking does not belong to user" });
      res.json({
        success: true,
        data: {
          message: "Booking updated successfully",
          ...row[0],
          totalCost: row[0].days * row[0].rent_per_day,
        },
      });
    } else {
      return res.status(400).json({ success: false, error: "invalid inputs" });
    }
  } catch (error) {
    console.log("DB Error", error);
    res.status(404).json({
      success: false,
      error: "booking not found",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening in port ${PORT}`);
});
