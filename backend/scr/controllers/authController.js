const HttpError = require("../model/errorModel");
const User = require("../model/userModel");
const bcrypt = require("bcryptjs");

// POST to register new user
// api/users/register
const registerUser = async (req, res, next) => {
  try {
  } catch (error) {
    return next(new HttpError("User registration failed", 422));
  }
};
