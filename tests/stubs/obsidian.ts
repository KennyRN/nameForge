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
