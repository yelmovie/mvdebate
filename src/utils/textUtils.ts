/**
 * Text processing utilities
 */

/**
 * Removes markdown code blocks (e.g. ```json ... ```) from a string.
 * Useful for cleaning AI responses that include markdown formatting.
 */
export function cleanMarkdownCodeBlock(text: string): string {
  let cleaned = text.trim();
  // Remove ```json ... ``` or ``` ... ``` blocks
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "");
  cleaned = cleaned.replace(/\n?```\s*$/i, "");
  return cleaned;
}

/**
 * Attempts to extract a JSON object from a string.
 * First tries to parse the cleaned string directly.
 * If that fails, tries to find a JSON-like pattern using regex.
 */
export function extractJson<T = any>(text: string): T | null {
  const cleaned = cleanMarkdownCodeBlock(text);

  // 1. Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Continue to regex extraction
  }

  // 2. Try regex extraction (finds the first {...} block)
  try {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Extraction failed
  }

  return null;
}
