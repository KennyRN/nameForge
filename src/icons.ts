import { addIcon } from "obsidian";

export const ICON_MEEPLE = "nameforge-meeple";
// Obsidian wraps this in its own viewBox="0 0 100 100", so scale the 24-unit icon up to fill it.
const MEEPLE_SVG =
  '<g transform="scale(4.16667)"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20H4a1 1 0 0 1-1-1c0-2 3.378-4.907 4-6c-1 0-4-.5-4-2c0-2 4-3.5 6-4c0-1.5.5-4 3-4s3 2.5 3 4c2 .5 6 2 6 4c0 1.5-3 2-4 2c.622 1.093 4 4 4 6a1 1 0 0 1-1 1h-5c-1 0-2-4-3-4s-2 4-3 4" /></g>';

export const ICON_CREATE_PACKS = "nameforge-create-packs";
const ICON_CREATE_PACKS_SVG = '<g transform="scale(4.16667)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path stroke-linejoin="round" d="M14.186 2.753v3.596c0 .487.194.955.54 1.3a1.85 1.85 0 0 0 1.306.539h4.125" /><path stroke-linejoin="round" d="M20.25 8.568v8.568a4.25 4.25 0 0 1-1.362 2.97a4.28 4.28 0 0 1-3.072 1.14h-7.59a4.3 4.3 0 0 1-3.1-1.124a4.26 4.26 0 0 1-1.376-2.986V6.862a4.25 4.25 0 0 1 1.362-2.97a4.28 4.28 0 0 1 3.072-1.14h5.714a3.5 3.5 0 0 1 2.361.905l2.96 2.722a2.97 2.97 0 0 1 1.031 2.189" /><path stroke-miterlimit="10" d="M11.57 10.424v7.116m-3.55-3.55h7.117" /></g></g>';

export const ICON_BROWSE_PACKS = "nameforge-browse-packs";
const ICON_BROWSE_PACKS_SVG = '<g transform="scale(4.16667)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8.593 3.217H4.698A1.95 1.95 0 0 0 2.75 5.164v13.633c0 1.075.872 1.947 1.948 1.947h3.895a1.95 1.95 0 0 0 1.947-1.947V5.164a1.95 1.95 0 0 0-1.947-1.947" /><path d="M6.645 17.379a1.503 1.503 0 1 0 0-3.007a1.503 1.503 0 0 0 0 3.007M10.54 7.93l3.116 11.685a1.95 1.95 0 0 0 2.386 1.373l3.768-.974a1.947 1.947 0 0 0 1.373-2.386L17.658 4.385a1.947 1.947 0 0 0-2.386-1.373l-3.758 1.003c-.406.111-.764.35-1.023.682" /><path d="M16.665 17.241a1.502 1.502 0 1 0 0-3.004a1.502 1.502 0 0 0 0 3.004" /></g></g>';

export const ICON_DICE = "nameforge-dice";
const ICON_DICE_SVG = '<g transform="scale(6.66667)"><path d="M0 0h15v15H0z" fill="none" /><path fill="currentColor" d="M4.14 1.14c-.68.05-1.33.43-1.7 1.07L.29 5.93c-.59 1.03-.26 2.32.77 2.91l3.72 2.14c.15.09.31.19.47.24V7.47c0-1.76 1.45-3.22 3.21-3.22h1.31c-.18-.26-.41-.5-.7-.67L5.35 1.44c-.39-.22-.8-.33-1.21-.3m.33.76c.6 0 1.12.41 1.28.99c.19.72-.23 1.45-.95 1.64c-.71.19-1.44-.23-1.64-.94c-.19-.72.24-1.45.95-1.64c.12-.04.24-.05.36-.05M2.2 5.84c.6 0 1.12.41 1.28.99c.19.71-.24 1.45-.95 1.64S1.08 8.23.89 7.52s.23-1.45.95-1.64c.11-.03.24-.05.36-.04m6.26-.52c-1.18 0-2.14.96-2.14 2.15v4.28c0 1.19.96 2.15 2.14 2.15h4.29c1.19 0 2.14-.96 2.14-2.15V7.47c0-1.19-.95-2.15-2.14-2.15zm4.29.81c.35 0 .69.14.95.39a1.34 1.34 0 0 1 0 1.89c-.26.26-.6.4-.95.4a1.34 1.34 0 0 1 0-2.68m-4.29 4.28c.36 0 .7.14.95.4c.25.25.39.59.39.94a1.34 1.34 0 0 1-2.68 0c0-.35.14-.69.4-.94c.25-.26.59-.4.94-.4" /></g>';

export const ICON_TEXT_INSERT = "nameforge-text-insert";
const ICON_TEXT_INSERT_SVG = '<g transform="scale(1.78571)"><path d="M0 0h56v56H0z" fill="none" /><path fill="currentColor" d="M33.8 11.36h16.01c1.008 0 1.804-.774 1.804-1.782c0-.984-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.774-1.782 1.758c0 1.008.774 1.781 1.782 1.781M7.083 26.944c1.71 0 2.695-1.195 2.695-3.093v-4.477c0-.516.235-.82.797-.82h6.375v2.343c0 1.852 1.875 2.555 3.281 1.43l6.352-5.062c.96-.774.96-2.11 0-2.86L20.23 9.32c-1.453-1.195-3.28-.469-3.28 1.43v2.438h-6.891c-3.305 0-5.672 2.039-5.672 5.367v5.297c0 1.898.984 3.093 2.695 3.093m26.719-3.304h16.008c1.008 0 1.804-.774 1.804-1.782c0-.984-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.774-1.782 1.758c0 1.008.774 1.782 1.782 1.782M6.168 35.92h43.64a1.786 1.786 0 0 0 1.805-1.78c0-.985-.797-1.758-1.804-1.758H6.168c-1.008 0-1.781.773-1.781 1.758c0 .984.773 1.78 1.78 1.78m0 12.259h43.64c1.008 0 1.805-.774 1.805-1.758s-.797-1.781-1.804-1.781H6.168a1.766 1.766 0 0 0-1.781 1.78c0 .985.773 1.759 1.78 1.759" /></g>';

export const ICON_CHECKLIST_INSERT = "nameforge-checklist-insert";
const ICON_CHECKLIST_INSERT_SVG = '<g transform="scale(4.16667)"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M7.135 3.76a.75.75 0 0 0-.49.299L4.969 6.357l-.694-.68a.75.75 0 0 0-1.06.012a.75.75 0 0 0 .01 1.061l1.312 1.285a.75.75 0 0 0 1.131-.094l2.187-3a.75.75 0 0 0-.164-1.046a.75.75 0 0 0-.556-.135M10 5.25a.75.75 0 0 0-.75.75a.75.75 0 0 0 .75.75h10.25A.75.75 0 0 0 21 6a.75.75 0 0 0-.75-.75ZM3.75 9.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 .75.75h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75ZM4.5 11h2v2h-2zm5.5.25a.75.75 0 0 0-.75.75a.75.75 0 0 0 .75.75h10.25A.75.75 0 0 0 21 12a.75.75 0 0 0-.75-.75ZM3.75 15.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 .75.75h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75ZM4.5 17h2v2h-2zm5.5.25a.75.75 0 0 0-.75.75a.75.75 0 0 0 .75.75h10.25A.75.75 0 0 0 21 18a.75.75 0 0 0-.75-.75Z" /></g>';

export const ICON_BULLET_INSERT = "nameforge-bullet-insert";
const ICON_BULLET_INSERT_SVG = '<g transform="scale(1.78571)"><path d="M0 0h56v56H0z" fill="none" /><path fill="currentColor" d="M7.34 16.762a2.936 2.936 0 0 0 2.953-2.93a2.94 2.94 0 0 0-2.953-2.953a2.956 2.956 0 0 0-2.953 2.953c0 1.617 1.336 2.93 2.953 2.93m10.36-1.055h32.015c1.078 0 1.898-.82 1.898-1.875c0-1.078-.82-1.898-1.898-1.898H17.699c-1.055 0-1.875.82-1.875 1.898a1.85 1.85 0 0 0 1.875 1.875M7.34 30.941a2.94 2.94 0 0 0 2.953-2.953a2.94 2.94 0 0 0-2.953-2.953a2.956 2.956 0 0 0-2.953 2.953a2.956 2.956 0 0 0 2.953 2.953m10.36-1.054h32.015a1.876 1.876 0 0 0 1.898-1.899c0-1.054-.82-1.875-1.898-1.875H17.699c-1.055 0-1.875.82-1.875 1.875s.82 1.899 1.875 1.899M7.34 45.12a2.956 2.956 0 0 0 2.953-2.953a2.94 2.94 0 0 0-2.953-2.953a2.956 2.956 0 0 0-2.953 2.953A2.97 2.97 0 0 0 7.34 45.12m10.36-1.078h32.015c1.078 0 1.898-.82 1.898-1.875c0-1.078-.82-1.898-1.898-1.898H17.699c-1.055 0-1.875.82-1.875 1.898a1.85 1.85 0 0 0 1.875 1.875" /></g>';

export const ICON_CANCEL = "nameforge-cancel";
const ICON_CANCEL_SVG = '<g transform="scale(4.16667)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path stroke-linejoin="round" d="M14.186 2.753v3.596c0 .487.194.955.54 1.3a1.85 1.85 0 0 0 1.306.539h4.125" /><path stroke-linejoin="round" d="M20.25 8.568v8.568a4.25 4.25 0 0 1-1.362 2.97a4.28 4.28 0 0 1-3.072 1.14h-7.59a4.3 4.3 0 0 1-3.1-1.124a4.26 4.26 0 0 1-1.376-2.986V6.862a4.25 4.25 0 0 1 1.362-2.97a4.28 4.28 0 0 1 3.072-1.14h5.714a3.5 3.5 0 0 1 2.361.905l2.96 2.722a2.97 2.97 0 0 1 1.031 2.189" /><path stroke-miterlimit="10" d="m14.51 11.513l-5.03 5.032m-.001-5.021l5.032 5.032" /></g></g>';

export const ICON_SAVE = "nameforge-save";
const ICON_SAVE_SVG = '<g transform="scale(4.16667)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M14.186 2.753v3.596c0 .487.194.955.54 1.3a1.85 1.85 0 0 0 1.306.539h4.125" /><path d="M20.25 8.568v8.568a4.25 4.25 0 0 1-1.362 2.97a4.28 4.28 0 0 1-3.072 1.14h-7.59a4.3 4.3 0 0 1-3.1-1.124a4.26 4.26 0 0 1-1.376-2.986V6.862a4.25 4.25 0 0 1 1.362-2.97a4.28 4.28 0 0 1 3.072-1.14h5.714a3.5 3.5 0 0 1 2.361.905l2.96 2.722a2.97 2.97 0 0 1 1.031 2.189" /><path d="m8.36 13.682l1.879 1.88a.71.71 0 0 0 1.01 0l3.787-3.787" /></g></g>';

export const ICON_BREAKDOWN_PACK = "nameforge-breakdown-pack";
const ICON_BREAKDOWN_PACK_SVG = '<g transform="scale(4.16667)"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M17.755 14a2.25 2.25 0 0 1 2.248 2.25v.918a2.75 2.75 0 0 1-.512 1.598c-1.546 2.164-4.07 3.235-7.49 3.235c-3.422 0-5.945-1.072-7.487-3.236a2.75 2.75 0 0 1-.51-1.596v-.92A2.25 2.25 0 0 1 6.253 14zM12 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10" /></g>';

export const ICON_LIST_PACK = "nameforge-list-pack";
const ICON_LIST_PACK_SVG = '<g transform="scale(4.16667)"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M11 15c0-.35.06-.687.171-1H4.253a2.25 2.25 0 0 0-2.25 2.25v.919c0 .572.18 1.13.511 1.596C4.056 20.929 6.58 22 10 22q.596 0 1.157-.043A3 3 0 0 1 11 21zM10 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10M12 15a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2zm2.5 1a.5.5 0 1 0 0 1h6a.5.5 0 1 0 0-1zm0 3a.5.5 0 1 0 0 1h6a.5.5 0 1 0 0-1z" /></g>';

export const ICON_COMPOUND_BREAKDOWN_PACK = "nameforge-compound-breakdown-pack";
const ICON_COMPOUND_BREAKDOWN_PACK_SVG = '<g transform="scale(4.16667)"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M20.5 12a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5h-4a2.5 2.5 0 0 1-2.5-2.5v-6a2.5 2.5 0 0 1 2.5-2.5zm-7.464 2q-.035.245-.036.5v6c0 .393.065.77.185 1.122q-1.434.377-3.185.379c-3.42 0-5.943-1.072-7.485-3.236a2.75 2.75 0 0 1-.511-1.596v-.92A2.25 2.25 0 0 1 4.253 14zM17 14a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM10 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10" /></g>';

export const ICON_COMPOUND_LIST_PACK = "nameforge-compound-list-pack";
const ICON_COMPOUND_LIST_PACK_SVG = '<g transform="scale(4.16667)"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M20.5 12a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5h-4a2.5 2.5 0 0 1-2.5-2.5v-6a2.5 2.5 0 0 1 2.5-2.5zm-7.464 2q-.035.245-.036.5v1H4.253a.75.75 0 0 0-.75.749v.578c.001.536.192 1.054.54 1.461c1.253 1.468 3.219 2.213 5.957 2.213q1.694-.002 3-.382v.381c0 .394.066.772.185 1.125Q11.752 22 10 22.001c-3.146 0-5.531-.905-7.098-2.74a3.75 3.75 0 0 1-.898-2.434v-.578A2.25 2.25 0 0 1 4.253 14zM17 14a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM10 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10m0 1.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7" /></g>';

export const ICON_PLACE_PACK = "nameforge-place-pack";
const ICON_PLACE_PACK_SVG = '<g transform="scale(4.16667)"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7" /></g>';

export const ICON_SEED_LOCK = "nameforge-seed-lock";
const ICON_SEED_LOCK_SVG = '<g transform="scale(4.16667)"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 10 0v2zm-6-4a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" /></g>';

export const ICON_SEED_COPY = "nameforge-seed-copy";
const ICON_SEED_COPY_SVG = '<g transform="scale(4.16667)"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 16H8V7h11z" /></g>';

export const ICON_FOLDER = "nameforge-folder";
const ICON_FOLDER_SVG = '<g transform="scale(6.25)"><path d="M0 0h16v16H0z" fill="none" /> <path fill="currentColor" d="M11 5a3 3 0 1 1-6 0a3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4a2 2 0 0 0 0 4m.256 7a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1zm3.63-4.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0a1.5 1.5 0 0 0 3 0" /></g>';

export function registerNameForgeIcons(): void {
  addIcon(ICON_MEEPLE, MEEPLE_SVG);
  addIcon(ICON_CREATE_PACKS, ICON_CREATE_PACKS_SVG);
  addIcon(ICON_BROWSE_PACKS, ICON_BROWSE_PACKS_SVG);
  addIcon(ICON_DICE, ICON_DICE_SVG);
  addIcon(ICON_TEXT_INSERT, ICON_TEXT_INSERT_SVG);
  addIcon(ICON_CHECKLIST_INSERT, ICON_CHECKLIST_INSERT_SVG);
  addIcon(ICON_BULLET_INSERT, ICON_BULLET_INSERT_SVG);
  addIcon(ICON_CANCEL, ICON_CANCEL_SVG);
  addIcon(ICON_SAVE, ICON_SAVE_SVG);
  addIcon(ICON_BREAKDOWN_PACK, ICON_BREAKDOWN_PACK_SVG);
  addIcon(ICON_LIST_PACK, ICON_LIST_PACK_SVG);
  addIcon(ICON_COMPOUND_BREAKDOWN_PACK, ICON_COMPOUND_BREAKDOWN_PACK_SVG);
  addIcon(ICON_COMPOUND_LIST_PACK, ICON_COMPOUND_LIST_PACK_SVG);
  addIcon(ICON_PLACE_PACK, ICON_PLACE_PACK_SVG);
  addIcon(ICON_SEED_LOCK, ICON_SEED_LOCK_SVG);
  addIcon(ICON_SEED_COPY, ICON_SEED_COPY_SVG);
  addIcon(ICON_FOLDER, ICON_FOLDER_SVG);
}
