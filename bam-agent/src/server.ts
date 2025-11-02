import 'dotenv/config';
import express, { Request, Response } from 'express';
import { mastra } from './mastra/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Workflow execution endpoint
app.post('/api/generate-prompts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      res.status(400).json({
        error: 'Invalid input',
        message: 'Request body must contain a "text" field with a string value',
      });
      return;
    }

    if (text.trim().length === 0) {
      res.status(400).json({
        error: 'Invalid input',
        message: 'Text cannot be empty',
      });
      return;
    }

    console.log(`Processing text (${text.split(/\s+/).length} words)...`);

    // Execute workflow
    const workflow = mastra.getWorkflow('textToImagePromptsWorkflow');
    if (!workflow) {
      res.status(500).json({
        error: 'Workflow not found',
        message: 'textToImagePromptsWorkflow is not registered',
      });
      return;
    }

    // Create and start workflow run
    const run = await workflow.createRunAsync();
    const result = await run.start({
      inputData: { text },
    });

    if (result.status !== 'success') {
      res.status(500).json({
        error: 'Workflow execution failed',
        message: 'status' in result ? result.status : 'Unknown error',
      });
      return;
    }

    // Parse and format prompts by scene
    const promptText = result.result.imagePrompts;
    const scenes: Record<string, Array<{ prompt: string; number: number }>> = {};

    // Parse prompts into scenes
    const lines = promptText.split('\n').filter((line: string) => line.trim());
    lines.forEach((line: string) => {
      const match = line.match(/^-?\s*Scene (\d+) - Prompt (\d+):\s*(.+)$/);
      if (match) {
        const [, sceneNum, promptNum, promptText] = match;
        const sceneKey = `scene_${sceneNum}`;

        if (!scenes[sceneKey]) {
          scenes[sceneKey] = [];
        }

        scenes[sceneKey].push({
          number: parseInt(promptNum),
          prompt: promptText.trim(),
        });
      }
    });

    console.log(`Generated ${result.result.promptCount} image prompts across ${Object.keys(scenes).length} scenes`);

    // Return results
    res.json({
      success: true,
      data: {
        scenes,
        totalScenes: Object.keys(scenes).length,
        totalPrompts: result.result.promptCount,
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist',
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
