import jwt from "jsonwebtoken";
import HttpError from "../model/errorModel.js";
import User from "../model/userModel.js";
import Analyst from "../model/analystModel.js";
import Manager from "../model/managerModel.js";

// middleware para verificar se o usuario esta autenticado
// e decodificar o user ID e user Name do usuario logado no browser
// e atribuir o role do usuario logado atualmente
const allowedRoles = ["manager", "user", "analyst"];

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new HttpError("Authentication required", 401));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.TOKEN);

    // Validate token payload
    if (!decoded.id || !allowedRoles.includes(decoded.role)) {
      return next(new HttpError("Invalid authentication token", 401));
    }

    // Store authenticated identity and role
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT authentication error:", error.message);

    return next(new HttpError("Invalid or expired token", 401));
  }
}

// autoriza rotas apenas para as roles permitidas
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError("Access denied", 403));
    }

    next();
  };
}

// middleware para verificar as informações do usuário ao registrar
export async function validateRegisterUser(req, res, next) {
  try {
    const { name, last_name, email, cpf, phone, psw, psw2 } = req.body;

    // Validate required fields and their types
    const requiredFields = {
      name,
      last_name,
      email,
      cpf,
      phone,
      psw,
      psw2,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (typeof value !== "string" || !value.trim()) {
        return next(
          new HttpError(`${field} is required and must be a string`, 422),
        );
      }
    }

    // Validate name and last name: letters only
    const nameRegex = /^\p{L}+$/u;

    if (!nameRegex.test(name.trim())) {
      return next(new HttpError("Name must contain only letters", 422));
    }

    if (!nameRegex.test(last_name.trim())) {
      return next(new HttpError("Last name must contain only letters", 422));
    }

    // Validate email format
    const newEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      return next(new HttpError("Invalid email format", 422));
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email: newEmail });

    if (emailExists) {
      return next(new HttpError("Email already exists", 422));
    }

    // Validate CPF: exactly 11 digits
    if (!/^\d{11}$/.test(cpf)) {
      return next(new HttpError("CPF must contain exactly 11 digits", 422));
    }

    // Validate phone: exactly 11 digits
    if (!/^\d{11}$/.test(phone)) {
      return next(new HttpError("Phone must contain exactly 11 digits", 422));
    }

    // Validate password length
    if (psw.length < 12) {
      return next(
        new HttpError("Password must have at least 12 characters", 422),
      );
    }

    if (psw.length > 128) {
      return next(
        new HttpError("Password must have at most 128 characters", 422),
      );
    }

    // Validate password strength
    // exep: MySecurePassword123!
    if (!/[a-z]/.test(psw)) {
      return next(
        new HttpError("Password must contain a lowercase letter", 422),
      );
    }

    if (!/[A-Z]/.test(psw)) {
      return next(
        new HttpError("Password must contain an uppercase letter", 422),
      );
    }

    if (!/[0-9]/.test(psw)) {
      return next(new HttpError("Password must contain a number", 422));
    }

    if (!/[^a-zA-Z0-9]/.test(psw)) {
      return next(
        new HttpError("Password must contain a special character", 422),
      );
    }

    // Validate password confirmation
    if (psw !== psw2) {
      return next(new HttpError("Passwords do not match", 422));
    }

    // Make normalized email available to the controller
    req.body.email = newEmail;

    next();
  } catch (error) {
    next(error);
  }
}
// middleware para verificar as informações do manager ao registrar
export async function validateRegisterManager(req, res, next) {
  try {
    // Fields allowed in the request
    const allowedFields = [
      "profile_img",
      "email",
      "cpf",
      "psw",
      "psw2",
      "name",
      "last_name",
      "filter",
      "team_id",
    ];

    // Reject invalid fields
    const receivedFields = Object.keys(req.body);

    const invalidFields = receivedFields.filter(
      (field) => !allowedFields.includes(field),
    );

    if (invalidFields.length > 0) {
      return next(
        new HttpError(`Invalid fields: ${invalidFields.join(", ")}`, 422),
      );
    }

    const { name, email, cpf, psw, psw2, last_name } = req.body;

    // Validate required fields and types
    const requiredFields = {
      name,
      email,
      cpf,
      psw,
      psw2,
      last_name,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (typeof value !== "string" || !value.trim()) {
        return next(
          new HttpError(`${field} is required and must be a string`, 422),
        );
      }
    }

    // Validate name and last name: letters only
    const nameRegex = /^\p{L}+$/u;

    if (!nameRegex.test(name.trim())) {
      return next(new HttpError("Name must contain only letters", 422));
    }

    if (!nameRegex.test(last_name.trim())) {
      return next(new HttpError("Last name must contain only letters", 422));
    }

    // Validate email format
    const newEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      return next(new HttpError("Invalid email format", 422));
    }

    // Check whether email already exists
    const emailExists = await Manager.findOne({
      email: newEmail,
    }).select("_id");

    if (emailExists) {
      return next(new HttpError("Email already exists", 409));
    }

    // Validate CPF: exactly 11 digits
    if (!/^\d{11}$/.test(cpf)) {
      return next(new HttpError("CPF must contain exactly 11 digits", 422));
    }

    // Validate password length
    if (psw.length < 12) {
      return next(
        new HttpError("Password must have at least 12 characters", 422),
      );
    }

    if (psw.length > 128) {
      return next(
        new HttpError("Password must have at most 128 characters", 422),
      );
    }

    // Validate password strength
    // exep: MySecurePassword123!
    if (!/[a-z]/.test(psw)) {
      return next(
        new HttpError("Password must contain a lowercase letter", 422),
      );
    }

    if (!/[A-Z]/.test(psw)) {
      return next(
        new HttpError("Password must contain an uppercase letter", 422),
      );
    }

    if (!/[0-9]/.test(psw)) {
      return next(new HttpError("Password must contain a number", 422));
    }

    if (!/[^a-zA-Z0-9]/.test(psw)) {
      return next(
        new HttpError("Password must contain a special character", 422),
      );
    }

    // Validate password confirmation
    if (psw !== psw2) {
      return next(new HttpError("Passwords do not match", 422));
    }

    // Pass normalized values to the controller
    req.body.email = newEmail;
    req.body.name = name.trim();
    req.body.last_name = last_name.trim();

    next();
  } catch (error) {
    next(error);
  }
}
// middleware para verificar as informações do analista ao registrar
export async function validateRegisterAnalyst(req, res, next) {
  try {
    // Fields allowed in the request
    const allowedFields = [
      "profile_img",
      "email",
      "psw",
      "psw2",
      "name",
      "last_name",
      "filter",
      "team_id",
    ];

    // Reject invalid fields
    const receivedFields = Object.keys(req.body);

    const invalidFields = receivedFields.filter(
      (field) => !allowedFields.includes(field),
    );

    if (invalidFields.length > 0) {
      return next(
        new HttpError(`Invalid fields: ${invalidFields.join(", ")}`, 422),
      );
    }

    const { name, email, cpf, psw, psw2, last_name, profile_img } = req.body;

    // Validate required fields and types
    const requiredFields = {
      name,
      email,
      psw,
      psw2,
      last_name,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (typeof value !== "string" || !value.trim()) {
        return next(
          new HttpError(`${field} is required and must be a string`, 422),
        );
      }
    }

    // Validate name and last name: letters only
    const nameRegex = /^\p{L}+$/u;

    if (!nameRegex.test(name.trim())) {
      return next(new HttpError("Name must contain only letters", 422));
    }

    if (!nameRegex.test(last_name.trim())) {
      return next(new HttpError("Last name must contain only letters", 422));
    }

    // Validate email format
    const newEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      return next(new HttpError("Invalid email format", 422));
    }

    // Check whether email already exists
    const emailExists = await Analyst.findOne({
      email: newEmail,
    }).select("_id");

    if (emailExists) {
      return next(new HttpError("Email already exists", 409));
    }

    // Validate password length
    if (psw.length < 12) {
      return next(
        new HttpError("Password must have at least 12 characters", 422),
      );
    }

    if (psw.length > 128) {
      return next(
        new HttpError("Password must have at most 128 characters", 422),
      );
    }

    // Validate password strength
    // exep: MySecurePassword123!
    if (!/[a-z]/.test(psw)) {
      return next(
        new HttpError("Password must contain a lowercase letter", 422),
      );
    }

    if (!/[A-Z]/.test(psw)) {
      return next(
        new HttpError("Password must contain an uppercase letter", 422),
      );
    }

    if (!/[0-9]/.test(psw)) {
      return next(new HttpError("Password must contain a number", 422));
    }

    if (!/[^a-zA-Z0-9]/.test(psw)) {
      return next(
        new HttpError("Password must contain a special character", 422),
      );
    }

    // Validate password confirmation
    if (psw !== psw2) {
      return next(new HttpError("Passwords do not match", 422));
    }

    // Pass normalized values to the controller
    req.body.email = newEmail;
    req.body.name = name.trim();
    req.body.last_name = last_name.trim();

    next();
  } catch (error) {
    next(error);
  }
}
