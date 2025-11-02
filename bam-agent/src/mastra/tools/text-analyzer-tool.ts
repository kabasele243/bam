import { createTool } from '@mastra/core';
import { z } from 'zod';

export const textAnalyzerTool = createTool({
  id: 'text-analyzer-tool',
  description: 'Analyzes text and provides comprehensive statistics including word count, sentence count, character count, and estimated reading time.',
  inputSchema: z.object({
    text: z.string().describe('The text to analyze'),
  }),
  outputSchema: z.object({
    wordCount: z.number(),
    sentenceCount: z.number(),
    characterCount: z.number(),
    characterCountNoSpaces: z.number(),
    paragraphCount: z.number(),
    averageWordsPerSentence: z.number(),
    estimatedReadingTimeMinutes: z.number(),
  }),
  execute: async ({ context }) => {
    const text = context.text.trim();

    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const characterCount = text.length;
    const characterCountNoSpaces = text.replace(/\s/g, '').length;
    const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const averageWordsPerSentence = sentenceCount > 0 ? Math.round((wordCount / sentenceCount) * 10) / 10 : 0;
    const estimatedReadingTimeMinutes = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute

    return {
      wordCount,
      sentenceCount,
      characterCount,
      characterCountNoSpaces,
      paragraphCount,
      averageWordsPerSentence,
      estimatedReadingTimeMinutes,
    };
  },
});
