// The Land button (Land brief §6.1): one icon button and menu for a module's biome and terrain,
// shared by every module that uses them.

import { Menu, setIcon } from "obsidian";
import { availableTerrains, type Biome, BIOMES, BRITAIN, findBiome, TERRAIN_CHOICES } from "./biomes";

export interface LandState {
  /** A built-in biome id, a biome pack's path, or undefined for the module's default. */
  biome: string | undefined;
  /** A terrain id, a custom terrain id or "any". */
  terrain: string;
}

export interface LandButtonOptions {
  /** The active module's state, or undefined when it takes no land (the button hides). */
  state: () => LandState | undefined;
  set: (state: LandState) => void;
  /** The module's default biome, as it reads in the menu: "Britain", "Homeland", "Unknown country". */
  defaultLabel: () => string;
  /** Whether the module offers terrain. */
  terrain: () => boolean;
  /** Whether the menu offers biome (tribal names set it in their sentence instead). */
  biome: () => boolean;
  /** The user's biome packs, read when the menu opens (Land brief §9.5). */
  customBiomes: () => Promise<Biome[]>;
  onChange: () => void;
}

export const DEFAULT_LAND: LandState = { biome: undefined, terrain: "any" };

/** The Land button: tooltip "Land: {biome} · {terrain}", active when off the module's default. */
export class LandButton {
  readonly el: HTMLButtonElement;
  private custom: Biome[] = [];

  constructor(
    container: HTMLElement,
    private readonly options: LandButtonOptions,
  ) {
    this.el = container.createEl("button", {
      cls: "nameforge-modal__icon-action nameforge-modal__icon-action--lg",
      attr: { type: "button" },
    });
    setIcon(this.el, "mountain");
    this.el.addEventListener("click", (evt) => void this.open(evt));
    this.refresh();
  }

  /** Shows or hides the button and updates its tooltip and active state. */
  refresh() {
    const state = this.options.state();
    this.el.toggle(!!state);
    if (!state) return;
    const biome = findBiome(state.biome, this.custom);
    const terrain = [...TERRAIN_CHOICES, ...(biome?.customTerrains ?? [])].find((t) => t.id === state.terrain);
    const biomeLabel = biome?.label ?? this.options.defaultLabel();
    const parts = [...(this.options.biome() ? [biomeLabel] : []), ...(this.options.terrain() ? [terrain?.label ?? "Any terrain"] : [])];
    this.el.setAttribute("title", `Land: ${parts.join(" · ")}`);
    this.el.setAttribute("aria-label", `Land: ${parts.join(" · ")}`);
    this.el.toggleClass("is-active", (this.options.biome() && !!state.biome) || state.terrain !== "any");
  }

  private async open(evt: MouseEvent) {
    const state = this.options.state();
    if (!state) return;
    this.custom = await this.options.customBiomes();
    const menu = new Menu();
    const heading = (title: string) => menu.addItem((item) => item.setTitle(title).setDisabled(true));
    const choose = (next: LandState) => {
      this.options.set(next);
      this.refresh();
      this.options.onChange();
    };
    const setBiome = (id: string | undefined) => {
      const biome = findBiome(id, this.custom);
      // A biome without the current terrain resets it to Any (Land brief §2.7).
      const keep = !biome || state.terrain === "any" || availableTerrains(biome).some((t) => t.id === state.terrain);
      choose({ biome: id, terrain: keep ? state.terrain : "any" });
    };
    const withBiome = this.options.biome();
    if (withBiome) heading("Biome");
    const defaultLabel = this.options.defaultLabel();
    if (withBiome) menu.addItem((item) => item.setTitle(defaultLabel).setChecked(!state.biome).onClick(() => setBiome(undefined)));
    if (withBiome) menu.addSeparator();
    // Britain is listed unless it is already the default.
    const builtIn = defaultLabel === BRITAIN.label ? BIOMES : [BRITAIN, ...BIOMES];
    if (withBiome) for (const b of builtIn) menu.addItem((item) => item.setTitle(b.label).setChecked(state.biome === b.id).onClick(() => setBiome(b.id)));
    if (withBiome && this.custom.length > 0) {
      menu.addSeparator();
      heading("Your biomes");
      for (const b of [...this.custom].sort((x, y) => x.label.localeCompare(y.label))) {
        const id = b.custom?.path ?? b.id;
        menu.addItem((item) => item.setTitle(b.label).setChecked(state.biome === id).onClick(() => setBiome(id)));
      }
    }
    if (this.options.terrain()) {
      if (withBiome) menu.addSeparator();
      heading("Terrain");
      const biome = findBiome(state.biome, this.custom);
      const terrains = biome ? availableTerrains(biome) : TERRAIN_CHOICES.filter((t) => t.id !== "any");
      menu.addItem((item) => item.setTitle("Any terrain").setChecked(state.terrain === "any").onClick(() => choose({ ...state, terrain: "any" })));
      for (const t of terrains) {
        menu.addItem((item) => item.setTitle(t.label).setChecked(state.terrain === t.id).onClick(() => choose({ ...state, terrain: t.id })));
      }
    }
    menu.showAtMouseEvent(evt);
  }
}

/** Land brief §6.4: " · desert · mountains" for a history label (biome off default, terrain off Any). */
export function landHistorySuffix(state: LandState | undefined, custom: readonly Biome[] = [], withBiome = true): string {
  if (!state) return "";
  const biome = findBiome(state.biome, custom);
  const terrain = [...TERRAIN_CHOICES, ...(biome?.customTerrains ?? [])].find((t) => t.id === state.terrain && t.id !== "any");
  return `${withBiome && biome ? ` · ${biome.label.toLowerCase()}` : ""}${terrain ? ` · ${terrain.label.toLowerCase()}` : ""}`;
}
