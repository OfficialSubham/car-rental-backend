import dotenv from "dotenv";
import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
dotenv.config();

const SECRET = process.env.JWT_SECRET || "";

export function userValid(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization)
    return res
      .status(401)
      .json({ success: false, error: "Authorization header missing" });

  const token = authorization?.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ success: false, error: "Token missing after Bearer" });
  try {
    const user = verify(token, SECRET);
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, error: "Token invalid" });
  }
}
