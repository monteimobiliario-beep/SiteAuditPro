import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeWebsite(url: string) {
  const prompt = `
    Perform a professional and extremely detailed website analysis for the following URL: ${url}
    
    The analysis must cover these blocks:
    1. GENERAL OVERVIEW (Objective, target audience, clarity, credibility score 0-10)
    2. DESIGN & VISUAL EXPERIENCE (Professionalism, layout, colors, typography, mobile vs desktop, score 0-10)
    3. UX ANALYSIS (Navigation, scanability, trust, score 0-10)
    4. MOBILE ANALYSIS (Responsiveness, legibility, score 0-10)
    5. PERFORMANCE & SPEED (Perceived speed, bottlenecks, practical improvements)
    6. SEO ON-PAGE (Titles, headings, keywords, URLs, score 0-10)
    7. SEO TECHNICAL (Indexation, sitemap, robots, security, score 0-10)
    8. CONTENT ANALYSIS (Utility, authority, depth, score 0-10)
    9. CONVERSION ANALYSIS (CTAs, lead capture, value prop, score 0-10)
    10. TRUST & AUTHORITY (About page, contact, social proof, score 0-10)
    11. TRAFFIC ESTIMATE (Qualitative estimate of organic potential)
    12. COMPETITION (Comparison with niche standards)
    13. MAIN PROBLEMS (Top 10 issues with impact and fixes)
    14. MAIN OPPORTUNITIES (Top 10 growth opportunities)
    15. PRIORITIZED ACTION PLAN (Phase 1: Immediate, Phase 2: Structural, Phase 3: Long-term)
    16. FINAL CHECKLIST
    17. FINAL SCORES (Visual, UX, Mobile, SEO, Content, Conversion, Authority, Growth, General)
    18. EXECUTIVE SUMMARY

    Be specific, technical, and practical. Use Markdown for formatting.
    If you cannot access the site directly, use your knowledge and search capabilities to provide the most accurate analysis possible based on public information.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze the website. Please check the URL and try again.");
  }
}
