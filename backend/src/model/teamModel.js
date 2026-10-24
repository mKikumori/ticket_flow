import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  analyst_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Analyst",
    required: true,
  },
  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manger",
    required: true,
  },
});

const Team = mongoose.model("Team", teamSchema);

export default Team;
