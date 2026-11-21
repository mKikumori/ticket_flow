import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB CONNECTED SUCCESSFULY");
  } catch (error) {
    console.error("ERROR CONNECTING TO DB: ", error);
    process.exit(1); // Exit with failure
  }
};
