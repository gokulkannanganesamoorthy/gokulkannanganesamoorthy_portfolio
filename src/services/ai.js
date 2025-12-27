import { GoogleGenerativeAI } from "@google/generative-ai";
import { professionalData } from "../data";

// Initialize Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let model = null;

if (API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Use Gemini 1.5 Flash for speed and cost effectiveness
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); 
}

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

export const generateAIResponse = async (history, userMessage) => {
    if (!model) {
        console.warn("Gemini API Key missing or invalid.");
        return "I'm currently offline (API Key missing). Please tell Gokul to check his settings! 🛠️";
    }

    try {
        // Create chat session with history
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
                maxOutputTokens: 200, // Keep responses concise
            },
        });

        const result = await chat.sendMessage(userMessage);
        return result.response.text();

    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Oops! My brain circuit jammed. 😵‍💫 (API Error). Try again?";
    }
};
