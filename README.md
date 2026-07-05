# nameForge for Obsidian

Break a list of names into a schema and generate new names, inside Obsidian.

## Installation

1. Clone or copy this repository to your development folder
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin (creates `main.js`)
4. Copy the following files to your Obsidian vault's `.obsidian/plugins/nameforge/` folder:
   - `main.js`
   - `manifest.json`
   - `styles.css`
5. Enable the plugin in Obsidian Settings → Community plugins

## Development

```bash
npm install
npm run dev    # Watch mode for development
npm run build  # Production build
```

On every version bump, update `versions.json` (plugin version → `minAppVersion`) to match `manifest.json` — it must stay in step for community plugin releases.

## License

MIT
