import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { initializeVectorStore } from "./ragInit.js";
import axios from "axios";

/**
 * Shared Medical Tools for all agents.
 */

export const medicalKnowledgeLookup = tool(
    async ({ topic }) => {
        try {
            console.log(`Searching medical knowledge base for: ${topic}`);

            const vectorStore = await initializeVectorStore();
            const results = await vectorStore.similaritySearch(topic, 2);

            if (results && results.length > 0) {
                const combinedContext = results.map(doc => {
                    const source = doc.metadata.source ? `(Source: ${doc.metadata.source.split('\\').pop()})` : "(Verified Source)";
                    return `${source}\n${doc.pageContent}`;
                }).join("\n\n---\n\n");

                return `Verified medical information found:\n\n${combinedContext}`;
            }

            return "No specific local documents found on this topic. Providing general guidance.";
        } catch (error) {
            console.error("Vector Search Error:", error);
            return "Error accessing medical knowledge base.";
        }
    },
    {
        name: "medical_knowledge_lookup",
        description: "Retrieves verified medical information from local docs. Use for conditions, symptoms, and lab result explanations.",
        schema: z.object({
            topic: z.string().describe("The medical topic or lab parameter to look up."),
        }),
    }
);

/**
 * Emergency Resource Lookup Tool
 * Searches for hospitals and doctors near a location or general area.
 */
export const emergencyResourceLookup = tool(
    async ({ city, specialty }) => {
        try {
            // Sanitize inputs to remove any potential newlines
            const cleanCity = (city || "India").replace(/\n/g, " ").trim();
            const cleanSpecialty = (specialty || "medical hospitals and specialist doctors").replace(/\n/g, " ").trim();

            const query = `Top 5 ${cleanSpecialty} in ${cleanCity}`;
            console.log(`Searching for emergency resources: ${query}`);

            // 1. Check for Tavily API Key
            const tavilyKey = (process.env.TAVILY_API_KEY || "").trim();
            let searchResults = "";

            if (tavilyKey && tavilyKey !== "your_tavily_key" && tavilyKey !== "") {
                console.log("Using Tavily Search API...");
                const response = await axios.post("https://api.tavily.com/search", {
                    api_key: tavilyKey,
                    query: query,
                    search_depth: "basic",
                    max_results: 5
                });

                if (response.data && response.data.results) {
                    searchResults = response.data.results.map((r, i) =>
                        `${i + 1}. ${r.title}\n   ${r.content}\n   [Link to Source](${r.url})`
                    ).join("\n\n");
                }
            }

            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

            let responseText = `I have looked for the best medical resources for you.\n\n`;

            if (searchResults) {
                responseText += `Top 5 Recommended Facilities:\n\n${searchResults}\n\n`;
            } else {
                responseText += `1. <a href="${searchUrl}" target="_blank" style="color: #2196f3; text-decoration: underline;">Click here to view Top Hospitals and Doctors in ${cleanCity}</a>\n\n`;
            }

            responseText += `Emergency Steps:\n`;
            responseText += `2. Local Emergency Number: 102 / 108 (India) or 911 (US)\n`;
            responseText += `3. Nearest Government/Private Multi-specialty Hospital.\n\n`;
            responseText += `Please do not delay if you are in pain or distress.`;

            return responseText;

        } catch (error) {
            console.error("Search Tool Error:", error);
            return "I'm having trouble searching for local resources right now. Please go to the nearest hospital immediately.";
        }
    },
    {
        name: "emergency_resource_lookup",
        description: "Finds lists of top doctors and hospitals. Use this ONLY when the user mentions serious symptoms, emergencies, or specifically asks for hospital/doctor recommendations.",
        schema: z.object({
            city: z.string().optional().describe("The city or area to search in (e.g., 'Mumbai', 'New York')."),
            specialty: z.string().optional().describe("The type of doctor or facility needed (e.g., 'Cardiologist', 'Pediatrician', 'Emergency Room')."),
        }),
    }
);
