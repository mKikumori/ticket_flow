import jwt from "jsonwebtoken";
import HttpError from "../model/errorModel.js";

export function authMiddleware(req, res, next) {
  console.log("1. Middleware executed");

  try {
    const authHeader = req.headers.authorization;

    console.log("2. Authorization header exists:", !!authHeader);
    console.log("3. TOKEN exists:", !!process.env.TOKEN);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new HttpError("Authentication required", 401));
    }

    const token = authHeader.split(" ")[1];

    console.log("4. Token received:", !!token);
    console.log("Token parts:", token?.split(".").length);
    console.log("Token prefix:", token?.substring(0, 15));

    const decoded = jwt.verify(token, process.env.TOKEN);

    console.log("5. Token decoded:", decoded);

    req.user = {
      id: decoded.id,
      name: decoded.name,
    };

    console.log("6. Authenticated user:", req.user);

    next();
  } catch (error) {
    console.error("JWT authentication error:", error.message);

    return next(new HttpError("Invalid or expired token", 401));
  }
}
