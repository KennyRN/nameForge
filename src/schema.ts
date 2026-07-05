// Schema types and utilities

export interface NameSchema {
  name: string;
  type: string;
  created: string;
  count: number;
  names: string[];
}

export interface SchemaFrontmatter {
  nameforge: string;
  type: string;
  name: string;
  created: string;
  count: number;
}

export function parseSchemaNote(content: string): NameSchema | null {
  // Parse markdown schema note
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) {
    return null;
  }

  const frontmatter: Record<string, string> = {};
  const lines = frontmatterMatch[1].split('\n');
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim();
      frontmatter[key.trim()] = value;
    }
  }

  // Extract names from ## Names section
  const namesMatch = content.match(/## Names\s*([\s\S]*?)(?=\n#|\n---|$)/);
  const names: string[] = [];
  
  if (namesMatch) {
    const nameLines = namesMatch[1].split('\n');
    for (const line of nameLines) {
      const match = line.match(/^-\s*(.+)$/);
      if (match) {
        names.push(match[1].trim());
      }
    }
  }

  return {
    name: frontmatter.name || 'Unnamed',
    type: frontmatter.type || 'breakdown',
    created: frontmatter.created || new Date().toISOString().split('T')[0],
    count: parseInt(frontmatter.count || '0', 10),
    names
  };
}

export function createSchemaNote(schema: NameSchema): string {
  return `---
nameforge: schema
type: ${schema.type}
name: ${schema.name}
created: ${schema.created}
count: ${schema.count}
---

# ${schema.name}

## Names

${schema.names.map(name => `- ${name}`).join('\n')}
`;
}