import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { hash } from "bcryptjs";
import { createUser } from "./utils/createUser";

const PORT = process.env.PORT || 3000;
const SALT = process.env.SALT || 10;

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

app.listen(PORT, () => {
  console.log(`Server is listening in port ${PORT}`);
});
