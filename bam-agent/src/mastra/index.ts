
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { textToImagePromptsWorkflow } from './workflows/text-to-image-prompts-workflow';
import { textRewriterAgent } from './agents/text-rewriter-agent';
import { sceneBreakerAgent } from './agents/scene-breaker-agent';
import { imagePromptGeneratorAgent } from './agents/image-prompt-generator-agent';

export const mastra = new Mastra({
  workflows: { textToImagePromptsWorkflow },
  agents: {
    textRewriterAgent,
    sceneBreakerAgent,
    imagePromptGeneratorAgent
  },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false,
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true },
  },
});
