import { createTool } from '@mastra/core';
import { z } from 'zod';

export const sceneCountTool = createTool({
  id: 'scene-count-tool',
  description: 'Counts the number of scenes in a formatted scene breakdown text. Identifies lines starting with "Scene X:".',
  inputSchema: z.object({
    scenesText: z.string().describe('The text containing numbered scenes'),
  }),
  outputSchema: z.object({
    count: z.number().describe('The total number of scenes found'),
    sceneNumbers: z.array(z.number()).describe('Array of scene numbers found'),
  }),
  execute: async ({ context }) => {
    const matches = context.scenesText.match(/Scene (\d+):/g) || [];
    const sceneNumbers = matches.map(match => {
      const num = match.match(/\d+/);
      return num ? parseInt(num[0], 10) : 0;
    });

    return {
      count: matches.length,
      sceneNumbers,
    };
  },
});
