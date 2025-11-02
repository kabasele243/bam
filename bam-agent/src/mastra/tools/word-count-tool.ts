import { createTool } from '@mastra/core';
import { z } from 'zod';

export const wordCountTool = createTool({
  id: 'word-count-tool',
  description: 'Counts the number of words in a text string. Useful for verifying word count constraints.',
  inputSchema: z.object({
    text: z.string().describe('The text to count words in'),
  }),
  outputSchema: z.object({
    count: z.number().describe('The total number of words'),
    text: z.string().describe('The original text'),
  }),
  execute: async ({ context }) => {
    const count = context.text.trim().split(/\s+/).filter(word => word.length > 0).length;
    return {
      count,
      text: context.text,
    };
  },
});
