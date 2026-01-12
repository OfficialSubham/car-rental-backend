import dotenv from "dotenv";
import { verify } from "jsonwebtoken";
import { NextFunction, Request, response, Response } from "express";
dotenv.config();

interface Req extends Request {
  user: {
    userId: number;
    username: string;
  };
}

const SECRET = process.env.JWT_SECRET || "";

export function userValid(req: Req, res: Response, next: NextFunction) {
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
    const user = verify(token, SECRET) as { userId: number; username: string };
    req.user = {
      userId: user.userId,
      username: user.username,
    };
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, error: "Token invalid" });
  }
}
