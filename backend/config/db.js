import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected ✅");
    } catch (error) {
        console.log("DB error:", error);
    }
};

export default dbConnect;