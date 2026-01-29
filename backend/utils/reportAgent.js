import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { medicalKnowledgeLookup } from "./medicalTools.js";

/**
 * Report Agent specialized in analyzing OCR text from medical reports.
 */

let modelWithTools;

const getModel = () => {
    if (!modelWithTools) {
        const model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.3-70b-versatile",
            temperature: 0.1, // Very low for analytical precision
        });
        modelWithTools = model.bindTools([medicalKnowledgeLookup]);
    }
    return modelWithTools;
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
            Your goal is to explain medical laboratory results to patients.
            
            TASKS:
            1. Use the 'medical_knowledge_lookup' tool to verify normal ranges and significance of any abnormal parameters found in the text.
            2. Generate a structured JSON response.
            
            JSON FORMAT:
            {
              "summary": "Simple 2-3 sentence overview.",
              "normalFindings": ["List of normal parameters"],
              "abnormalFindings": ["List of abnormal parameters with simple explanations"],
              "recommendations": "Lifestyle tips (not medical prescriptions)"
            }
            
            RULES:
            - If the text is not a medical report, set summary to "Analysed content does not appear to be a medical report."
            - Never provide a definitive diagnosis.
            - Ensure the output is valid JSON.
            `),
            new HumanMessage(`Analyze this medical report text:\n\n${ocrText}`),
        ];

        // 1. Initial invocation
        let response = await agentModel.invoke(messages);

        // 2. Handle Tool Calls
        if (response.tool_calls && response.tool_calls.length > 0) {
            const toolMsgs = [];
            for (const toolCall of response.tool_calls) {
                if (toolCall.name === "medical_knowledge_lookup") {
                    const toolOutput = await medicalKnowledgeLookup.invoke(toolCall.args);
                    toolMsgs.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: toolCall.name,
                        content: toolOutput
                    });
                }
            }

            // Final generation after tool results
            response = await agentModel.invoke([
                ...messages,
                response,
                ...toolMsgs.map(m => ({
                    tool_call_id: m.tool_call_id,
                    role: "tool",
                    content: m.content
                }))
            ]);
        }

        // Clean up response content if it contains markdown markers
        let content = response.content.trim();
        if (content.startsWith("```json")) {
            content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
        }

        return JSON.parse(content);

    } catch (error) {
        console.error("Report Analysis Agent Error:", error);
        throw new Error("Agent failed to process the report. Ensure the image is clear.");
    }
};
