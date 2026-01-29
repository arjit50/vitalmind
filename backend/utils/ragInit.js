import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const DOCS_PATH = "./data/medical_docs";

/**
 * LIGHTWEIGHT RAG IMPLEMENTATION
 * ----------------------------
 * This replaces the brittle LangChain Vector Store with a stable, 
 * in-memory keyword-based retrieval system. 
 * It provides the same interface for the Medical Agent.
 */

class SimpleDocStore {
    constructor() {
        this.docs = [];
    }

    async addDocument(content, source) {
        // Split content into chunks for better retrieval
        const chunks = this.splitText(content, 1000);
        chunks.forEach(chunk => {
            this.docs.push({ content: chunk, source });
        });
    }

    splitText(text, length) {
        const chunks = [];
        let i = 0;
        while (i < text.length) {
            chunks.push(text.slice(i, i + length));
            i += length - 200; // Overlap
        }
        return chunks;
    }

    async similaritySearch(query, k = 2) {
        const queryTerms = query.toLowerCase().split(/\W+/).filter(t => t.length > 3);

        const scoredDocs = this.docs.map(doc => {
            const content = doc.content.toLowerCase();
            let score = 0;
            queryTerms.forEach(term => {
                if (content.includes(term)) score += 1;
            });
            return { ...doc, score };
        });

        return scoredDocs
            .filter(d => d.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, k)
            .map(d => ({ pageContent: d.content, metadata: { source: d.source } }));
    }
}

let vectorStore;

export const initializeVectorStore = async () => {
    if (vectorStore) return vectorStore;

    console.log("Initializing Lightweight Medical Document Store...");
    vectorStore = new SimpleDocStore();
    await ingestDocs();
    return vectorStore;
};

export const ingestDocs = async () => {
    try {
        if (!fs.existsSync(DOCS_PATH)) {
            fs.mkdirSync(DOCS_PATH, { recursive: true });
            console.log(`Created directory: ${DOCS_PATH}. Please add your medical documents.`);
            return;
        }

        const files = fs.readdirSync(DOCS_PATH);
        console.log(`Found ${files.length} files in ${DOCS_PATH}.`);

        for (const file of files) {
            const filePath = path.join(DOCS_PATH, file);
            let content = "";

            if (file.endsWith(".pdf")) {
                try {
                    const dataBuffer = fs.readFileSync(filePath);
                    const pdf = require("pdf-parse");
                    const data = await pdf(dataBuffer);
                    content = data.text;
                    console.log(`Indexed PDF: ${file}`);
                } catch (pdfError) {
                    console.warn(`Skipping PDF ${file} (pdf-parse not available or error):`, pdfError.message);
                    continue;
                }
            } else if (file.endsWith(".txt")) {
                content = fs.readFileSync(filePath, "utf-8");
                console.log(`Indexed Text: ${file}`);
            }

            if (content) {
                await vectorStore.addDocument(content, file);
            }
        }
        console.log("Document Ingestion Complete.");
    } catch (error) {
        console.error("Critical error during ingestion:", error);
    }
};
