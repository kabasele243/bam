import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const rewriteText = createStep({
  id: 'rewrite-text',
  description: 'Rewrites input text while maintaining approximate word count',
  inputSchema: z.object({
    text: z.string().describe('The original text to rewrite'),
  }),
  outputSchema: z.object({
    rewrittenText: z.string(),
    originalWordCount: z.number(),
    rewrittenWordCount: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('textRewriterAgent');
    if (!agent) {
      throw new Error('Text Rewriter agent not found');
    }

    const originalWordCount = inputData.text.trim().split(/\s+/).length;

    const prompt = `Rewrite the following text while maintaining approximately ${originalWordCount} words (±5% is acceptable).

Original text:
${inputData.text}

Provide ONLY the rewritten text, no explanations.`;

    const response = await agent.generate(prompt);

    const rewrittenText = response.text || '';
    const rewrittenWordCount = rewrittenText.trim().split(/\s+/).length;

    return {
      rewrittenText,
      originalWordCount,
      rewrittenWordCount,
    };
  },
});

const breakIntoScenes = createStep({
  id: 'break-into-scenes',
  description: 'Breaks rewritten text into multiple detailed scenes',
  inputSchema: z.object({
    rewrittenText: z.string(),
    originalWordCount: z.number(),
    rewrittenWordCount: z.number(),
  }),
  outputSchema: z.object({
    scenes: z.string(),
    sceneCount: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('sceneBreakerAgent');
    if (!agent) {
      throw new Error('Scene Breaker agent not found');
    }

    const prompt = `Break the following text into AS MANY distinct, detailed scenes as possible. Each scene should be richly described with visual details.

Text to break into scenes:
${inputData.rewrittenText}

Remember to:
- Maximize the number of scenes
- Provide 2-4 sentences per scene with vivid visual details
- Number each scene (Scene 1, Scene 2, etc.)
- Think cinematically - every significant moment or visual change is a new scene`;

    const response = await agent.generate(prompt);

    const scenesText = response.text || '';
    const sceneCount = (scenesText.match(/Scene \d+:/g) || []).length;

    return {
      scenes: scenesText,
      sceneCount,
    };
  },
});

const generateImagePrompts = createStep({
  id: 'generate-image-prompts',
  description: 'Generates multiple image generation prompts for each scene',
  inputSchema: z.object({
    scenes: z.string(),
    sceneCount: z.number(),
  }),
  outputSchema: z.object({
    imagePrompts: z.string(),
    promptCount: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('imagePromptGeneratorAgent');
    if (!agent) {
      throw new Error('Image Prompt Generator agent not found');
    }

    const prompt = `Generate 3-5 detailed image generation prompts for EACH of the following scenes. Maximize variety and creative interpretations.

Scenes:
${inputData.scenes}

Remember to:
- Create multiple prompt variations per scene (different angles, styles, emphasis)
- Include specific visual details (lighting, mood, composition, camera angle)
- Use professional photography and cinematography terms
- Format as: Scene X - Prompt Y: [detailed prompt]`;

    const response = await agent.generate(prompt);

    const imagePromptsText = response.text || '';
    const promptCount = (imagePromptsText.match(/Scene \d+ - Prompt \d+:/g) || []).length;

    return {
      imagePrompts: imagePromptsText,
      promptCount,
    };
  },
});

const textToImagePromptsWorkflow = createWorkflow({
  id: 'text-to-image-prompts',
  inputSchema: z.object({
    text: z.string().describe('The original text to process'),
  }),
  outputSchema: z.object({
    imagePrompts: z.string(),
    promptCount: z.number(),
  }),
})
  .then(rewriteText)
  .then(breakIntoScenes)
  .then(generateImagePrompts);

textToImagePromptsWorkflow.commit();

export { textToImagePromptsWorkflow };
