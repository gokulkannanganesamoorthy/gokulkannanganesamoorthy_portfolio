const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

export const submitContactForm = async (data) => {
    if (!ACCESS_KEY || ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
        console.warn("Web3Forms Access Key missing.");
        return { success: false, message: "Missing API Key. Please add VITE_WEB3FORMS_ACCESS_KEY to .env" };
    }

    // Debug Log
    console.log("Contact Service: Submitting form...", { 
        hasKey: !!ACCESS_KEY, 
        keyLength: ACCESS_KEY?.length 
    });

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            mode: "cors", // Explicitly state CORS
            credentials: "omit", // Don't send cookies/auth to external API
            body: JSON.stringify({
                access_key: ACCESS_KEY,
                name: data.name,
                email: data.email,
                message: data.message,
                subject: `New Portfolio Inquiry from ${data.name}`
            }),
        });

        const result = await response.json();

        if (result.success) {
            return { success: true, message: "Message sent successfully!" };
        } else {
            console.error("Web3Forms API Error:", result);
            return { success: false, message: result.message || "Failed to send message." };
        }
    } catch (error) {
        console.error("Web3Forms Network/CORS Error:", error);
        return { success: false, message: "Network error. Likely an AdBlocker or Browser limitation." };
    }
};
