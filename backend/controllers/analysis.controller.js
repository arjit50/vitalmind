import Tesseract from "tesseract.js";
import fs from "fs";
import { runReportAnalysis } from "../utils/reportAgent.js";
import { checkEmergency, checkOutOfScope } from "../utils/safetyRules.js";


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

        if (!text || text.trim().length < 10) {
            fs.unlinkSync(imagePath);
            return res.status(400).json({
                message: "Could not extract enough text from the image. Please ensure the photo is clear and well-lit."
            });
        }

        // --- 1. Safety Rules Layer ---
        const emergencyMatch = checkEmergency(text);
        if (emergencyMatch) {
            fs.unlinkSync(imagePath);
            return res.status(200).json({
                success: true,
                safetyAlert: true,
                analysis: {
                    summary: `EMERGENCY DETECTED: We detected keywords related to "${emergencyMatch}". This may be a critical situation.`,
                    recommendations: "PLEASE SEEK IMMEDIATE MEDICAL ATTENTION. Call emergency services or go to the nearest hospital."
                }
            });
        }

        const outOfScopeMatch = checkOutOfScope(text);
        if (outOfScopeMatch) {
            fs.unlinkSync(imagePath);
            return res.status(200).json({
                success: true,
                outOfScope: true,
                analysis: {
                    summary: "The analysis appears to be for a non-medical document.",
                    recommendations: "Please upload a valid medical report (e.g., blood test, X-ray report)."
                }
            });
        }

        // --- 2. Agentic Core ---
        console.log("Starting Agentic Report Analysis...");
        console.log("Extracted OCR Text (First 100 chars):", text.substring(0, 100));
        
        const analysis = await runReportAnalysis(text);
        console.log("Analysis Result Generated Successfully");

        // Cleanup
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
