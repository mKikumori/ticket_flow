import HttpError from "../model/errorModel.js";
import User from "../model/userModel.js";
import Analyst from "../model/analystModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// POST to register new user
// api/auth/register
export async function registerUser(req, res, next) {
  try {
    const { name, email, psw, cpf, department, phone, last_name, profile_img } =
      req.body;
    const newEmail = email.toLowerCase();

    if (
      !name ||
      !email ||
      !psw ||
      !cpf ||
      !department ||
      !phone ||
      !last_name
    ) {
      return next(new HttpError("Fill in all mandatory fields", 422));
    }

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email already exists", 422));
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

    // psw, cpf and phone security logic
    // all must be of type String
    const psw_salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(psw, psw_salt);

    const cpf_salt = await bcrypt.genSalt(10);
    const hashedCPF = await bcrypt.hash(cpf, cpf_salt);

    const phone_salt = await bcrypt.genSalt(10);
    const hashedPhone = await bcrypt.hash(phone, phone_salt);

    const newUser = new User({
      name,
      email: newEmail,
      psw: hashedPassword,
      cpf: hashedCPF,
      department,
      phone: hashedPhone,
      last_name,
      profile_img,
    });

    await newUser.save();

    res.status(201).json(`New User ${newUser.email} registered!`);
  } catch (error) {
    console.error("Registration error:", error);

    return next(new HttpError("User registration failed", 422));
  }
}

// POST /api/auth/register_analyst
export async function registerAnalyst(req, res, next) {
  try {
    const { name, email, psw, last_name, profile_img, filter } = req.body;
    const newEmail = email.toLowerCase();

    if (!name || !email || !psw || !last_name) {
      return next(new HttpError("Fill in all mandatory fields", 422));
    }

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email already exists", 422));
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

    if (analyst) {
      console.log("ANALYST: ", analyst);
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
