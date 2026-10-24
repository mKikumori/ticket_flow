import HttpError from "../model/errorModel.js";
import User from "../model/userModel.js";
import Analyst from "../model/analystModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
    const newEmail = email.toLowerCase();

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

    // Validar CPF: apenas números, máximo de 11 caracteres
    const cleanCPF = String(cpf);

    if (!/^\d{1,11}$/.test(cleanCPF)) {
      return next(
        new HttpError(
          "CPF must contain only numbers and at most 11 digits",
          422,
        ),
      );
    }

    // Validar Celular: apenas números, máximo de 11 caracteres
    const cleanPhone = String(phone);

    if (!/^\d{1,11}$/.test(cleanPhone)) {
      return next(
        new HttpError(
          "Phone must contain only numbers and at most 11 digits",
          422,
        ),
      );
    }

    // psw strength logic
    // exemplo: MySecurePassword123!
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

    // Validar senha
    if (psw != psw2) {
      return next(new HttpError("Passwords do not match", 422));
    }

    // psw, cpf and phone security logic
    // all must be of type String
    const psw_salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(psw, psw_salt);

    const cpf_salt = await bcrypt.genSalt(10);
    const hashedCPF = await bcrypt.hash(String(cpf), cpf_salt);

    const phone_salt = await bcrypt.genSalt(10);
    const hashedPhone = await bcrypt.hash(String(phone), phone_salt);

    const newUser = new User({
      name: name.trim(),
      email: newEmail,
      psw: hashedPassword,
      cpf: hashedCPF,
      department: department.trim(),
      phone: hashedPhone,
      last_name: last_name.trim(),
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
