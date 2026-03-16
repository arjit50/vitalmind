import fs from "fs";
import path from "path";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Embeddings } from "@langchain/core/embeddings";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";

// ─── Constants ─────────────────────────────────────────────────────────────
const DOCS_PATH = "./data/medical_docs";

// ─── Local Embedding Model (Free, Fast, Llama-compatible) ───────────────────
let _extractor = null;
const getExtractor = async () => {
    if (_extractor) return _extractor;
    const { pipeline } = await import("@huggingface/transformers");
    // Using 384-dimensional MiniLM (industry standard for fast RAG)
    _extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    return _extractor;
};

class LocalEmbeddings extends Embeddings {
    constructor() { super({}); }
    async embedDocuments(texts) {
        const extractor = await getExtractor();
        const embeddings = [];
        for (const text of texts) {
            const output = await extractor(text, { pooling: "mean", normalize: true });
            embeddings.push(Array.from(output.data));
        }
        return embeddings;
    }
    async embedQuery(text) {
        const extractor = await getExtractor();
        const output = await extractor(text, { pooling: "mean", normalize: true });
        return Array.from(output.data);
    }
}

const embeddings = new LocalEmbeddings();

// ─── Pinecone Configuration ───────────────────────────────────────────────
let _pineconeIndex = null;
const getPineconeIndex = () => {
    if (_pineconeIndex) return _pineconeIndex;
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    _pineconeIndex = pc.Index(process.env.PINECONE_INDEX_NAME);
    return _pineconeIndex;
};

// ─── Core Logic (Right Manner) ──────────────────────────────────────────────

/**
 * Main function to index a single document into Pinecone.
 * Follows the user's preferred structure.
 */
export async function indexDocument(filePath) {
    try {
        console.log(`[RAG] Loading document: ${path.basename(filePath)}`);
        let docs = [];
        
        if (filePath.endsWith(".pdf")) {
            const loader = new PDFLoader(filePath);
            docs = await loader.load();
        } else if (filePath.endsWith(".txt")) {
            const content = fs.readFileSync(filePath, "utf-8");
            docs = [new Document({ pageContent: content, metadata: { source: path.basename(filePath) } })];
        }

        if (docs.length === 0) throw new Error("No content found in document.");

        // 1. Chunking
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const chunkedDocs = await textSplitter.splitDocuments(docs);
        console.log(`[RAG] Chunking completed: ${chunkedDocs.length} segments.`);

        // 2. Database Connection
        console.log("[RAG] Configuring Pinecone client...");
        const pineconeIndex = getPineconeIndex();
        console.log("[RAG] Pinecone configured.");

        // 3. Store in Vector Database (Right Manner - with batching for reliability)
        console.log("[RAG] Storing data in Pinecone...");
        
        // We initialize the store first from existing index
        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex });
        
        // Perform batch storage to prevent timeouts/errors on large PDFs
        const batchSize = 50;
        for (let i = 0; i < chunkedDocs.length; i += batchSize) {
            const batch = chunkedDocs.slice(i, i + batchSize);
            process.stdout.write(`  - Progress: ${Math.min(i + batchSize, chunkedDocs.length)}/${chunkedDocs.length}\r`);
            await vectorStore.addDocuments(batch);
        }
        process.stdout.write("\n");

        console.log(`[RAG] ✓ Data stored successfully: ${path.basename(filePath)}`);
        return true;
    } catch (error) {
        console.error(`[RAG] Ingestion error for ${filePath}:`, error.message);
        throw error;
    }
}

/**
 * Initialize the vector store for querying.
 */
export const initializeVectorStore = async () => {
    try {
        if (!process.env.PINECONE_INDEX_NAME) return null;
        return await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: getPineconeIndex(),
        });
    } catch (err) {
        console.warn("[RAG] Index not ready or connected. Queries may fail until documents are indexed.");
        return null;
    }
};

/**
 * Bulk ingestion of all files in the docs directory.
 */
export const ingestDocs = async () => {
    try {
        if (!fs.existsSync(DOCS_PATH)) {
            fs.mkdirSync(DOCS_PATH, { recursive: true });
            return;
        }
        const files = fs.readdirSync(DOCS_PATH);
        if (files.length === 0) {
            console.log("[RAG] No medical documents found in data folder.");
            return;
        }
        
        for (const file of files) {
            await indexDocument(path.join(DOCS_PATH, file));
        }
    } catch (err) {
        console.error("[RAG] Bulk ingestion failed:", err.message);
    }
};
