// AI enrichment for German words using the Runable AI Gateway
import { createGateway, generateText } from "ai";

const gateway = createGateway({
  baseURL: process.env.AI_GATEWAY_BASE_URL,
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

export interface AIWordEnrichment {
  english: string;                // clear, concise English meaning
  exampleSentence: string | null; // natural German example sentence
  exampleTranslation: string | null; // English translation of example
  notes: string | null;           // usage notes, tips, common phrases
  cefrLevel: string;              // A1/A2/B1/B2/C1/C2 estimate
  ipa: string | null;             // IPA pronunciation e.g. /ˈhʊnt/
}

/**
 * Enrich a German word with AI-generated meaning, examples, notes, and IPA.
 * Falls back gracefully if AI fails.
 */
export async function enrichWordWithAI(
  germanWord: string,
  partOfSpeech: string,
  wiktionaryEnglish: string | null,
): Promise<AIWordEnrichment | null> {
  try {
    const prompt = `You are a German language expert. For the German word "${germanWord}" (${partOfSpeech}), provide:

Return ONLY valid JSON with this exact structure:
{
  "english": "clear, concise English translation (1-5 words, no filler)",
  "exampleSentence": "a natural German sentence using this word",
  "exampleTranslation": "English translation of the example sentence",
  "notes": "1-2 sentence tip about usage, grammar, or common phrases (null if nothing useful)",
  "cefrLevel": "one of: A1, A2, B1, B2, C1, C2",
  "ipa": "IPA pronunciation in slashes e.g. /ˈhʊnt/ (standard German Hochdeutsch)"
}

Rules:
- english: be specific and concise. If multiple meanings, give the most common one.
- exampleSentence: use the word naturally in everyday context
- cefrLevel: A1=very basic, A2=elementary, B1=intermediate, B2=upper-intermediate, C1=advanced, C2=mastery
- ipa: use standard IPA notation with slashes, for Hochdeutsch pronunciation
- Return ONLY the JSON object, no markdown, no extra text`;

    const { text } = await generateText({
      model: gateway("openai/gpt-5.4-mini"),
      prompt,
      maxOutputTokens: 350,
    });

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const data = JSON.parse(jsonMatch[0]);

    return {
      english: data.english || wiktionaryEnglish || germanWord,
      exampleSentence: data.exampleSentence || null,
      exampleTranslation: data.exampleTranslation || null,
      notes: data.notes || null,
      cefrLevel: data.cefrLevel || "B1",
      ipa: data.ipa || null,
    };
  } catch (e) {
    console.error("[AI enrichment] failed:", e);
    return null;
  }
}
