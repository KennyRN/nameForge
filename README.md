# nameForge for Obsidian

Feed it a list of names you love, let it work out the Markov Magic, and generate fresh names right inside Obsidian in that *very same style*. (Offline, no AI, no internet connection, so you'll not end up getting distracted and start hoovering the dogs...)

Feed nameForge a list of source names (characters, places, clans—anything), and it learns the letter patterns of that list and generates new names in the same style. Names for an Anglo-Saxon village produce more Anglo-Saxon-sounding villages; names from your own invented culture produce more of *that*. Everything runs locally using its statistical Markov Magic Model built fresh from your list each time: your names never leave your vault.

Built by a worldbuilder, for worldbuilders.

## Features

- **Four pack types** for different naming jobs:
  - **Breakdown** — learns letter patterns from your list and invents new names in that style. The core generator.
  - **List** — picks names verbatim from your list at random, no repeats. For when you've already written the names and just want a dice roll.
  - **Compound** — builds names from 2 or 3 independent parts, either fused into one word (*Wulf* + *stan* → **Wulfstan**) or kept separate (*Lofty* + *Tiger* → **Lofty Tiger**). Each part can use breakdown generation or verbatim picks.
  - **Place** — specialised for settlement names. Recognises toponymic endings (-ford, -wich, -stowe, -ton and dozens more, plus any invented endings that recur in your list), keeps them intact, and generates only the first element — so results read like real places, not letter soup. Learns multi-word patterns too ("Great …", "…-on-…") and reproduces them in proportion.
- **Reproducible batches.** Every generation shows its seed. Copy it, lock it, and the same seed with the same pack and settings regenerates the identical batch; today or next year.
- **Generation history.** The last 50 generations (timestamp, seed, pack) are logged to a plain markdown config file in your vault, so a batch you liked last week can be recovered.
- **Direct insertion.** Click names to select them, then insert into the active note as plain text, a bullet list, or a checklist — cursor-aware, so it never splits your text mid-line.
- **Tuning sliders.** *Faithfulness* controls how closely output hugs the source style; *Strictness* controls how fussy the generator is about accepting a candidate.
- **Forgiving input.** Paste names one per line, comma-separated, as bullets, wikilinks, or a mix — NameWright tidies them up.
- **Plain markdown storage.** Packs and configuration are ordinary `.md` files with frontmatter. They sync with your vault, diff cleanly in git, and can be edited by hand.

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

## Releasing

Releases are built and published by [`.github/workflows/release.yml`](.github/workflows/release.yml), not uploaded by hand. Pushing a tag (e.g. `1.0.1`, matching the version in `manifest.json`) triggers the workflow, which builds `main.js` from source and publishes a GitHub release containing `main.js`, `manifest.json`, and `styles.css`, along with a [build provenance attestation](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/using-artifact-attestations-to-establish-provenance-for-builds) for each asset so users can verify they were built from this repository.

```bash
git tag 1.0.1
git push origin 1.0.1
```

## License

MIT
