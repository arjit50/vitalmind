import Groq from "groq-sdk";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";


export const analyzeReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded" });
        }

        const imagePath = req.file.path;

        
        console.log("Starting OCR processing...");
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng',
            { logger: m => console.log(m) }
        );

        // console.log("OCR Text extracted:", text.substring(0, 100) + "...");

      
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const systemPrompt = `You are an expert medical report analyzer. Your goal is to explain medical reports to patients in simple, easy-to-understand language.

        Input: Raw text extracted from a medical report (blood test, lab result, etc.) via OCR.

        Output Format (JSON):
        {
            "summary": "A simple 2-3 sentence summary of the overall health status based on the report.",
            "normalFindings": ["List of parameters that are within normal range"],
            "abnormalFindings": ["List of parameters that are out of range, with a brief simple explanation of what that means"],
            "recommendations": "General healthy lifestyle tips based on the findings (NOT medical advice)"
        }

        Rules:
        - If the text is gibberish or not a medical report, return a summary stating that the image could not be analyzed.
        - Do NOT give medical diagnosis or prescribe medication.
        - Highlight urgent values if any (e.g. extremely high sugar).
        - Keep the tone reassuring and professional.
        `;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is the text from the report:\n\n${text}` }
            ],
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(completion.choices[0].message.content);

        
        fs.unlinkSync(imagePath);

        res.status(200).json({
            success: true,
            extractedText: text,
            analysis: analysis
        });

    } catch (error) {
        console.error("Analysis error:", error);
        
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: error.message || "Failed to analyze report" });
    }
};
