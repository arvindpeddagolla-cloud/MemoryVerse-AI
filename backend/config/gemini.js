import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

let genAI = null;
const apiKey = process.env.VITE_GEMINI_API_KEY;

if (apiKey && apiKey !== 'your_gemini_api_key') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Google Gemini API client initialized.');
  } catch (error) {
    console.error('Failed to initialize Google Gemini API:', error.message);
  }
} else {
  console.log('Gemini API Key missing or default. Gemini services running in Local Mock mode.');
}

export { genAI };
