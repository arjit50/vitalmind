import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { initializeVectorStore } from "./ragInit.js";
import axios from "axios";

/**
 * Shared Medical Tools for all agents.
 */

let _vectorStore = null;

export const medicalKnowledgeLookup = tool(
    async ({ topic }) => {
        try {
            console.log(`Searching medical knowledge base for: ${topic}`);

            if (!_vectorStore) {
                _vectorStore = await initializeVectorStore();
            }

            if (!_vectorStore) {
                return "Medical knowledge base is temporarily unavailable. Providing general guidance based on AI knowledge.";
            }

            const results = await _vectorStore.similaritySearch(topic, 4); 

            if (results && results.length > 0) {
                return results.map(doc => {
                    const source = doc.metadata.source || "Unknown Source";
                    const page = doc.metadata.loc?.pageNumber || doc.metadata.page || "N/A";
                    return `[SOURCE: ${source}, PAGE: ${page}]\n${doc.pageContent}`;
                }).join("\n\n---\n\n");
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
            if (!city) {
                return `I notice you haven't specified a location. To find the nearest ${specialty || "medical facilities"}, please provide your city or area. 

In the meantime, here is universal emergency guidance:
1. Call your local emergency number (112/108 in India).
2. Go to the nearest Multi-specialty Hospital or Emergency Room immediately.
3. Stay on the line with emergency dispatchers for instructions.`;
            }

            // Sanitize inputs
            const cleanCity = city.replace(/\n/g, " ").trim();
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
                    searchResults = response.data.results.map((r, i) => {
                        // Extract only the actual name (stripping common SEO suffixes)
                        const cleanName = r.title.split(/ - | \| |: /)[0].trim();
                        const briefInfo = r.content.length > 120 ? r.content.slice(0, 120).trim() + "..." : r.content.trim();
                        return `${i + 1}. ${cleanName}\n   ${briefInfo}`;
                    }).join("\n\n");
                }
            }

            if (searchResults) {
                return `Top 5 Recommended Facilities in ${cleanCity}:\n\n${searchResults}`;
            } else {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                return `I found some highly-rated facilities in ${cleanCity}. You can see the full list and ratings here: <a href="${searchUrl}" target="_blank" style="color: #2196f3; text-decoration: underline;">View Results</a>`;
            }


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
