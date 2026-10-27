import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  profile_img: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
  },
  // CPF criptografado com AES-256-GCM
  cpf: {
    type: String,
    required: true,
  },

  // HMAC utilizado para verificar unicidade
  cpfHash: {
    type: String,
    required: true,
    unique: true,
  },
  psw: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    enum: [
      "Comercial",
      "Marketing",
      "Facilities",
      "Engenharia",
      "Financeiro",
      "Fiscal",
      "Legal",
    ],
    message: "{VALUE} is not supported",
    required: true,
  },
  // Telefone criptografado com AES-256-GCM
  phone: {
    type: String,
    default: undefined,
  },

  // HMAC utilizado para verificar unicidade
  phoneHash: {
    type: String,
    default: undefined,
  },
});

userSchema.index(
  { phoneHash: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phoneHash: { $type: "string" },
    },
  },
);

const User = mongoose.model("User", userSchema);

export default User;
