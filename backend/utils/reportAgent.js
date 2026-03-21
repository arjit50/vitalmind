import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * Report Agent specialized in analyzing OCR text from medical reports.
 */

let modelInstance;

const getModel = () => {
    if (!modelInstance) {
        modelInstance = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
        });
    }
    return modelInstance;
};

/**
 * Analyzes OCR text and returns a structured JSON explanation.
 * @param {string} ocrText - The raw text extracted from the report.
 */
export const runReportAnalysis = async (ocrText) => {
    try {
        const agentModel = getModel();

        const messages = [
            new SystemMessage(`You are a Medical Report Analyzer.
            Your goal is to explain medical laboratory results to patients using your internal clinical knowledge.
            
            TASKS:
            1. Identify all parameters mentioned in the text.
            2. Evaluate which parameters are normal and which are abnormal based on reference ranges in the text or your internal knowledge.
            3. Generate a structured JSON response.
            
            JSON FORMAT:
            {
              "summary": "Simple 2-3 sentence overview.",
              "normalFindings": ["List of normal parameters as simple strings"],
              "abnormalFindings": ["List of abnormal parameters as simple strings with short explanations"],
              "recommendations": "Lifestyle tips (not medical prescriptions)"
            }
            
            CRITICAL RULES:
            - Return ONLY the JSON object. Do not include any introductory or concluding text.
            - "normalFindings" and "abnormalFindings" MUST be arrays of plain strings. DO NOT use objects inside these arrays.
            - If the text is not a medical report, set summary to "Analysed content does not appear to be a medical report."
            - Never provide a definitive diagnosis.
            - Ensure the output is valid JSON.
            `),
            new HumanMessage(`Analyze this medical report text and return ONLY JSON:\n\n${ocrText}`),
        ];

        let response = await agentModel.invoke(messages);
        let content = response.content.trim();
        console.log("Raw AI Response:", content);

        // Robust JSON extraction - looking for the first { and last }
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonString = content.substring(firstBrace, lastBrace + 1);
            try {
                const parsed = JSON.parse(jsonString);
                
                // Post-processing to ensure findings are strings (defensive)
                if (parsed.normalFindings && Array.isArray(parsed.normalFindings)) {
                    parsed.normalFindings = parsed.normalFindings.map(f => typeof f === 'object' ? JSON.stringify(f) : String(f));
                }
                if (parsed.abnormalFindings && Array.isArray(parsed.abnormalFindings)) {
                    parsed.abnormalFindings = parsed.abnormalFindings.map(f => typeof f === 'object' ? JSON.stringify(f) : String(f));
                }
                
                return parsed;
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError, "Content:", jsonString);
            }
        }

        throw new Error("The AI provided a response but it wasn't in the correct format. Please try again.");

    } catch (error) {
        console.error("Report Analysis Agent Error:", error);
        throw error; // Throw the actual error for the controller to catch
    }
};
