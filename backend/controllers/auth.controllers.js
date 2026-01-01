import User from "../models/user.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


export const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        let user = await User.findOne({ email })

        if (user) return res.status(400).json({ message: "User already exists" })

        const hashedPass = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            username,
            email,
            password: hashedPass
        })


        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(201).json({ message: "User created successfully", user: { id: newUser._id, username: newUser.username, email: newUser.email } })

    }
    catch (error) {
        res.status(500).json({ message: error.message })
        console.log("signup error", error)
    }
}




export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ message: "All fields are required" })

        let user = await User.findOne({ email })

        if (!user) return res.status(400).json({ message: "User not found" })

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

        res.cookie('token', token, {
            httpOnly: true, //js cannot access this cookie
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({ message: "User logged in successfully", user: { id: user._id, username: user.username, email: user.email } })
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log("login error", error)
    }
}




export const logout = (req, res) => {
    try {
        res.clearCookie('token')
        return res.status(200).json({ message: "User logged out successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log("logout error", error)
    }
}