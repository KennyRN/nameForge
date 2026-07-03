// Name parser utilities

export interface ParsedName {
  original: string;
  parts: string[];
  pattern: string;
}

export function parseName(name: string): ParsedName {
  // Basic name parsing logic
  const parts = name.trim().split(/\s+/);
  const pattern = parts.map(part => {
    // Determine if part is likely a vowel or consonant pattern
    return part.split('').map(char => {
      if (/[aeiou]/i.test(char)) return 'V';
      if (/[^a-z]/i.test(char)) return char;
      return 'C';
    }).join('');
  }).join(' ');

  return {
    original: name,
    parts,
    pattern
  };
}

export function namesToPattern(names: string[]): string[] {
  return names.map(name => parseName(name).pattern);
}