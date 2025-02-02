import nlp from 'compromise';
import { SrtBlock } from '../types/subtitles';
import { analyzeContext } from './context-analyzer';

// Common contextual phrases and their meanings
const contextualPhrases: Record<string, { 
  pattern: string | RegExp,
  contexts: Array<{
    indicators: string[],
    meaning: string
  }>
}> = {
  'great': {
    pattern: /\bgreat\b/i,
    contexts: [
      {
        indicators: ['job', 'work', 'done', 'that\'s', 'awesome', 'nice'],
        meaning: 'excellent/good'
      },
      {
        indicators: ['big', 'large', 'huge', 'massive'],
        meaning: 'big'
      }
    ]
  },
  'right': {
    pattern: /\bright\b/i,
    contexts: [
      {
        indicators: ['direction', 'left', 'turn', 'side'],
        meaning: 'direction-right'
      },
      {
        indicators: ['correct', 'true', 'yeah', 'yes', 'okay'],
        meaning: 'correct'
      }
    ]
  },
  'cool': {
    pattern: /\bcool\b/i,
    contexts: [
      {
        indicators: ['temperature', 'cold', 'hot', 'weather'],
        meaning: 'cold'
      },
      {
        indicators: ['awesome', 'nice', 'great', 'wow'],
        meaning: 'good'
      }
    ]
  }
};

// Add more common expressions that need context
const commonExpressions: Record<string, string> = {
  'what\'s up': 'greeting',
  'how\'s it going': 'greeting',
  'you bet': 'agreement',
  'no way': 'disbelief',
  'come on': 'encouragement',
  'got it': 'understanding'
};

function identifyExpressions(text: string): string {
  let enhancedText = text;
  
  // Replace common expressions with their meanings
  for (const [expression, meaning] of Object.entries(commonExpressions)) {
    const regex = new RegExp(expression, 'gi');
    if (regex.test(enhancedText)) {
      enhancedText = enhancedText.replace(regex, `[${meaning}]`);
    }
  }

  return enhancedText;
}

export async function enhanceSubtitleQuality(blocks: SrtBlock[]): Promise<SrtBlock[]> {
  try {
    // First pass: Basic text normalization for each block
    const normalizedBlocks = blocks.map(block => {
      if (!block.text.trim()) {
        return block;
      }

      const doc = nlp(block.text);
      
      // Basic text normalization
      const normalizedText = doc
        .contractions().expand()
        .sentences().toTitleCase()
        .normalize({
          whitespace: true,
          punctuation: true,
          unicode: true,
          contractions: false,
        })
        .text()
        .trim();

      // Basic cleanup
      const cleanedText = normalizedText
        .replace(/\s+/g, ' ')
        .replace(/\.{2,}/g, '...')
        .replace(/--/g, '—')
        .replace(/([.!?])\s*([A-Za-z])/g, '$1 $2')
        .replace(/<[^>]*>/g, '')
        .trim();

      return {
        ...block,
        text: cleanedText || block.text,
      };
    });

    // Second pass: Context analysis with surrounding blocks
    const enhancedBlocks = analyzeContext(normalizedBlocks);

    // Identify and mark common expressions
    const finalBlocks = enhancedBlocks.map(block => ({
      ...block,
      text: identifyExpressions(block.text),
    }));

    return finalBlocks;
  } catch (error) {
    console.error('Error enhancing subtitles:', error);
    return blocks;
  }
}
