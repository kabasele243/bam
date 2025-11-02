import { createTool } from '@mastra/core';
import { z } from 'zod';

export const promptCountTool = createTool({
  id: 'prompt-count-tool',
  description: 'Counts the number of image generation prompts in a formatted prompt text. Identifies lines with "Scene X - Prompt Y:" format.',
  inputSchema: z.object({
    promptsText: z.string().describe('The text containing scene prompts'),
  }),
  outputSchema: z.object({
    totalPrompts: z.number().describe('Total number of prompts found'),
    promptsByScene: z.record(z.number()).describe('Number of prompts per scene'),
    sceneCount: z.number().describe('Number of unique scenes'),
  }),
  execute: async ({ context }) => {
    const matches = context.promptsText.match(/Scene (\d+) - Prompt (\d+):/g) || [];

    const promptsByScene: Record<string, number> = {};

    matches.forEach(match => {
      const sceneMatch = match.match(/Scene (\d+)/);
      if (sceneMatch) {
        const sceneNum = sceneMatch[1];
        promptsByScene[sceneNum] = (promptsByScene[sceneNum] || 0) + 1;
      }
    });

    return {
      totalPrompts: matches.length,
      promptsByScene,
      sceneCount: Object.keys(promptsByScene).length,
    };
  },
});
