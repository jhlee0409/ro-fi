import type { APIRoute } from 'astro';
import { createStoryGenerator } from '../../lib/ai-unified-generator';

export const POST: APIRoute = async ({ request }) => {
  try {
    const generator = createStoryGenerator();
    
    if (!generator) {
      return new Response(JSON.stringify({ 
        error: 'AI Story Generator is not configured. Please check ANTHROPIC_API_KEY.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { action, ...options } = body;

    let result;

    switch (action) {
      case 'generate-plot':
        result = await generator.generatePlotOutline(options.title, options.tropes);
        break;
        
      case 'generate-chapter':
        result = await generator.generateChapter(options);
        break;
        
      case 'improve-chapter':
        result = await generator.improveChapter(options.originalChapter, options.improvementCriteria);
        break;
        
      case 'generate-characters':
        result = await generator.generateCharacterProfiles(options.title, options.tropes);
        break;
        
      default:
        return new Response(JSON.stringify({ 
          error: 'Invalid action. Supported actions: generate-plot, generate-chapter, improve-chapter, generate-characters' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: result 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Story generation error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Story generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};