import jwt from "jsonwebtoken";
import HttpError from "../model/errorModel.js";

// middleware para verificar se o usuario esta autenticado
// e decodificar o user ID e user Name do usuario logado no browser
export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new HttpError("Authentication required", 401));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.TOKEN);

    req.user = {
      id: decoded.id,
      name: decoded.name,
    };

    next();
  } catch (error) {
    console.error("JWT authentication error:", error.message);

    return next(new HttpError("Invalid or expired token", 401));
  }
}
