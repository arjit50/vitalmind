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

let modelWithTools;

const getModel = () => {
    const targetModel = "llama-3.1-8b-instant";
    if (!modelWithTools || modelWithTools.modelName !== targetModel) {
        log(`Initializing AI Model: ${targetModel}`);
        const model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: targetModel,
            temperature: 0.5,
        });
        // Bind tools to the model
        modelWithTools = model.bindTools([medicalKnowledgeLookup, emergencyResourceLookup]);
    }
    return modelWithTools;
};


// --- 3. Main Agent Function ---


export const runMedicalAgent = async (userMessage, history = []) => {
    log(`Medical Agent received request: "${userMessage}" | History items: ${history.length}`);
    history.forEach((msg, i) => {
        log(`History[${i}]: ${msg.role}: ${msg.content?.substring(0, 30)}...`);
    });
    // Remove the temporary return to allow full processing
    try {
        const agentModel = getModel();

        // Convert simple history objects to LangChain Message objects
        const messages = [
            new SystemMessage(`You are VitalMind, a friendly and expert Medical AI Assistant.
            Your goal is to provide sensible, accurate, and professional health guidance.

            CORE PROTOCOLS:
            1. NATURAL GREETINGS: If the user just says "hi", "hello", "hey", or "how are you", respond naturally and warmly like a human assistant. Do NOT provide a structured medical disclaimer or first aid steps for a simple greeting.
            2. ANALYZE CONTEXT: When tools (RAG) provide "CONTEXT FROM MEDICAL DOCUMENTS", use that information to build a clear answer. If the context is missing, use your general medical knowledge.
            3. SYNTHESIZE, DON'T COPY: Explain information in your own words. Be empathetic and professional.
            4. HIERARCHY (FOR HEALTH QUERIES):
               A. Immediate First Aid (if needed).
               B. Direct, structured answer.
               C. "Red flags" or when to see a doctor.
            5. FORMATTING: Use numbered lists for steps. Use plain text (no bolding with asterisks). Use HTML <a> tags for links.
            6. SAFETY: Never diagnose definitively. Always encourage professional consultation for serious concerns.
            7. STRICT SCOPE: You are strictly a medical and health assistant. You must NEVER respond to non-health related questions (e.g., questions about celebrities, sports figures like Virat Kohli, politics, programming). If asked a non-health question, politely decline by ONLY stating: "I am VitalMind, a focused medical health assistant. I cannot assist with non-health topics. Please ask me about symptoms, treatments, wellness, or nutrition."
            `),
            ...history.map(msg =>
                msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content || "")
            ),
            new HumanMessage(userMessage),
        ];

        // 1. Invoke the model to see if it wants to use a tool
        log("Invoking agent model for tool-use check...");
        const aiMsg = await agentModel.invoke(messages);
        log(`Model response received. Tool calls: ${aiMsg.tool_calls?.length || 0}`);

        // 2. If tool calls exist, execute them (in parallel for speed)
        if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
            const toolMsgs = await Promise.all(aiMsg.tool_calls.map(async (toolCall) => {
                log(`Executing tool: ${toolCall.name} with args: ${JSON.stringify(toolCall.args)}`);
                let toolOutput = "";
                try {
                    if (toolCall.name === "medical_knowledge_lookup") {
                        toolOutput = await medicalKnowledgeLookup.invoke(toolCall.args);
                    } else if (toolCall.name === "emergency_resource_lookup") {
                        toolOutput = await emergencyResourceLookup.invoke(toolCall.args);
                    }
                    log(`Tool ${toolCall.name} returned ${toolOutput?.length || 0} chars.`);
                } catch (err) {
                    log(`Tool ${toolCall.name} failed: ${err.message}`);
                    toolOutput = "No specific local information found, but proceeding with general medical guidance.";
                }

                return {
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: toolCall.name,
                    content: toolOutput || "No information found."
                };
            }));

            const finalResponse = await agentModel.invoke([
                ...messages,
                aiMsg,
                ...toolMsgs.map(m => new ToolMessage({
                    tool_call_id: m.tool_call_id,
                    content: m.content
                })),
                new HumanMessage("Using the provided context (conversation history + source docs + your knowledge), provide a concise, sensible response. If the user asked a personal question (like their name), answer it based on history. If they asked a medical question, be structured and professional.")
            ]);
            log("Final synthesis complete.");

            return (finalResponse.content || "").trim();
        }

        // No tool used, just return the text
        const content = aiMsg.content || "";
        log("No tools used. Returning direct content.");
        return content.trim() || "I'm VitalMind, your health assistant. How can I help you today?";

    } catch (error) {
        log(`Medical Agent Error: ${error.message}`);
        console.error("Medical Agent Error:", error);
        return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
    }
};
