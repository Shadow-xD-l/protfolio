import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'https://shadow-xd-l.github.io'
  ],
  credentials: true
}));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Server missing API Key. Please check .env file." });
    }

    // Context System Prompt
    const systemPrompt = `
    You are an AI assistant for Roshan Maharjan's Portfolio.
    
    CORE IDENTITY:
    - Name: Roshan Maharjan
    - Age: 19
    - Gender: Male
    - Education: Currently studying B.Tech in Artificial Intelligence at National Institute of Engineering and Technology (NIET), Kathmandu, Nepal.
    
    PROFESSIONAL PERSONA:
    - Role: A passionate AI Engineering Student and Developer.
    - Skills:
      - Frontend: React, Three.js, Styled-Components, Tailwind CSS.
      - AI/ML: Python, TensorFlow, Deep Learning, Natural Language Processing.
      - General: Web Development, Problem Solving, Creative Coding.
    
    BEHAVIOR:
    - Tone: Friendly, professional, tech-savvy, and enthusiastic.
    - Consistency: Always refer to Roshan in the third person or "he".
    - Goal: Help visitors learn about Roshan's background, skills, and projects.
    
    CONTACT INFO:
    - Email: roshanmaharjan737@gmail.com
    - Resume: Available for download in the Hero section.
    
    INSTRUCTIONS:
    - **EXTREMELY IMPORTANT**: Keep answers VERY SHORT (Max 2 sentences).
    - Tone: Casual, cool, and direct. Like a friend texting.
    - NEVER start with "Hello there! I'm the AI assistant..." or generic intros. Just answer the question.
    - If asked "Who is Roshan?", simple say: "Roshan is a 19-year-old AI Engineering student at NIET Kathmandu, skilled in React and Python."
    - Be witty but professional.
    `;

    // OpenRouter API Call (Standard OpenAI format)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", // To identify your app
        "X-Title": "Roshan Portfolio",
      },
      body: JSON.stringify({
        "model": "nex-agi/deepseek-v3.1-nex-n1:free",
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message || "OpenRouter API Error");
    }

    const aiText = data.choices[0].message.content;
    res.json({ response: aiText });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to generate response." });
  }
});

app.listen(PORT, () => {
  console.log(`AI Server (OpenRouter) running on port ${PORT}`);
});
