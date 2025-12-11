import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, CouncilResponse } from "../types";
import { PROMPTS } from "../constants";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    key_insights: {
      type: Type.STRING,
      description: "1-2 sentences summarizing the core issue from multiple angles.",
    },
    recommendations: {
      type: Type.OBJECT,
      properties: {
        immediate_safe: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Actions all experts agree on that are safe to start now.",
        },
        consider: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Low-risk, goal-aligned suggestions worth trying.",
        },
        explore_with_testing: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Suggestions that require lab data before action.",
        },
        avoid: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Specific things to stop or avoid due to safety risks.",
        },
      },
      required: ["immediate_safe", "consider", "explore_with_testing", "avoid"],
    },
    why_experts_differ: {
      type: Type.STRING,
      description: "Brief explanation of philosophical or methodological differences between experts.",
    },
    next_best_step: {
      type: Type.STRING,
      description: "One concrete, single most important next action.",
    },
    disclaimer: {
      type: Type.STRING,
      description: "Mandatory medical disclaimer.",
    },
  },
  required: ["key_insights", "recommendations", "why_experts_differ", "next_best_step", "disclaimer"],
};

export class CouncilService {
  private genAI: GoogleGenAI;

  constructor() {
    const apiKey = process.env.API_KEY || '';
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async consultCouncil(profile: UserProfile, query: string): Promise<CouncilResponse> {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please provide a valid Gemini API Key.");
    }

    const model = "gemini-2.5-flash";

    const systemInstruction = `
      You are the Health Council President supervising a panel of 5 experts. 
      
      Here are your Expert Personas:
      1. [Functional Medicine]: ${PROMPTS.FUNCTIONAL}
      2. [Western Medicine]: ${PROMPTS.WESTERN}
      3. [TCM Practitioner]: ${PROMPTS.TCM}
      4. [Integrative Pharmacist]: ${PROMPTS.PHARMACIST}
      5. [Lifestyle Coach]: ${PROMPTS.LIFESTYLE}

      Your Presidential Mandate: ${PROMPTS.PRESIDENT}

      Task:
      1. Internally simulate the analysis of the User Profile by EACH of the 5 experts.
      2. As President, synthesize their findings.
      3. Return ONLY the JSON response as defined by the schema.
    `;

    const userContext = `
      USER PROFILE:
      Symptoms: ${JSON.stringify(profile.symptoms)}
      Interventions (Meds/Supplements): ${JSON.stringify(profile.interventions)}
      Goals: ${JSON.stringify(profile.goals)}
      Biometrics: ${JSON.stringify(profile.biometrics)}
      Labs: ${JSON.stringify(profile.labs)}

      USER QUERY: "${query}"
    `;

    try {
      const response = await this.genAI.models.generateContent({
        model: model,
        contents: [
          { role: "user", parts: [{ text: userContext }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.3, // Lower temperature for more consistent medical-style advice
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response generated from Council.");
      }

      return JSON.parse(text) as CouncilResponse;
    } catch (error) {
      console.error("Council Error:", error);
      throw error;
    }
  }
}
