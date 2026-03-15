import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import Tesseract from "tesseract.js";

/**
 * Service to analyze medicine images using OCR and Groq Text AI.
 * @param {string} imageUrl - The URL of the uploaded image.
 * @returns {Promise<Object>} - The identified medicine info.
 */
export const analyzeMedicineImage = async (imageUrl) => {
    try {
        console.log("Starting OCR for image:", imageUrl);

        // 1. Perform OCR using Tesseract.js
        const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
            logger: m => console.log(m.status, m.progress)
        });

        console.log("OCR Result:", text);

        if (!text || text.trim().length < 5) {
            throw new Error("Could not extract enough text from the image. Please ensure the medicine label is clearly visible.");
        }

        // 2. Analyze extracted text with Groq Text AI
        const model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
        });

        const prompt = `You are a clinical pharmacist. Below is text extracted from a medicine image using OCR. 
        Analyze the text and identify the medicine and its details.
        
        Extracted Text:
        """
        ${text}
        """

        INSTRUCTIONS:
        1. Identify the medicine from the OCR text.
        2. Once identified, provide its common details (purpose, usage, side effects, etc.).
        3. If the OCR text is missing specific details like dosage or side effects, use your INTERNAL CLINICAL KNOWLEDGE to provide general, accurate information for that identified medicine. 
        4. DO NOT just say "Not specified in text" if you know what the medicine is. Provide helpful, general guidance.
        5. Provide the details in a clean JSON format.

        JSON structure:
        {
          "name": "Medicine Name",
          "purpose": "What it is used for",
          "usage": "General dosage instructions",
          "timing": "When to take it",
          "sideEffects": "Common side effects",
          "safetyWarnings": "Critical warnings"
        }
        
        IMPORTANT: Return ONLY the JSON object. No extra text. If you cannot identify any medicine from the text, return {"error": "Could not identify medicine from the extracted text"}.`;

        const message = new HumanMessage(prompt);

        console.log("Invoking Groq Text model (Llama 3.3)...");
        const response = await model.invoke([message]);
        const content = response.content;
        console.log("AI Text Analysis Response:", content);

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const data = JSON.parse(jsonMatch[0]);
                if (data.error) throw new Error(data.error);
                return data;
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError.message);
            }
        }

        throw new Error("Could not identify medicine from the text. Please try a clearer photo.");
    } catch (error) {
        console.error("OCR/AI IDENTIFICATION ERROR:", error);
        return { error: error.message || "Failed to identify medicine. Please try again with a clearer image." };
    }
};
