import HttpError from "../model/errorModel.js";
import User from "../model/userModel.js";
import Analyst from "../model/analystModel.js";
import Manager from "../model/managerModel.js";
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
    const { name, email, psw, cpf, department, phone, last_name, profile_img } =
      req.body;
    const newEmail = email.trim().toLowerCase();

    // Validate registration data in validateRegisterUser middleware.

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

    // Create user
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

    // Handle MongoDB duplicate-key errors
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
    const { name, email, cpf, psw, psw2, last_name, profile_img } = req.body;
    const newEmail = email.trim().toLowerCase();

    // Validate registration data in validateRegisterAnalyst middleware.

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
    });

    await newAnalyst.save();

    res.status(201).json(`New Analyst ${newAnalyst.email} registered!`);
  } catch (error) {
    console.error("Analyst Registration error:", error);

    return next(new HttpError("Analyst registration failed", 422));
  }
}

// POST /api/auth/register_manager
export async function registerManager(req, res, next) {
  try {
    const {
      name,
      email,
      cpf,
      psw,
      last_name,
      profile_img,
      filter,
      psw2,
      team_id,
    } = req.body;
    const newEmail = email.trim().toLowerCase();

    // Validate registration data in validateRegisterManager middleware.

    // Generate deterministic HMACs for duplicate detection
    const cpfHash = hashSensitiveData(cpf);

    const existingSensitiveData = await Manager.findOne({
      cpf: cpfHash,
    }).select("_id cpfHash");

    if (existingSensitiveData) {
      if (existingSensitiveData.cpfHash === cpfHash) {
        return next(new HttpError("CPF already exists", 409));
      }
    }

    // Encrypt CPF and phone using AES-256-GCM
    const cpfEncrypted = encryptSensitiveData(cpf);

    // psw security logic
    // all must be of type String
    const psw_salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(psw, psw_salt);

    const newManager = new Manager({
      name,
      email: newEmail,
      cpf: cpfEncrypted,
      cpfHash,
      psw: hashedPassword,
      last_name,
      profile_img,
      filter,
      team_id,
    });

    await newManager.save();

    res.status(201).json(`New Manager ${newManager.email} registered!`);
  } catch (error) {
    console.error("Manager Registration error:", error);

    // MongoDB duplicate-key error (e.g. concurrent registrations)
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern || {})[0];

      const messages = {
        email: "Email already exists",
        cpfHash: "CPF already exists",
      };

      return next(
        new HttpError(
          messages[duplicatedField] || "A unique field already exists",
          409,
        ),
      );
    }

    return next(new HttpError("Manager registration failed", 422));
  }
}

// POST /api/auth/login

export async function loginUser(req, res, next) {
  try {
    const { email, psw } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof psw !== "string" ||
      !psw
    ) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const newEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: newEmail });
    const analyst = await Analyst.findOne({ email: newEmail });
    const manager = await Manager.findOne({ email: newEmail });

    if (!user && !analyst && !manager) {
      return next(new HttpError("Invalid email or password", 401));
    }

    // Identify the account and its role
    let account;
    let role;

    if (user) {
      account = user;
      role = "user";
    } else if (analyst) {
      account = analyst;
      role = "analyst";
    } else {
      account = manager;
      role = "manager";
    }

    // Validate password
    const comparePsw = await bcrypt.compare(psw, account.psw);

    if (!comparePsw) {
      return next(new HttpError("Invalid email or password", 401));
    }

    // Generate JWT with role
    const id = account._id.toString();
    const name = account.name;

    const token = jwt.sign(
      {
        id,
        name,
        role,
      },
      process.env.TOKEN,
      {
        expiresIn: "1d",
      },
    );

    return res.status(200).json({
      token,
      id,
      name,
      role,
    });
  } catch (error) {
    console.error("Login error:", error);

    return next(new HttpError("Login failed", 500));
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
