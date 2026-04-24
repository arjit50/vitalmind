import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { medicalKnowledgeLookup, emergencyResourceLookup } from "./medicalTools.js";
import fs from 'fs';
import path from 'path';

// --- 1. Logging Setup ---
const logFile = path.join(process.cwd(), 'agent.log');
const log = (msg) => {
    try {
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        console.error("Logger failed:", e);
    }
};

// --- 2. Initialize Model (Lazy Load) ---

let agentModel;

const getModel = () => {
    const targetModel = "llama-3.1-8b-instant";
    if (!agentModel) {
        log(`Initializing AI Model: ${targetModel}`);
        const model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: targetModel,
            temperature: 0.5,
        });
        // Bind tools to the model
        agentModel = model.bindTools([medicalKnowledgeLookup, emergencyResourceLookup]);
    }
    return agentModel;
};


// --- 3. Main Agent Function ---


export const runMedicalAgent = async (userMessage, history = []) => {
    log(`Medical Agent received request: "${userMessage}" | History items: ${history.length}`);
    
    try {
        const model = getModel();

        const systemMessage = `You are VitalMind, an expert Medical AI Assistant.
        Provide professional, empathetic, and accurate health guidance.

        STRICT PROTOCOLS:
        1. NATURAL GREETINGS: Respond warmly to simple greetings. No disclaimer needed for "hi".
        2. CONTEXT: Prioritize information from medical tools if available.
        3. FORMATTING: Use numbered lists for steps. Plain text (no bolding (no ** or __)). Use HTML <a> for links.
        4. SCOPE (CRITICAL): You are strictly a medical and health assistant. 
           - IN-SCOPE: Symptoms, treatments, wellness, nutrition, medical facilities, emergency services (ambulance), and health helpline numbers.
           - OUT-OF-SCOPE: Celebrities, sports, coding, movies, politics, finance, etc.
           - IF OUT-OF-SCOPE: You MUST politely decline with ONLY the mandatory refusal string.
           - MANDATORY REFUSAL STRING: "I am VitalMind, a focused medical health assistant. I cannot assist with non-health topics. Please ask me about symptoms, treatments, wellness, or nutrition."
           - DO NOT provide any other information or helpful additions for out-of-scope queries.
        `;

        const messages = [
            new SystemMessage(systemMessage),
            ...history.map(msg =>
                msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content || "")
            ),
            new HumanMessage(userMessage),
        ];

        // 1. Tool Call Detection
        log("Invoking agent model...");
        let aiMsg;
        try {
            aiMsg = await model.invoke(messages);
        } catch (err) {
            log(`Initial invocation failed: ${err.message}. Trying fallback...`);
            // Fallback: try a direct invocation without tools if tool-calling failed
            const simpleModel = new ChatGroq({
                apiKey: process.env.GROQ_API_KEY,
                model: "llama-3.1-8b-instant",
                temperature: 0.5,
            });
            aiMsg = await simpleModel.invoke(messages);
        }

        if (!aiMsg) {
            throw new Error("No response from AI model.");
        }

        log(`Model response received. Content length: ${aiMsg.content?.length || 0} | Tool calls: ${aiMsg.tool_calls?.length || 0}`);

        // 2. Execute Tools if requested
        if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
            log(`Processing ${aiMsg.tool_calls.length} tool calls...`);
            const toolMsgs = await Promise.all(aiMsg.tool_calls.map(async (toolCall) => {
                log(`Executing tool: ${toolCall.name}`);
                let toolOutput = "";
                try {
                    if (toolCall.name === "medical_knowledge_lookup") {
                        toolOutput = await medicalKnowledgeLookup.invoke(toolCall.args);
                    } else if (toolCall.name === "emergency_resource_lookup") {
                        toolOutput = await emergencyResourceLookup.invoke(toolCall.args);
                    } else {
                        toolOutput = "Tool not found.";
                    }
                } catch (err) {
                    log(`Tool ${toolCall.name} execution failed: ${err.message}`);
                    toolOutput = "Local medical knowledge base search failed. Using internal knowledge.";
                }

                return new ToolMessage({
                    tool_call_id: toolCall.id,
                    content: String(toolOutput || "No information found.")
                });
            }));

            try {
                log("Synthesizing final response with tool results...");
                const finalResponse = await model.invoke([
                    ...messages,
                    aiMsg,
                    ...toolMsgs,
                ]);
                return (finalResponse.content || "").trim() || "I have processed your request. How else can I help?";
            } catch (err) {
                log(`Final synthesis failed: ${err.message}`);
                // If synthesis fails, try one last time with a simple model and a flattened prompt
                try {
                    const simpleModel = new ChatGroq({
                        apiKey: process.env.GROQ_API_KEY,
                        model: "llama-3.1-8b-instant",
                        temperature: 0.3,
                    });
                    const combinedContext = toolMsgs.map(m => m.content).join("\n\n");
                    const fallbackRes = await simpleModel.invoke([
                        new SystemMessage(systemMessage),
                        new HumanMessage(`Based on this information: ${combinedContext}\n\nPlease answer the user: ${userMessage}`)
                    ]);
                    return (fallbackRes.content || "").trim();
                } catch (innerErr) {
                    return (aiMsg.content || "").trim() || "I apologize, but I'm having trouble synthesizing a medical response right now.";
                }
            }
        }

        return (aiMsg.content || "I'm VitalMind, your health assistant. How can I help you today?").trim();

    } catch (error) {
        log(`Medical Agent Fatal Error: ${error.message}`);
        return "I apologize, but I'm having trouble processing your health request right now. Please try again or rephrase your question.";
    }
};
