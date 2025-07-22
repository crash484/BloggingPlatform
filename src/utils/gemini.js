import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export async function suggestTitle(blogContent) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Suggest a catchy, relevant blog post title for the following content. Only return the title, no extra text.\n\nContent:\n${blogContent}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().replace(/^"|"$/g, '').trim();
} 