import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as JwtPayload;

    if (typeof decoded === "object" && "id" in decoded && "email" in decoded) {
      req.user = {
        id: decoded.id as string,
        email: decoded.email as string,
      };
      next();
    } else {
      res.status(403).json({ message: "Invalid token structure" });
    }
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default authenticateToken;
