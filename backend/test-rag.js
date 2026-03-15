/**
 * RAG Test Suite for VitalMind
 * Tests:
 *  1. Vector store initialisation & PDF ingestion
 *  2. Semantic similarity search with real medical prompts
 *  3. Full end-to-end Medical Agent response using RAG
 *
 * Run with:  node test-rag.js
 */

import dotenv from "dotenv";
dotenv.config();

import { initializeVectorStore } from "./utils/ragInit.js";
import { runMedicalAgent } from "./utils/medicalAgent.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RESET   = "\x1b[0m";
const GREEN   = "\x1b[32m";
const YELLOW  = "\x1b[33m";
const CYAN    = "\x1b[36m";
const RED     = "\x1b[31m";
const BOLD    = "\x1b[1m";

const log    = (msg)       => console.log(`${CYAN}${msg}${RESET}`);
const ok     = (msg)       => console.log(`${GREEN}✓ ${msg}${RESET}`);
const warn   = (msg)       => console.log(`${YELLOW}⚠ ${msg}${RESET}`);
const fail   = (msg)       => console.log(`${RED}✗ ${msg}${RESET}`);
const header = (title)     => console.log(`\n${BOLD}${YELLOW}${"=".repeat(60)}\n  ${title}\n${"=".repeat(60)}${RESET}`);
const divider = ()         => console.log(`${YELLOW}${"─".repeat(60)}${RESET}`);

// ─── Test Prompts ─────────────────────────────────────────────────────────────

const SEARCH_PROMPTS = [
    "first aid treatment for burns",
    "type 2 diabetes prevention tips",
    "CPR steps for cardiac arrest",
    "blood test normal reference ranges",
    "emergency care for fractures",
    "what is haemoglobin normal range",
];

const AGENT_PROMPTS = [
    "What should I do immediately if someone has a burn?",
    "How can I prevent type 2 diabetes?",
    "My blood test shows haemoglobin of 10 g/dL, is that normal?",
];

// ─── Test 1: Vector Store Init & Ingestion ───────────────────────────────────

async function testVectorStoreInit() {
    header("TEST 1 — Vector Store Initialisation & PDF Ingestion");
    const start = Date.now();

    let store;
    try {
        store = await initializeVectorStore();
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        ok(`Vector store ready in ${elapsed}s`);
        ok(`Total embedded chunks: ${store.entries.length}`);

        if (store.entries.length === 0) {
            fail("No chunks were ingested! Check that PDFs exist in data/medical_docs/");
            return null;
        }

        // Show source distribution
        const sources = {};
        for (const e of store.entries) {
            const src = e.metadata.source;
            sources[src] = (sources[src] || 0) + 1;
        }
        log("\nChunks per source document:");
        for (const [src, count] of Object.entries(sources)) {
            console.log(`   ${count.toString().padStart(4)} chunks  ←  ${src}`);
        }

        return store;
    } catch (err) {
        fail(`Vector store failed to initialize: ${err.message}`);
        return null;
    }
}

// ─── Test 2: Semantic Similarity Search ─────────────────────────────────────

async function testSimilaritySearch(store) {
    header("TEST 2 — Semantic Similarity Search");

    let passed = 0;
    for (const prompt of SEARCH_PROMPTS) {
        divider();
        log(`Query: "${prompt}"`);
        try {
            const results = await store.similaritySearch(prompt, 2);
            if (results.length === 0) {
                warn("No results returned.");
            } else {
                passed++;
                for (const [i, r] of results.entries()) {
                    console.log(`  ${GREEN}[${i + 1}] Source: ${r.metadata.source}${RESET}`);
                    console.log(`       Excerpt: ${r.pageContent.slice(0, 200).replace(/\n/g, " ")}...`);
                }
            }
        } catch (err) {
            fail(`Search failed: ${err.message}`);
        }
    }
    divider();
    console.log(`\n${BOLD}Search Results: ${passed}/${SEARCH_PROMPTS.length} queries returned results.${RESET}`);
    return passed;
}

// ─── Test 3: Full Agent End-to-End ──────────────────────────────────────────

async function testMedicalAgent() {
    header("TEST 3 — Full Medical Agent (RAG-Augmented Responses)");

    for (const prompt of AGENT_PROMPTS) {
        divider();
        log(`User: "${prompt}"`);
        console.log(`${YELLOW}Waiting for agent response...${RESET}`);
        try {
            const start = Date.now();
            const response = await runMedicalAgent(prompt, []);
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);
            ok(`Agent responded in ${elapsed}s`);
            console.log(`\n  ${BOLD}AI Response:${RESET}`);
            // Pretty-print response, trimmed to 600 chars
            const preview = response.slice(0, 600);
            console.log(`  ${preview}${response.length > 600 ? "\n  [... truncated]" : ""}\n`);
        } catch (err) {
            fail(`Agent error: ${err.message}`);
        }
    }
    divider();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log(`\n${BOLD}${CYAN}VitalMind RAG Test Suite${RESET}`);
    console.log(`${CYAN}Started at: ${new Date().toLocaleTimeString()}${RESET}\n`);

    // 1. Init
    const store = await testVectorStoreInit();
    if (!store) {
        fail("Aborting remaining tests due to store init failure.");
        process.exit(1);
    }

    // 2. Similarity
    await testSimilaritySearch(store);

    // 3. Agent
    await testMedicalAgent();

    header("TEST SUITE COMPLETE");
    ok("All tests finished. Check output above for results.");
    process.exit(0);
}

main().catch((err) => {
    fail(`Unhandled error: ${err.message}`);
    console.error(err);
    process.exit(1);
});
