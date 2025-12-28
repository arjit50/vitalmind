import User from "../models/user.model.js";

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: error.message });
    }
};

// UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const updates = req.body;

        // Prevent password update from this endpoint for security
        delete updates.password;
        delete updates.email; // Usually require separate flow for email change
        delete updates.username; // Or allow it depending on requirements

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: error.message });
    }
};
