export const parseTextToColumns = (text: string): string[][] => {
  const lines = text.split('\n').filter(line => line.trim());
  const result: string[][] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Try to split by common delimiters
    let parts: string[] = [];
    
    // Check for tab separation
    if (trimmedLine.includes('\t')) {
      parts = trimmedLine.split('\t');
    }
    // Check for comma separation
    else if (trimmedLine.includes(',')) {
      parts = trimmedLine.split(',');
    }
    // Check for semicolon separation
    else if (trimmedLine.includes(';')) {
      parts = trimmedLine.split(';');
    }
    // Check for pipe separation
    else if (trimmedLine.includes('|')) {
      parts = trimmedLine.split('|');
    }
    // Check for multiple spaces
    else if (trimmedLine.includes('  ')) {
      parts = trimmedLine.split(/\s{2,}/);
    }
    // Try to separate numbers from text
    else {
      const numberMatch = trimmedLine.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
      if (numberMatch) {
        parts = [numberMatch[1], numberMatch[2]];
      } else {
        const textNumberMatch = trimmedLine.match(/^(.*?)\s+(\d+(?:\.\d+)?)$/);
        if (textNumberMatch) {
          parts = [textNumberMatch[1], textNumberMatch[2]];
        } else {
          // Split at first space if there are multiple words
          const spaceIndex = trimmedLine.indexOf(' ');
          if (spaceIndex > 0) {
            parts = [
              trimmedLine.substring(0, spaceIndex),
              trimmedLine.substring(spaceIndex + 1)
            ];
          } else {
            parts = [trimmedLine];
          }
        }
      }
    }
    
    // Clean up parts
    parts = parts.map(part => part.trim()).filter(part => part);
    
    // Ensure we have at least 2 columns
    while (parts.length < 2) {
      parts.push('');
    }
    
    // Take only first 2 columns
    result.push([parts[0], parts[1]]);
  }
  
  return result;
};

export const detectTextPattern = (text: string): string => {
  if (text.includes('\t')) return 'tab-separated';
  if (text.includes(',')) return 'comma-separated';
  if (text.includes(';')) return 'semicolon-separated';
  if (text.includes('|')) return 'pipe-separated';
  if (text.includes('  ')) return 'space-separated';
  if (/^\d+/.test(text)) return 'number-first';
  return 'mixed-content';
};