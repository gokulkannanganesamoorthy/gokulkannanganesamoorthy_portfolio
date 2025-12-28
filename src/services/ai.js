import { GoogleGenerativeAI } from "@google/generative-ai";
import { professionalData } from "../data";

// Initialize Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;

if (API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    genAI = new GoogleGenerativeAI(API_KEY);
}

// Fallback Chain (Priority: 2.5 Flash -> 2.5 Lite -> 1.5 Flash -> Others)
const MODELS = [
    "gemini-2.5-flash",      // Requested New Model
    "gemini-2.5-flash-lite", // Efficient
    "gemini-1.5-flash",      // Stable Workhorse
    "gemini-2.0-flash-lite", 
    "gemini-1.5-pro"         // High Quality Backup
];

// Helper to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Construct System Prompt from Data
const constructSystemPrompt = () => {
    const projects = professionalData.projects.map(p => `- ${p.title}: ${p.description} (Link: ${p.url})`).join('\n');
    const skills = [...professionalData.resume.languages, ...professionalData.resume.frameworks, ...professionalData.resume.others].join(', ');
    const experience = professionalData.resume.experiences.map(e => `- ${e.position} at ${e.type} (${e.dates}): ${e.bullets.join(' ')}`).join('\n');
    const contacts = professionalData.socials.map(s => `${s.title}: ${s.link}`).join(', ');

    return `
    You are an AI Assistant for Gokul Kannan Ganesamoorthy's portfolio website. 
    Your persona: Friendly, professional, and slightly enthusiastic (like a helpful race engineer).
    keep it short and concise like human conversation
    Key Information about Gokul:
    - Role: Front-End Developer, Full Stack Engineer, Cybersecurity Enthusiast.
    - Location: Coimbatore, India.
    - Education: B.Tech IT at PSG College of Technology.
    - Tagline: Be Pro. Be Beyond.

    Skills: ${skills}

    Projects:
    ${projects}

    Experience:
    ${experience}

    Contact Info:
    ${contacts}

    Guidelines:
    1. Answer questions as if you are his digital assistant.
    2. Be concise. Use Markdown for bolding key terms (e.g., **React**, **VulnScan**).
    3. If asked about contact, direct them to the contact form or email.
    4. If asked about something not in the data, say you don't know but suggest asking about his skills or projects.
    5. Maintain a cool, modern tone.
    `;
};

const getChatResponse = async (modelName, history, userMessage) => {
    if (!genAI) throw new Error("API Key Missing");
    
    const model = genAI.getGenerativeModel({ model: modelName });

    // Note: Gemini history format is { role: "user" | "model", parts: [{ text: "..." }] }
    const chatHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: constructSystemPrompt() }]
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am ready to assist as Gokul's digital portfolio guide." }]
            },
            ...chatHistory
        ],
        generationConfig: {
            maxOutputTokens: 200, 
        },
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
};

export const generateAIResponse = async (history, userMessage) => {
    if (!genAI) {
        console.warn("API Key missing or invalid. Please tell Gokul to check his settings! 🛠️");
        return "I'm currently offline (API Key missing). Please tell Gokul to check his settings! 🛠️";
    }

    for (const modelName of MODELS) {
        try {
            return await getChatResponse(modelName, history, userMessage);
        } catch (error) {
            console.warn(`[AI] Failed with ${modelName}:`, error.message);
            
            // If it's a 429 (Quota) or 503 (Service Unavailable), try next model after a delay
            if (error.message.includes('429') || error.message.includes('503')) {
                await wait(2500); // Wait 2.5s to let quota cool down slightly
                continue; 
            }
            // For other errors (e.g. prompt safety, not found), break or try next if it's a 404
            if (error.message.includes('404')) {
                continue;
            }

            console.error("Non-retriable error:", error);
            break;
        }
    }

    return "Oops! All my brain circuits are busy right now. 😵‍💫\n\nPlease **fill out the contact form** below or **email me directly** — I'll get back to you ASAP!";
};
