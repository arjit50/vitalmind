import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // Profile Fields
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
        default: ''
    },
    height: { // in cm
        type: Number
    },
    weight: { // in kg
        type: Number
    },
    bloodType: {
        type: String
    },
    allergies: {
        type: [String],
        default: []
    },
    medicalConditions: {
        type: [String],
        default: []
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    }
});

const User = mongoose.model("User", userSchema)

export default User
