import mongoose from "mongoose";

const analystSchema = new mongoose.Schema({
  profile_img: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
  },
  psw: {
    type: String,
    required: true,
  },
  filter: {
    type: Object,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
});

const Analyst = mongoose.model("Analyst", analystSchema);

export default Analyst;
