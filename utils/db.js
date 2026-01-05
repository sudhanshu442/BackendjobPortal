import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({}); // make sure this is here if .env is used

const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.DATABASE_URL,{
              useNewUrlParser: true,
  useUnifiedTopology: true,
        });
        console.log("Database connected");
    } catch (error) {
        console.log(error.message);
    }
}
export default connectDB;