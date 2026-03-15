import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const _pdfParse = require("pdf-parse");
// pdf-parse CJS interop — the function may be at .default in ESM context
const pdf = typeof _pdfParse === "function" ? _pdfParse : _pdfParse.default;

const DOCS_PATH = "./data/medical_docs";
const CACHE_PATH = "./data/embeddings_cache.json";

// ─── Embedding Model (lazy loaded) ──────────────────────────────────────────

let _extractor = null;

const getExtractor = async () => {
    if (_extractor) return _extractor;
    const { pipeline } = await import("@huggingface/transformers");
    _extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    return _extractor;
};

const embed = async (text) => {
    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
};

// ─── Cosine Similarity ───────────────────────────────────────────────────────

const cosineSimilarity = (a, b) => {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot   += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
};

// ─── Text Splitter ───────────────────────────────────────────────────────────

const splitText = (text, chunkSize = 1000, overlap = 200) => {
    const chunks = [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    let current = "";

    for (const sentence of sentences) {
        if ((current + " " + sentence).length > chunkSize && current.length > 0) {
            chunks.push(current.trim());
            current = current.slice(-overlap) + " " + sentence;
        } else {
            current += " " + sentence;
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
};

// ─── In-Memory Semantic Vector Store ────────────────────────────────────────

class SemanticVectorStore {
    constructor() {
        this.entries = []; // { embedding, pageContent, metadata }
    }

    async addDocuments(docs) {
        const total = docs.length;
        for (let i = 0; i < total; i++) {
            const doc = docs[i];
            const embedding = await embed(doc.pageContent);
            this.entries.push({ embedding, pageContent: doc.pageContent, metadata: doc.metadata });
            if ((i + 1) % 50 === 0) console.log(`   Embedded ${i + 1}/${total} chunks...`);
        }
    }

    async similaritySearch(query, k = 3) {
        const queryEmbedding = await embed(query);
        const scored = this.entries.map(entry => ({
            pageContent: entry.pageContent,
            metadata: entry.metadata,
            score: cosineSimilarity(queryEmbedding, entry.embedding),
        }));

        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, k)
            .map(({ pageContent, metadata }) => ({ pageContent, metadata }));
    }

    saveToDisk() {
        try {
            fs.writeFileSync(CACHE_PATH, JSON.stringify(this.entries));
            console.log(`✓ Embeddings cached to ${CACHE_PATH}`);
        } catch (err) {
            console.error("Failed to save embeddings cache:", err);
        }
    }

    loadFromDisk() {
        if (fs.existsSync(CACHE_PATH)) {
            try {
                this.entries = JSON.parse(fs.readFileSync(CACHE_PATH));
                console.log(`✓ Loaded ${this.entries.length} cached embeddings from disk.`);
                return true;
            } catch (err) {
                console.error("Failed to load embeddings cache:", err);
            }
        }
        return false;
    }
}

// ─── Singleton Store ─────────────────────────────────────────────────────────

let vectorStore = null;

export const initializeVectorStore = async () => {
    if (vectorStore) return vectorStore;

    console.log("Initializing Semantic Medical Vector Store...");
    vectorStore = new SemanticVectorStore();
    
    // 1. Try Loading from Cache First (Instant)
    if (vectorStore.loadFromDisk()) {
        return vectorStore;
    }

    // 2. Otherwise, Ingest and Embed (Takes time, but once only)
    await ingestDocs(vectorStore);
    vectorStore.saveToDisk();
    
    return vectorStore;
};

// ─── Document Ingestion ──────────────────────────────────────────────────────

export const ingestDocs = async (store) => {
    try {
        if (!fs.existsSync(DOCS_PATH)) {
            fs.mkdirSync(DOCS_PATH, { recursive: true });
            return;
        }

        const files = fs.readdirSync(DOCS_PATH);
        console.log(`Analyzing ${files.length} medical document(s) for RAG...`);

        const allDocs = [];

        for (const file of files) {
            const filePath = path.join(DOCS_PATH, file);
            let content = "";

            if (file.endsWith(".pdf")) {
                try {
                    const dataBuffer = fs.readFileSync(filePath);
                    const data = await pdf(dataBuffer);
                    content = data.text;
                } catch (err) {
                    continue;
                }
            } else if (file.endsWith(".txt")) {
                content = fs.readFileSync(filePath, "utf-8");
            }

            if (content) {
                // Remove PDF artifacts and normalize whitespace
                const clean = content
                    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "") // Remove non-printable chars
                    .replace(/\u0000/g, "") // Remove null chars
                    .replace(/□|■|○|●/g, "") // Remove bullet artifacts
                    .replace(/\r\n/g, "\n")
                    .replace(/(\w)-\s*\n(\w)/g, "$1$2") // Join hyphenated words across lines
                    .replace(/\n\s*\n/g, "\n\n") // Normalize double newlines
                    .replace(/[ \t]+/g, " ") // Normalize horizontal whitespace
                    .trim();

                const chunks = splitText(clean, 1000, 200);
                for (const chunk of chunks) {
                    allDocs.push({ pageContent: chunk, metadata: { source: file } });
                }
            }
        }

        if (allDocs.length > 0) {
            console.log(`Generating embeddings for ${allDocs.length} segments. This happens only once...`);
            await store.addDocuments(allDocs);
            console.log("✓ Ingestion complete.");
        }

    } catch (error) {
        console.error("Ingestion error:", error);
    }
};

