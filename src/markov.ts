// Markov chain name generator

export interface MarkovChain {
  transitions: Map<string, string[]>;
  startTokens: string[];
}

export class ListGenerator {
  private names: string[] = [];

  train(names: string[]): void {
    this.names = names.filter((name) => name.trim().length > 0);
  }

  generateMultiple(count: number): string[] {
    const uniqueNames = Array.from(new Set(this.names));
    if (uniqueNames.length === 0) {
      return [];
    }

    const generated: string[] = [];
    while (generated.length < count) {
      const name = uniqueNames[Math.floor(Math.random() * uniqueNames.length)];
      if (!generated.includes(name)) {
        generated.push(name);
      }
    }

    return generated;
  }
}

export class MarkovGenerator {
  private chain: MarkovChain;
  private order: number;

  constructor(order: number = 2) {
    this.order = order;
    this.chain = {
      transitions: new Map(),
      startTokens: []
    };
  }

  train(names: string[]): void {
    for (const name of names) {
      const normalized = name.toLowerCase().trim();
      if (normalized.length < this.order) continue;

      // Add start token
      this.chain.startTokens.push(normalized.substring(0, this.order));

      // Build transitions
      for (let i = 0; i < normalized.length - this.order; i++) {
        const token = normalized.substring(i, i + this.order);
        const nextChar = normalized[i + this.order];
        
        if (!this.chain.transitions.has(token)) {
          this.chain.transitions.set(token, []);
        }
        this.chain.transitions.get(token)!.push(nextChar);
      }
    }
  }

  generate(maxLength: number = 12): string {
    if (this.chain.startTokens.length === 0) return '';

    let result = this.chain.startTokens[Math.floor(Math.random() * this.chain.startTokens.length)];
    
    while (result.length < maxLength) {
      const token = result.substring(result.length - this.order);
      const nextChars = this.chain.transitions.get(token);
      
      if (!nextChars || nextChars.length === 0) break;
      
      const nextChar = nextChars[Math.floor(Math.random() * nextChars.length)];
      result += nextChar;
    }

    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  generateMultiple(count: number, maxLength: number = 12): string[] {
    const namesSet = new Set<string>();
    
    while (namesSet.size < count) {
      const name = this.generate(maxLength);
      if (name.length >= this.order) {
        namesSet.add(name);
      }
    }

    return Array.from(namesSet);
  }
}