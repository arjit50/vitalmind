import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { analyzeMedicineImage } from "../utils/medicineVisionAgent.js";

/**
 * Handles medicine image upload and identification.
 */
export const uploadMedicineImage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;

        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const imageUrl = req.file.path; // Cloudinary URL

        const chat = await Chat.findOne({ _id: chatId, userId });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // 1. Create User Message with Image
        const userMessage = await Message.create({
            chatId,
            sender: "user",
            imageUrl,
            content: "Shared a medicine image for identification."
        });

        // 2. Analyze Image with Vision AI
        const analysis = await analyzeMedicineImage(imageUrl);

        // 3. Create AI Message with Identification Results
        let aiContent = "";
        if (analysis.error) {
            aiContent = analysis.error;
        } else {
            aiContent = `I have identified this medicine:
            
<b>Name</b>: ${analysis.name}
<b>Purpose</b>: ${analysis.purpose}
<b>How to use</b>: ${analysis.usage}
<b>When to take</b>: ${analysis.timing}
<b>Side Effects</b>: ${analysis.sideEffects}
<b>Safety Warnings</b>: ${analysis.safetyWarnings}`;
        }

        const aiMessage = await Message.create({
            chatId,
            sender: "ai",
            content: aiContent,
            medicineInfo: analysis.error ? undefined : analysis
        });

        // 4. Update title if it's the first message
        const messageCount = await Message.countDocuments({ chatId });
        if (messageCount <= 2 && !analysis.error) {
            await Chat.findByIdAndUpdate(chatId, { title: analysis.name });
        }

        res.status(200).json({ userMessage, aiMessage });
    } catch (error) {
        console.error("Image upload error:", error);
        res.status(500).json({ message: error.message });
    }
};
