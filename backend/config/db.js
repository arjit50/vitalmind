import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected ✅");
    } catch (error) {
        console.error("DB error FULL:", error);
    }
};

export default dbConnect;