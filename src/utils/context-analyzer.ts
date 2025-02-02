import { NlpManager } from 'node-nlp';
import { SrtBlock } from '../types/subtitles';

// Initialize NLP manager with English language
const manager = new NlpManager({ languages: ['en'], forceNER: true });

// Train the manager with common contextual phrases
async function trainManager() {
  // Context: Positive/Good
  manager.addDocument('en', 'That was great', 'context.positive');
  manager.addDocument('en', 'Great job', 'context.positive');
  manager.addDocument('en', 'You did great', 'context.positive');
  manager.addDocument('en', 'This is great news', 'context.positive');
  manager.addDocument('en', 'That\'s great', 'context.positive');
  
  // Context: Size/Big
  manager.addDocument('en', 'A great big house', 'context.size');
  manager.addDocument('en', 'The great wall', 'context.size');
  manager.addDocument('en', 'A great distance', 'context.size');
  manager.addDocument('en', 'The great mountains', 'context.size');

  // Common expressions
  manager.addDocument('en', "what's up", 'expression.greeting');
  manager.addDocument('en', "how's it going", 'expression.greeting');
  manager.addDocument('en', "you bet", 'expression.agreement');
  manager.addDocument('en', "no way", 'expression.disbelief');
  manager.addDocument('en', "come on", 'expression.encouragement');
  manager.addDocument('en', "got it", 'expression.understanding');

  // Temperature context
  manager.addDocument('en', 'It\'s cool outside', 'context.temperature');
  manager.addDocument('en', 'The weather is cool', 'context.temperature');
  manager.addDocument('en', 'Cool breeze', 'context.temperature');

  // Positive cool
  manager.addDocument('en', 'That\'s cool', 'context.positive');
  manager.addDocument('en', 'Cool idea', 'context.positive');
  manager.addDocument('en', 'This is so cool', 'context.positive');

  // British expressions
  manager.addDocument('en', 'bloody hell', 'expression.british_frustration');
  manager.addDocument('en', 'bloody thing', 'expression.british_frustration');
  manager.addDocument('en', 'bloody mess', 'expression.british_frustration');
  manager.addDocument('en', 'bloody divorce', 'expression.british_frustration');
  manager.addDocument('en', 'bloody idiot', 'expression.british_frustration');
  
  // Idioms about information/secrets
  manager.addDocument('en', 'dig up dirt', 'idiom.find_secrets');
  manager.addDocument('en', 'dig up information', 'idiom.find_secrets');
  manager.addDocument('en', 'find dirt on', 'idiom.find_secrets');
  manager.addDocument('en', 'get dirt on', 'idiom.find_secrets');
  manager.addDocument('en', 'have dirt on', 'idiom.find_secrets');

  // Phrasal verbs
  manager.addDocument('en', 'back off from', 'phrasal.withdraw');
  manager.addDocument('en', 'back off the case', 'phrasal.withdraw');
  manager.addDocument('en', 'back away from', 'phrasal.withdraw');
  manager.addDocument('en', 'back down from', 'phrasal.withdraw');

  // Expressions about harm/damage
  manager.addDocument('en', 'going to ruin me', 'context.harm');
  manager.addDocument('en', 'will ruin me', 'context.harm');
  manager.addDocument('en', 'destroy me', 'context.harm');
  manager.addDocument('en', 'finish me', 'context.harm');

  // Train the model
  await manager.train();
}

// Initialize the manager
let isInitialized = false;
async function initializeManager() {
  if (!isInitialized) {
    await trainManager();
    isInitialized = true;
  }
}

export async function analyzeContext(blocks: SrtBlock[]): Promise<SrtBlock[]> {
  await initializeManager();

  return Promise.all(blocks.map(async (block, index) => {
    if (!block.text.trim()) {
      return block;
    }

    try {
      // Get context from surrounding blocks
      const surroundingText = [
        index > 0 ? blocks[index - 1].text : '',
        block.text,
        index < blocks.length - 1 ? blocks[index + 1].text : ''
      ].filter(Boolean).join(' ');

      // Process the text with NLP manager
      const result = await manager.process('en', surroundingText);

      // Get the classified context
      const context = result.intent;
      const score = result.score;

      if (score > 0.5) { // Only apply context if confidence is high enough
        // Add context hints to ambiguous words
        let enhancedText = block.text;
        
        // Handle "great"
        if (/\bgreat\b/i.test(enhancedText)) {
          const meaning = context.includes('size') ? 'big' : 'excellent';
          enhancedText = enhancedText.replace(
            /\bgreat\b/gi,
            `great[${meaning}:${Math.round(score * 100)}%]`
          );
        }

        // Handle "cool"
        if (/\bcool\b/i.test(enhancedText)) {
          const meaning = context.includes('temperature') ? 'cold' : 'good';
          enhancedText = enhancedText.replace(
            /\bcool\b/gi,
            `cool[${meaning}:${Math.round(score * 100)}%]`
          );
        }

        // Handle common expressions
        if (context.startsWith('expression.')) {
          const expressionType = context.split('.')[1];
          enhancedText = `${enhancedText}[${expressionType}]`;
        }

        // Handle British expressions
        if (/\bbloody\b/i.test(enhancedText) && context === 'expression.british_frustration') {
          enhancedText = enhancedText.replace(
            /\bbloody\b/gi,
            'bloody[british_expression:frustration]'
          );
        }

        // Handle information/secrets idioms
        if (/\bdirt\b/i.test(enhancedText) && context === 'idiom.find_secrets') {
          enhancedText = enhancedText.replace(
            /\bdirt\b/gi,
            'dirt[compromising_information]'
          );
        }

        // Handle phrasal verbs
        if (/\bback off\b/i.test(enhancedText) && context === 'phrasal.withdraw') {
          enhancedText = enhancedText.replace(
            /\bback off\b/gi,
            'back off[withdraw/retreat]'
          );
        }

        // Handle harm context
        if (/\bruin\b/i.test(enhancedText) && context === 'context.harm') {
          enhancedText = enhancedText.replace(
            /\bruin\b/gi,
            'ruin[destroy_reputation]'
          );
        }

        return {
          ...block,
          text: enhancedText
        };
      }

      return block;
    } catch (error) {
      console.error('Error analyzing context:', error);
      return block;
    }
  }));
}
