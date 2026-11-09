import mongoose from "mongoose";

const managerSchema = new mongoose.Schema({
  profile_img: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
  },
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
  filter: {
    type: Object,
    default: null,
  },
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
});

const Manager = mongoose.model("Manager", managerSchema);

export default Manager;
