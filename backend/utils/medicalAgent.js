import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { medicalKnowledgeLookup, emergencyResourceLookup } from "./medicalTools.js";

// --- 2. Initialize Model (Lazy Load) ---

let modelWithTools;

const getModel = () => {
    if (!modelWithTools) {
        const model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.3-70b-versatile",
            temperature: 0.2, // Low temperature for factual accuracy
        });
        // Bind tools to the model
        modelWithTools = model.bindTools([medicalKnowledgeLookup, emergencyResourceLookup]);
    }
    return modelWithTools;
};


// --- 3. Main Agent Function ---

/**
 * Runs the medical agent with the given input and history.
 * @param {string} userMessage - The current user message.
 * @param {Array} history - Previous conversation history (array of { role, content }).
 */
export const runMedicalAgent = async (userMessage, history = []) => {
    try {
        const agentModel = getModel();

        // Convert simple history objects to LangChain Message objects
        const messages = [
            new SystemMessage(`You are VitalMind, a specialized AI health assistant. 
             Your goal is to provide accurate, helpful, and safe health information.
            
            GUIDELINES:
            1. ALWAYS check your internal "medical_knowledge_lookup" tool first for symptom info.
            2. If the user mentions serious symptoms (chest pain, heavy bleeding, etc.) or asks for a doctor/hospital, use the "emergency_resource_lookup" tool.
            3. LINK FORMATTING: Use HTML <a> tags for links like <a href="url">Label</a>. NEVER use Markdown [label](url) syntax for links.
            4. PROFESSIONALISM: Do NOT use asterisks (*) or double asterisks (**) for bolding or lists. Use plain text and numbered lists.
            5. Be empathetic but prioritize safety.
            6. NEVER give definitive diagnoses. Always suggest consulting a professional.
            `),
            ...history.map(msg =>
                msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content || "")
            ),
            new HumanMessage(userMessage),
        ];

        // 1. Invoke the model to see if it wants to use a tool
        const aiMsg = await agentModel.invoke(messages);

        // 2. If tool calls exist, execute them
        if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
            const toolMsgs = [];
            for (const toolCall of aiMsg.tool_calls) {
                let toolOutput = "";
                if (toolCall.name === "medical_knowledge_lookup") {
                    toolOutput = await medicalKnowledgeLookup.invoke(toolCall.args);
                } else if (toolCall.name === "emergency_resource_lookup") {
                    toolOutput = await emergencyResourceLookup.invoke(toolCall.args);
                }

                if (toolOutput) {
                    console.log(`Tool Result for ${toolCall.name} (first 100 chars): ${toolOutput.substring(0, 100)}...`);
                    toolMsgs.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: toolCall.name,
                        content: toolOutput
                    });
                }
            }

            // Append the tool outputs to the message history and invoke model again for final answer
            const finalResponse = await agentModel.invoke([
                ...messages,
                aiMsg,
                ...toolMsgs.map(m => new ToolMessage({
                    tool_call_id: m.tool_call_id,
                    content: m.content
                }))
            ]);

            const finalContent = finalResponse.content || "";
            if (!finalContent.trim()) {
                console.log("Model returned empty content after tool call. Attempting to return raw tool output.");
                // Combine all tool outputs as a fallback if the model is being terse
                return toolMsgs.map(m => m.content).join("\n\n---\n\n");
            }

            return finalContent.trim();
        }

        // No tool used, just return the text
        const content = aiMsg.content || "";
        return content.trim() || "I'm VitalMind, your health assistant. How can I help you today?";

    } catch (error) {
        console.error("Medical Agent Error:", error);
        return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
    }
};
