
import { performSafetyCheck } from "../utils/safetyRules.js";
import { runMedicalAgent } from "../utils/medicalAgent.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";


export const createNewChat = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.userId;

        const newChat = await Chat.create({
            userId,
            title: title || "New Chat",
        });

        res.status(201).json({
            message: "Chat created successfully",
            chat: newChat,
        });
    } catch (error) {
        console.error("Create chat error:", error);
        res.status(500).json({ message: error.message });
    }
};



export const getChatHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const chats = await Chat.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({ chats });
    } catch (error) {
        console.error("Get chat history error:", error);
        res.status(500).json({ message: error.message });
    }
};



export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;

        const chat = await Chat.findOne({ _id: chatId, userId });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const messages = await Message.find({ chatId })
            .sort({ timestamp: 1 });

        res.status(200).json({ messages });
    } catch (error) {
        console.error("Get chat messages error:", error);
        res.status(500).json({ message: error.message });
    }
};


export const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const userId = req.userId;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Message content is required" });
        }

        // 1. Safety Check
        const safetyResult = performSafetyCheck(content);
        if (!safetyResult.isSafe) {
            return res.status(400).json({
                message: safetyResult.message,
                safetyViolation: true,
                type: safetyResult.type
            });
        }

        const chat = await Chat.findOne({ _id: chatId, userId });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // 2. Fetch History for Agent (BEFORE adding current message)
        const previousMessages = await Message.find({ chatId })
            .sort({ timestamp: -1 })
            .limit(10); 
        
        console.log(`[DB] Fetched ${previousMessages.length} previous messages for chat ${chatId}`);

        // Reverse to get chronological order
        const conversationHistory = previousMessages.reverse().map(msg => ({
            role: msg.sender,
            content: msg.content,
        }));

        // 3. Add current user message to DB
        console.log(`[DB] Creating user message: "${content.substring(0, 50)}..."`);
        const userMessage = await Message.create({
            chatId,
            sender: "user",
            content: content.trim(),
        });

        // 4. Run Medical Agent
        console.log(`[Agent] Calling runMedicalAgent with ${conversationHistory.length} history items`);
        const aiResponse = await runMedicalAgent(content.trim(), conversationHistory);

        // Update title if it's the first message
        if (previousMessages.length <= 1) { // Changed to <= 1 because we just added the user message
            const titleWords = content.trim().split(' ').slice(0, 5).join(' ');
            const newTitle = titleWords.length < content.length ? `${titleWords}...` : titleWords;
            await Chat.findByIdAndUpdate(chatId, { title: newTitle });
        }

        const aiMessage = await Message.create({
            chatId,
            sender: "ai",
            content: aiResponse,
        });

        res.status(200).json({ userMessage, aiMessage });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ message: error.message });
    }
};



export const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;

        const chat = await Chat.findOne({ _id: chatId, userId });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }


        await Chat.findByIdAndDelete(chatId);
        await Message.deleteMany({ chatId });

        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
        console.error("Delete chat error:", error);
        res.status(500).json({ message: error.message });
    }
};
