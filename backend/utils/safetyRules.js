/**
 * Safety Rules for Medical Agent
 * Pre-processes user input to block harmful or out-of-scope requests immediately.
 */

const EMERGENCY_KEYWORDS = [
    "suicide",
    "kill myself",
    "end my life",
    "swallowed pills",
    "poison"
];

const OUT_OF_SCOPE_KEYWORDS = [
    "program",
    "code",
    "hack",
    "exploit",
    "bomb",
    "terrorist",
    "weapon",
    "drug deal",
    "politics",
    "movie",
    "song",
    "joke",
    "recipe", // unless nutrition related, but simple filter for now
    "finance",
    "stock",
    "investment"
];

export const checkEmergency = (input) => {
    const normalizedInput = input.toLowerCase();
    return EMERGENCY_KEYWORDS.find(keyword => normalizedInput.includes(keyword));
};

export const checkOutOfScope = (input) => {
    const normalizedInput = input.toLowerCase();
    return OUT_OF_SCOPE_KEYWORDS.find(keyword => normalizedInput.includes(keyword));
};

export const performSafetyCheck = (input) => {
    const normalizedInput = input.toLowerCase();

    // 1. Check for Emergency
    const emergencyMatch = checkEmergency(input);
    if (emergencyMatch) {
        return {
            isSafe: false,
            type: "EMERGENCY",
            message: "⚠️ This sounds like a medical emergency. Please call your local emergency services immediately (e.g., 911, 112, or 108). I am an AI and cannot provide emergency medical assistance."
        };
    }

    // 2. Check for Out-of-Scope
    const outOfScopeMatch = checkOutOfScope(input);
    if (outOfScopeMatch) {
        // Allow some nuance: "recipe" might be "healthy recipe", but for strict safety first:
        // We'll refine this if "healthy code" triggers it, but "code" is in list.
        return {
            isSafe: false,
            type: "OUT_OF_SCOPE",
            message: "I am VitalMind, a focused medical health assistant. I cannot assist with non-health topics. Please ask me about symptoms, treatments, wellness, or nutrition."
        };
    }

    return { isSafe: true };
};
