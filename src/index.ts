import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { pool } from "./db/db";
import { createUser } from "./utils/createUser";

const PORT = process.env.PORT || 3000;

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
    const userId = await createUser(username, password);
    res.json({
      success: true,
      data: {
        message: "User created succesfully",
        userId,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, error: "username already exists" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening in port ${PORT}`);
});
