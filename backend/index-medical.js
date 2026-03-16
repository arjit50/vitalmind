import dotenv from 'dotenv';
dotenv.config();

import { ingestDocs } from "./utils/ragInit.js";

async function runMedicalIndexer() {
    try {
        console.log("====================================================");
        console.log("   VitalMind: Medical Document Indexing Starting");
        console.log("====================================================");
        
        await ingestDocs();
        
        console.log("====================================================");
        console.log("   ✓ All medical documents have been indexed!");
        console.log("====================================================");
    } catch (err) {
        console.error("Critical error during medical indexing:", err.message);
    }
}

runMedicalIndexer();
