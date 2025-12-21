import jwt from "jsonwebtoken";

export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated. Please login." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.log("Auth middleware error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
