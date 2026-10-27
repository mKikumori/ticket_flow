import HttpError from "../model/errorModel.js";
import User from "../model/userModel.js";
import Analyst from "../model/analystModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  encryptSensitiveData,
  hashSensitiveData,
} from "../utils/sensitiveData.js";

// POST to register new user
// api/auth/register
export async function registerUser(req, res, next) {
  try {
    // Fields allowed in the request
    const allowedFields = [
      "profile_img",
      "email",
      "cpf",
      "psw",
      "psw2",
      "psw2",
      "name",
      "last_name",
      "department",
      "phone",
    ];

    // Reject requests containing invalid fields
    const receivedFields = Object.keys(req.body);

    const invalidFields = receivedFields.filter(
      (field) => !allowedFields.includes(field),
    );

    if (invalidFields.length > 0) {
      return next(
        new HttpError(`Invalid fields: ${invalidFields.join(", ")}`, 422),
      );
    }

    const {
      name,
      email,
      psw,
      cpf,
      department,
      phone,
      last_name,
      profile_img,
      psw2,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !psw ||
      !cpf ||
      !department ||
      !phone ||
      !last_name ||
      !psw2
    ) {
      return next(new HttpError("Fill in all mandatory fields", 422));
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
    const newEmail = email.toLowerCase();
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email already exists", 422));
    }

    if (!newEmail.includes("@")) {
      return next(new HttpError("Email must contain @", 422));
    }

    // Validate CPF: exactly 11 digits
    if (typeof cpf !== "string" || !/^\d{11}$/.test(cpf)) {
      return next(new HttpError("CPF must contain exactly 11 digits", 422));
    }

    // Validate phone: exactly 11 digits
    if (typeof phone !== "string" || !/^\d{11}$/.test(phone)) {
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
    // exemplo: MySecurePassword123!
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

    // Generate deterministic HMACs for duplicate detection
    const cpfHash = hashSensitiveData(cpf);
    const phoneHash = hashSensitiveData(phone);

    const existingSensitiveData = await User.findOne({
      $or: [{ cpfHash }, { phoneHash }],
    }).select("_id cpfHash phoneHash");

    if (existingSensitiveData) {
      if (existingSensitiveData.cpfHash === cpfHash) {
        return next(new HttpError("CPF already exists", 409));
      }

      if (existingSensitiveData.phoneHash === phoneHash) {
        return next(new HttpError("Phone already exists", 409));
      }
    }

    // Encrypt CPF and phone using AES-256-GCM
    const cpfEncrypted = encryptSensitiveData(cpf);
    const phoneEncrypted = encryptSensitiveData(phone);

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(psw, 12);

    // Create user with encrypted sensitive data and HMAC indexes
    const newUser = new User({
      name: name.trim(),
      last_name: last_name.trim(),
      email: newEmail,
      psw: hashedPassword,
      department: department.trim(),
      profile_img: profile_img || null,

      cpf: cpfEncrypted,
      cpfHash,

      phone: phoneEncrypted,
      phoneHash,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      id: newUser._id,
      email: newUser.email,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // MongoDB duplicate-key error (e.g. concurrent registrations)
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern || {})[0];

      const messages = {
        email: "Email already exists",
        cpfHash: "CPF already exists",
        phoneHash: "Phone already exists",
      };

      return next(
        new HttpError(
          messages[duplicatedField] || "A unique field already exists",
          409,
        ),
      );
    }

    return next(new HttpError("User registration failed", 500));
  }
}

// POST /api/auth/register_analyst
export async function registerAnalyst(req, res, next) {
  try {
    // Fields allowed in the request
    const allowedFields = [
      "profile_img",
      "email",
      "psw",
      "name",
      "last_name",
      "filter",
      "team_id",
    ];

    // Reject requests containing invalid fields
    const receivedFields = Object.keys(req.body);

    const invalidFields = receivedFields.filter(
      (field) => !allowedFields.includes(field),
    );

    if (invalidFields.length > 0) {
      return next(
        new HttpError(`Invalid fields: ${invalidFields.join(", ")}`, 422),
      );
    }

    const { name, email, psw, last_name, profile_img, filter, psw2 } = req.body;
    const newEmail = email.toLowerCase();

    if (!name || !email || !psw || !last_name || !psw2) {
      return next(new HttpError("Fill in all mandatory fields", 422));
    }

    // Validar nome e sobrenome: apenas letras
    const nameRegex = /^\p{L}+$/u;

    if (!nameRegex.test(name.trim())) {
      return next(new HttpError("Name must contain only letters", 422));
    }

    if (!nameRegex.test(last_name.trim())) {
      return next(new HttpError("Last name must contain only letters", 422));
    }

    // Validar se email ja existe e contem ""@""
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email already exists", 422));
    }

    if (!newEmail.includes("@")) {
      return next(new HttpError("Email must contain @", 422));
    }

    // psw strength logic
    // exep: MySecurePassword123!
    if (psw.length < 6) {
      return next(
        new HttpError("Password must have at least 12 characters", 422),
      );
    }

    if (psw.length > 128) {
      return next(
        new HttpError("Password must have at most 128 characters", 422),
      );
    }

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

    // Confirmar senha
    if (psw != psw2) {
      return next(new HttpError("Passwords do not match", 422));
    }

    // psw security logic
    // all must be of type String
    const psw_salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(psw, psw_salt);

    const newAnalyst = new Analyst({
      name,
      email: newEmail,
      psw: hashedPassword,
      last_name,
      profile_img,
      filter,
    });

    await newAnalyst.save();

    res.status(201).json(`New Analyst ${newAnalyst.email} registered!`);
  } catch (error) {
    console.error("Analyst Registration error:", error);

    return next(new HttpError("Analyst registration failed", 422));
  }
}

// POST /api/auth/login
export async function loginUser(req, res, next) {
  try {
    const { email, psw } = req.body;
    if (!email || !psw) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });
    const analyst = await Analyst.findOne({ email: newEmail });

    if (!user && !analyst) {
      return next(new HttpError("Invalid credantions", 422));
    }

    // se o email for encontrado na tabela User
    // faça o login de usuario
    if (user) {
      const comparePsw = await bcrypt.compare(psw, user.psw);
      if (!comparePsw) {
        return next(new HttpError("Invalid credantions", 422));
      }

      // login expire eta
      const { _id: id, name } = user;
      const token = jwt.sign({ id, name }, process.env.TOKEN, {
        expiresIn: "1d",
      });

      res.status(200).json({ token, id, name });
    }

    // se o email for encontrado na tabela Analyst
    // faça o login de usuario
    if (analyst) {
      const comparePsw = await bcrypt.compare(psw, analyst.psw);
      if (!comparePsw) {
        return next(new HttpError("Invalid credantions", 422));
      }

      // login expire eta
      const { _id: id, name } = analyst;
      const token = jwt.sign({ id, name }, process.env.TOKEN, {
        expiresIn: "1d",
      });

      res.status(200).json({ token, id, name });
    }
  } catch (error) {
    console.error("Login error:", error);

    return next(new HttpError("Login failed", 422));
  }
}

// POST /api/auth/login_analyst
/*export async function loginAnalyst(req, res, next) {
  try {
    const { email, psw } = req.body;
    if (!email || !psw) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const newEmail = email.toLowerCase();
    const analyst = await Analyst.findOne({ email: newEmail });

    if (!analyst) {
      return next(new HttpError("Invalid credantions", 422));
    }

    const comparePsw = await bcrypt.compare(psw, analyst.psw);
    if (!comparePsw) {
      return next(new HttpError("Invalid credantions", 422));
    }

    // login expire eta
    const { _id: id, name } = analyst;
    const token = jwt.sign({ id, name }, process.env.TOKEN, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, id, name });
  } catch (error) {
    console.error("Analyst Login error:", error);

    return next(new HttpError("Analyst Login failed", 422));
  }
}*/

// POST /api/auth/logout
export async function logout(req, res, next) {
  try {
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return next(new HttpError("Logout failed", 500));
  }
}
