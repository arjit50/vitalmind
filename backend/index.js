import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dbConnect from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import chatRouter from "./routes/chat.routes.js"
import userRouter from "./routes/user.routes.js"
import analysisRouter from "./routes/analysis.routes.js"

const app = express()

// Database connection
dbConnect()

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRouter)
app.use('/api/chat', chatRouter)
app.use('/api/user', userRouter)
app.use('/api/analysis', analysisRouter)

app.get('/', (req, res) => {
    // res.send("VitalMind API is running")
})


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
