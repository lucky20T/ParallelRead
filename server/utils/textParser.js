exports.splitIntoSentences = (text) => {
  if (!text) return [];

  // Replace multiple newlines/spaces with a single space
  const cleanedText = text.replace(/[\r\n]+/g, ' ').trim();
  
  // Basic regex to match sentences ending in . ! ? including the punctuation
  const segments = cleanedText.match(/[^.!?]+[.!?]+/g) || [];
  
  let allSentences = segments.map(s => s.trim()).filter(s => s.length > 0);
  
  // If the text didn't contain ending punctuation, just return the whole text
  if (allSentences.length === 0 && cleanedText.length > 0) {
    allSentences = [cleanedText];
  } else {
    // Check if there is leftover text without punctuation at the end
    const matchedLength = allSentences.join(' ').length;
    if (matchedLength < cleanedText.length) {
      // Find the last punctuation and append the rest
      const lastPunctuationIndex = Math.max(
        cleanedText.lastIndexOf('.'), 
        cleanedText.lastIndexOf('!'), 
        cleanedText.lastIndexOf('?')
      );
      if (lastPunctuationIndex !== -1 && lastPunctuationIndex < cleanedText.length - 1) {
        const leftover = cleanedText.substring(lastPunctuationIndex + 1).trim();
        if (leftover.length > 0) {
          allSentences.push(leftover);
        }
      }
    }
  }

  return allSentences;
};
