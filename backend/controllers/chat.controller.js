import Groq from "groq-sdk";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

//  CREATE CHAT
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

//  GET CHAT HISTORY
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

//  GET CHAT MESSAGES
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

// SEND MESSAGE
export const sendMessage = async (req, res) => {
    try {
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const { chatId } = req.params;
        const { content } = req.body;
        const userId = req.userId;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Message content is required" });
        }

        const chat = await Chat.findOne({ _id: chatId, userId });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const userMessage = await Message.create({
            chatId,
            sender: "user",
            content: content.trim(),
        });

        const previousMessages = await Message.find({ chatId })
            .sort({ timestamp: 1 })
            .limit(10);

        const conversationHistory = previousMessages.map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
        }));

        const systemPrompt = {
            role: "system",
            content: `You are VitalMind, a specialized AI health assistant. Your role is STRICTLY limited to health, wellness, and medical topics.

CORE RESPONSIBILITIES:
- Answer questions about symptoms, diseases, medications, and treatments
- Provide wellness tips, nutrition advice, and fitness guidance
- Discuss mental health, preventive care, and healthy lifestyle habits
- Offer general health information and medical terminology explanations

STRICT BOUNDARIES:
- If a user asks about non-health topics (politics, entertainment, technology, general knowledge, coding, etc.), politely decline and redirect them back to health topics
- Response format for non-health questions: "I'm VitalMind, your health assistant. I can only help with health, wellness, and medical questions. Please ask me something related to your health, symptoms, nutrition, fitness, or general wellness."

IMPORTANT REMINDERS:
- Always include medical disclaimers for serious conditions
- Encourage users to consult healthcare professionals for diagnosis
- Be empathetic, professional, and supportive
- Never provide emergency medical advice - direct to emergency services if needed

Stay focused on health-related topics only.`,
        };

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [systemPrompt, ...conversationHistory],
        });

        const aiResponse =
            completion.choices?.[0]?.message?.content || "No response";

        // Update chat title based on first message BEFORE sending response
        // previousMessages.length === 1 means only the user message we just created exists
        if (previousMessages.length === 1) {
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
