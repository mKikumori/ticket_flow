import { Schema, model } from "mongoose";

const managerSchema = new mogoose.Schema({
  profile_img: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  cpf: {
    type: int,
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
    type: json,
  },
});

const Manager = mongoose.model("Manager", managerSchema);

export default Manager;
