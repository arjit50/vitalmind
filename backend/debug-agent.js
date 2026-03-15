import dotenv from 'dotenv';
dotenv.config();
import { runMedicalAgent } from './utils/medicalAgent.js';

async function test() {
    console.log("Testing Medical Agent...");
    try {
        const response = await runMedicalAgent("Can I take Paracetamol and Ibuprofen together?", []);
        console.log("RESPONSE:", response);
    } catch (err) {
        console.error("TEST FAILED:", err);
    }
}

test();
