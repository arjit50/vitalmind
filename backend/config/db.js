import mongoose from "mongoose";

const dbConnect = () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected")
    } catch (error) {
        console.log(error)
    }
}

export default dbConnect
