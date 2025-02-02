interface LineMetrics {
  wordCount: number;
  charCount: number;
  lines: number;
}

export function getTextMetrics(text: string): LineMetrics {
  const lines = text.split('\n');
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;
  
  return {
    wordCount,
    charCount,
    lines: lines.length
  };
}

export function formatSubtitleText(translatedText: string, originalText: string): string {
  const originalMetrics = getTextMetrics(originalText);
  const translatedWords = translatedText.split(/\s+/).filter(word => word.length > 0);
  
  // If original text was single line, return as is
  if (originalMetrics.lines <= 1) {
    return translatedText;
  }

  // Calculate average words per line from original
  const avgWordsPerLine = Math.ceil(originalMetrics.wordCount / originalMetrics.lines);
  
  // Split translated text into similar line lengths
  const formattedLines: string[] = [];
  let currentLine: string[] = [];
  let currentWordCount = 0;

  for (const word of translatedWords) {
    currentLine.push(word);
    currentWordCount++;

    // When we reach the target words per line, start a new line
    if (currentWordCount >= avgWordsPerLine) {
      formattedLines.push(currentLine.join(' '));
      currentLine = [];
      currentWordCount = 0;
    }
  }

  // Add any remaining words
  if (currentLine.length > 0) {
    formattedLines.push(currentLine.join(' '));
  }

  // If we have more lines than original, merge last lines
  while (formattedLines.length > originalMetrics.lines) {
    const lastLine = formattedLines.pop() || '';
    const previousLine = formattedLines.pop() || '';
    formattedLines.push(`${previousLine} ${lastLine}`.trim());
  }

  // If we have fewer lines than original, split longest line
  while (formattedLines.length < originalMetrics.lines) {
    // Find the longest line
    const longestLineIndex = formattedLines.reduce((maxIndex, current, index, array) => 
      current.length > array[maxIndex].length ? index : maxIndex
    , 0);

    const words = formattedLines[longestLineIndex].split(' ');
    const midPoint = Math.ceil(words.length / 2);

    const firstHalf = words.slice(0, midPoint).join(' ');
    const secondHalf = words.slice(midPoint).join(' ');

    formattedLines.splice(longestLineIndex, 1, firstHalf, secondHalf);
  }

  return formattedLines.join('\n');
}
