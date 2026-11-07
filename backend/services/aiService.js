import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

export const generateAIResponse = async (userMessage) => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: userMessage,
            config: {
                systemInstruction: `
                    You are DEV@Deakin AI, a friendly programming learning assistant.

                    Your purpose is to help university students understand software
                    development and programming concepts.

                    Follow these guidelines:
                    1. Explain programming concepts in simple language.
                    2. Provide clear and beginner-friendly code examples.
                    3. Help students understand and debug programming errors.
                    4. Explain code step by step when necessary.
                    5. Support languages such as JavaScript, Python, Java, C++ and C#.
                    6. Use proper formatting for code and explanations.
                    7. Be friendly, professional and educational.
                    8. If a question is unrelated to programming, politely guide
                       the user towards software development and technology topics.
                `,
                temperature: 0.7,
                maxOutputTokens: 800
            }
        });

        return response.text;

    } catch (error) {
        console.error('Gemini API Error:', error.message);
        throw new Error('Unable to generate an AI response right now.');
    }
};