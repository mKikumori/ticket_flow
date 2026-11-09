import HttpError from "../model/errorModel.js";
import User from "../model/userModel.js";
import Analyst from "../model/analystModel.js";
import Manager from "../model/managerModel.js";
import {
  normalizeSensitiveData,
  encryptSensitiveData,
  decryptSensitiveData,
  hashSensitiveData,
} from "../utils/sensitiveData.js";

// GET the current logged in user
// GET /api/user/
export async function getUser(req, res, next) {
  try {
    const { id, role } = req.user;

    let account;

    switch (role) {
      case "user":
        account = await User.findById(id);
        break;

      case "analyst":
        account = await Analyst.findById(id);
        break;

      case "manager":
        account = await Manager.findById(id);
        break;

      default:
        return next(new HttpError("Invalid user", 403));
    }

    if (!account) {
      return next(new HttpError("User not found", 404));
    }

    const userData = {
      id: account._id,
      name: account.name,
      last_name: account.last_name,
      email: account.email,
      profile_img: account.profile_img,
      role,
    };

    // Additional fields for regular users
    if (role === "user") {
      userData.department = account.department;

      userData.phone = account.phone
        ? decryptSensitiveData(account.phone)
        : null;
    }

    return res.status(200).json(userData);
  } catch (error) {
    console.error("Error getting current logged in user:", error);

    return next(new HttpError("Error getting the current logged in user", 500));
  }
}

// PUT update the current logged in User
// PUT /api/user/
export async function updateUser(req, res, next) {
  try {
    const { id, role } = req.user;
    const { name, last_name, phone } = req.body;

    const modelsByRole = {
      user: User,
      analyst: Analyst,
      manager: Manager,
    };

    const Model = modelsByRole[role];

    if (!Model) {
      return res.status(403).json({
        message: "Tipo de conta inválido.",
      });
    }

    // Validação de nome e sobrenome
    if (
      typeof name !== "string" ||
      typeof last_name !== "string" ||
      !name.trim() ||
      !last_name.trim()
    ) {
      return res.status(400).json({
        message: "Nome e sobrenome são obrigatórios.",
      });
    }

    const nameRegex = /^[\p{L}\p{M}\s'-]+$/u;

    if (!nameRegex.test(name.trim()) || !nameRegex.test(last_name.trim())) {
      return res.status(400).json({
        message: "Nome ou sobrenome contém caracteres inválidos.",
      });
    }

    const updateData = {
      name: name.trim(),
      last_name: last_name.trim(),
    };

    // Somente usuários comuns podem atualizar o telefone.
    if (role === "user" && phone !== undefined) {
      const normalizedPhone = normalizeSensitiveData(phone);

      if (normalizedPhone.length !== 11) {
        return res.status(400).json({
          message: "O telefone deve conter 11 dígitos.",
        });
      }

      updateData.phone = encryptSensitiveData(normalizedPhone);
      updateData.phoneHash = hashSensitiveData(normalizedPhone);
    }

    const updatedAccount = await Model.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("-psw -cpf -cpfHash -phoneHash");

    if (!updatedAccount) {
      return res.status(404).json({
        message: "Conta não encontrada.",
      });
    }

    const responseData = {
      id: updatedAccount._id,
      name: updatedAccount.name,
      last_name: updatedAccount.last_name,
      email: updatedAccount.email,
      profile_img: updatedAccount.profile_img,
      role,
    };

    if (role === "user") {
      responseData.department = updatedAccount.department;

      responseData.phone = updatedAccount.phone
        ? decryptSensitiveData(updatedAccount.phone)
        : null;
    }

    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
}

// PATCH update the current User's profile picture
// PATCH /api/user/profile-picture
export async function updatePfp(req, res, next) {
  try {
    const { id, role } = req.user;
    const { profile_img } = req.body;

    const modelsByRole = {
      user: User,
      analyst: Analyst,
      manager: Manager,
    };

    const Model = modelsByRole[role];

    if (!Model) {
      return next(new HttpError("Invalid account type", 403));
    }

    if (!profile_img) {
      return next(new HttpError("Please choose an image", 422));
    }

    // Validate Base64 image format
    const imageRegex = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/;

    const match = profile_img.match(imageRegex);

    if (!match) {
      return next(new HttpError("Invalid image format", 422));
    }

    // Decode Base64 to calculate the original file size
    const imageBuffer = Buffer.from(match[2], "base64");

    // Maximum size: 500 KB
    if (imageBuffer.length > 500000) {
      return next(new HttpError("Profile picture too big", 422));
    }

    // Update profile picture
    const updatedAccount = await Model.findByIdAndUpdate(
      id,
      {
        $set: {
          profile_img,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("-psw -cpf -cpfHash -phoneHash");

    if (!updatedAccount) {
      return next(new HttpError("Avatar couldn't be changed", 422));
    }

    return res.status(200).json({
      profile_img: updatedAccount.profile_img,
    });
  } catch (error) {
    return next(error);
  }
}
