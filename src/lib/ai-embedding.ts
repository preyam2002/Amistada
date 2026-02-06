import OpenAI from "openai";

// Lazy initialization of OpenAI to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set. Cannot generate embedding.");
    return [];
  }

  try {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.replace(/\n/g, " "),
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return [];
  }
}
