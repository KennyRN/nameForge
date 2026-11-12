// Minimal stand-in for the `obsidian` module so vault-facing helpers can be tested in Node.
export class TAbstractFile {
  constructor(public path: string) {
    this.name = path.split("/").pop() || "";
  }
  name: string;
}
export class TFile extends TAbstractFile {
  extension = "md";
  content = "";
}
export class TFolder extends TAbstractFile {
  children: TAbstractFile[] = [];
}
export class Notice {
  constructor(public message: string) {}
}
export class App {}
export function normalizePath(path: string): string {
  const cleaned = path.replace(/[\\/]+/g, "/").replace(/^\/+|\/+$/g, "");
  return cleaned || "/";
}
export function addIcon(_id: string, _svg: string): void {}
// The recipe host parses and writes YAML through Obsidian; tests only need the names to resolve.
export function parseYaml(text: string): unknown {
  return JSON.parse(text);
}
export function stringifyYaml(value: unknown): string {
  return JSON.stringify(value);
}
