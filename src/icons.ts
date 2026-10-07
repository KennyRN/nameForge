import { addIcon } from "obsidian";

export const ICON_MEEPLE = "nameforge-meeple";
// Obsidian wraps this in its own viewBox="0 0 100 100", so scale the 24-unit icon up to fill it.
const MEEPLE_SVG =
  '<g transform="scale(4.16667)"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20H4a1 1 0 0 1-1-1c0-2 3.378-4.907 4-6c-1 0-4-.5-4-2c0-2 4-3.5 6-4c0-1.5.5-4 3-4s3 2.5 3 4c2 .5 6 2 6 4c0 1.5-3 2-4 2c.622 1.093 4 4 4 6a1 1 0 0 1-1 1h-5c-1 0-2-4-3-4s-2 4-3 4" /></g>';

export const ICON_CREATE_PACKS = "nameforge-create-packs";
const ICON_CREATE_PACKS_SVG = '<g transform="scale(4.16667)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path stroke-linejoin="round" d="M14.186 2.753v3.596c0 .487.194.955.54 1.3a1.85 1.85 0 0 0 1.306.539h4.125" /><path stroke-linejoin="round" d="M20.25 8.568v8.568a4.25 4.25 0 0 1-1.362 2.97a4.28 4.28 0 0 1-3.072 1.14h-7.59a4.3 4.3 0 0 1-3.1-1.124a4.26 4.26 0 0 1-1.376-2.986V6.862a4.25 4.25 0 0 1 1.362-2.97a4.28 4.28 0 0 1 3.072-1.14h5.714a3.5 3.5 0 0 1 2.361.905l2.96 2.722a2.97 2.97 0 0 1 1.031 2.189" /><path stroke-miterlimit="10" d="M11.57 10.424v7.116m-3.55-3.55h7.117" /></g></g>';

export const ICON_PLUS_SQUARE = "nameforge-plus-square";
// Mage Icons — plus-square (Apache 2.0). Scaled for Obsidian's 100×100 viewBox.
const ICON_PLUS_SQUARE_SVG =
  '<g transform="scale(4.16667)"><g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.861V17.14M17.14 12H6.86" /><rect width="18.5" height="18.5" x="2.75" y="2.75" rx="6" /></g></g>';

export const ICON_PREVIOUS_GENERATIONS = "nameforge-previous-generations";
// Mage Icons — clipboard-2 (Apache 2.0). Scaled for Obsidian's 100×100 viewBox.
const ICON_PREVIOUS_GENERATIONS_SVG =
  '<g transform="scale(4.16667)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M16.94 4.697H17c.796 0 1.559.308 2.121.856S20 6.843 20 7.618v9.737a3.84 3.84 0 0 1-1.172 2.754A4.06 4.06 0 0 1 16 21.25H8c-1.06 0-2.078-.41-2.828-1.14A3.84 3.84 0 0 1 4 17.354V7.618c0-.764.308-1.499.857-2.045a3.04 3.04 0 0 1 2.083-.876" /><path d="M15.94 2.75h-8c-.552 0-1 .436-1 .974V5.67c0 .538.448.974 1 .974h8c.552 0 1-.436 1-.974V3.724a.987.987 0 0 0-1-.974m-7.787 8.71h7.694m-7.694 4.398h7.694" /></g></g>';

export const ICON_PACKS = "nameforge-packs";
const ICON_PACKS_SVG = '<g transform="scale(4.16667)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8.593 3.217H4.698A1.95 1.95 0 0 0 2.75 5.164v13.633c0 1.075.872 1.947 1.948 1.947h3.895a1.95 1.95 0 0 0 1.947-1.947V5.164a1.95 1.95 0 0 0-1.947-1.947" /><path d="M6.645 17.379a1.503 1.503 0 1 0 0-3.007a1.503 1.503 0 0 0 0 3.007M10.54 7.93l3.116 11.685a1.95 1.95 0 0 0 2.386 1.373l3.768-.974a1.947 1.947 0 0 0 1.373-2.386L17.658 4.385a1.947 1.947 0 0 0-2.386-1.373l-3.758 1.003c-.406.111-.764.35-1.023.682" /><path d="M16.665 17.241a1.502 1.502 0 1 0 0-3.004a1.502 1.502 0 0 0 0 3.004" /></g></g>';

export const ICON_PLACE_SHAPES = "nameforge-place-shapes";
// Majesticons — map-marker-area-line (MIT). Scaled for Obsidian's 100×100 viewBox.
const ICON_PLACE_SHAPES_SVG =
  '<g transform="scale(4.16667)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M18 16.016c1.245.529 2 1.223 2 1.984c0 1.657-3.582 3-8 3s-8-1.343-8-3c0-.76.755-1.456 2-1.984" /><path d="M17 8.444C17 11.537 12 17 12 17s-5-5.463-5-8.556S9.239 3 12 3s5 2.352 5 5.444" /><circle cx="12" cy="8" r="1" /></g></g>';

export const ICON_GENERIC_PLACE_NAMES = "nameforge-generic-place-names";
// Majesticons — map-marker-area (MIT). Scaled for Obsidian's 100×100 viewBox.
const ICON_GENERIC_PLACE_NAMES_SVG =
  '<g transform="scale(4.16667)"><g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 16.016c1.245.529 2 1.223 2 1.984c0 1.657-3.582 3-8 3s-8-1.343-8-3c0-.76.755-1.456 2-1.984" /><path fill="currentColor" fill-rule="evenodd" d="M11.262 17.675L12 17zm1.476 0l.005-.005l.012-.014l.045-.05l.166-.186a38 38 0 0 0 2.348-2.957c.642-.9 1.3-1.92 1.801-2.933c.49-.99.885-2.079.885-3.086C18 4.871 15.382 2 12 2S6 4.87 6 8.444c0 1.007.395 2.096.885 3.086c.501 1.013 1.16 2.033 1.8 2.933a38 38 0 0 0 2.515 3.143l.045.05l.012.014l.005.005a1 1 0 0 0 1.476 0M12 17l.738.674zm0-11a2 2 0 1 0 0 4a2 2 0 0 0 0-4" clip-rule="evenodd" /></g></g>';

export const ICON_EXPLORATION_PLACE_SHAPES = "nameforge-exploration-place-shapes";
// Ant Design Icons — compass-twotone (MIT). Scaled for Obsidian's 100×100 viewBox.
const ICON_EXPLORATION_PLACE_SHAPES_SVG =
  '<g transform="scale(0.0976563)"><path fill="currentColor" fill-opacity=".15" d="M512 140c-205.4 0-372 166.6-372 372s166.6 372 372 372s372-166.6 372-372s-166.6-372-372-372M327.6 701.7c-2 .9-4.4 0-5.3-2.1c-.4-1-.4-2.2 0-3.2L421 470.9L553.1 603zm375.1-375.1L604 552.1L471.9 420l225.5-98.7c2-.9 4.4 0 5.3 2.1c.4 1 .4 2.1 0 3.2" /><path fill="currentColor" d="M322.3 696.4c-.4 1-.4 2.2 0 3.2c.9 2.1 3.3 3 5.3 2.1L553.1 603L421 470.9zm375.1-375.1L471.9 420L604 552.1l98.7-225.5c.4-1.1.4-2.2 0-3.2c-.9-2.1-3.3-3-5.3-2.1" /><path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372s372 166.6 372 372s-166.6 372-372 372" /></g>';

export const ICON_EMPIRE_EXPANSION_PLACE_SHAPES = "nameforge-empire-expansion-place-shapes";
// Fluent UI System Icons — building-bank-28-filled (MIT). Scaled for Obsidian's 100×100 viewBox.
const ICON_EMPIRE_EXPANSION_PLACE_SHAPES_SVG =
  '<g transform="scale(3.57143)"><path fill="currentColor" d="M13.11 2.293a1.5 1.5 0 0 1 1.78 0l9.497 7.005c1.124.83.598 2.578-.74 2.7H4.353c-1.338-.122-1.863-1.87-.74-2.7zM14 8.999a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m5.5 4h2.499v6h-2.5zm-2 6v-6H15v6zM13 19v-6h-2.5v6zm-4.499 0v-6h-2.5v6zm-2.25 1a3.25 3.25 0 0 0-3.25 3.25v.5a.75.75 0 0 0 .75.751h20.497a.75.75 0 0 0 .75-.75v-.5a3.25 3.25 0 0 0-3.25-3.25z" /></g>';

export const ICON_NAME_AGEING = "nameforge-name-ageing";
// Akar Icons — calendar (MIT). Scaled for Obsidian's 100×100 viewBox.
const ICON_NAME_AGEING_SVG =
  '<g transform="scale(4.16667)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="20" height="18" x="2" y="4" rx="4" /><path d="M8 2v4m8-4v4M2 10h20" /></g></g>';

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

export const ICON_MIX_PACK = "nameforge-mix-pack";
// Fluent UI System Icons — person-tentative 24 filled (MIT). Scaled for Obsidian's 100×100 viewBox.
const ICON_MIX_PACK_SVG = '<g transform="scale(4.16667)"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M11 17.5c0-1.29.376-2.49 1.023-3.501h-7.77a2.25 2.25 0 0 0-2.25 2.25v.908a3.75 3.75 0 0 0 1.306 2.844c1.563 1.343 3.802 2 6.691 2q1.414 0 2.617-.211A6.48 6.48 0 0 1 11 17.5m4-10.495a5 5 0 1 0-10 0a5 5 0 0 0 10 0M17.44 12A5.5 5.5 0 0 0 12 17.44zm-4.322 8.823a5.5 5.5 0 0 1-.826-1.553l6.979-6.979a5.5 5.5 0 0 1 1.553.826zm1.06 1.06a5.5 5.5 0 0 0 1.553.826l6.979-6.978a5.5 5.5 0 0 0-.826-1.553zM23 17.562A5.5 5.5 0 0 1 17.561 23z" /></g>';

export const ICON_SEED_LOCK = "nameforge-seed-lock";
// Mage Icons — lock (Apache 2.0). Scaled for Obsidian's 100×100 viewBox.
const ICON_SEED_LOCK_SVG =
  '<g transform="scale(4.16667)"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9.688H7c-1.38 0-2.5 1.035-2.5 2.312v6.938c0 1.277 1.12 2.312 2.5 2.312h10c1.38 0 2.5-1.035 2.5-2.312V12c0-1.277-1.12-2.312-2.5-2.312m-9.625 0V7.374a4.625 4.625 0 0 1 9.25 0v2.313m-8.094 8.094h6.938" /></g>';

export const ICON_SEED_COPY = "nameforge-seed-copy";
// Mage Icons — copy (Apache 2.0). Scaled for Obsidian's 100×100 viewBox.
const ICON_SEED_COPY_SVG =
  '<g transform="scale(4.16667)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M18.327 7.286h-8.044a1.93 1.93 0 0 0-1.925 1.938v10.088c0 1.07.862 1.938 1.925 1.938h8.044a1.93 1.93 0 0 0 1.925-1.938V9.224c0-1.07-.862-1.938-1.925-1.938" /><path d="M15.642 7.286V4.688c0-.514-.203-1.007-.564-1.37a1.92 1.92 0 0 0-1.361-.568H5.673c-.51 0-1 .204-1.36.568a1.95 1.95 0 0 0-.565 1.37v10.088c0 .514.203 1.007.564 1.37s.85.568 1.361.568h2.685" /></g></g>';

export const ICON_FOLDER = "nameforge-folder";
const ICON_FOLDER_SVG =
  '<g transform="scale(4.16667)"><path d="M0 0h24v24H0z" fill="none" /><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path stroke-miterlimit="10" d="M11.993 10.307v6.874m-3.43-3.437h6.874" /><path stroke-linejoin="round" d="M21.25 9.883v7.698a3.083 3.083 0 0 1-3.083 3.083H5.833a3.083 3.083 0 0 1-3.083-3.083V6.419a3.083 3.083 0 0 1 3.083-3.083h3.084a3.08 3.08 0 0 1 2.57 1.377l.873 1.326a1.75 1.75 0 0 0 1.449.77h4.358a3.084 3.084 0 0 1 3.083 3.074" /></g></g>';

export function registerNameForgeIcons(): void {
  addIcon(ICON_MEEPLE, MEEPLE_SVG);
  addIcon(ICON_CREATE_PACKS, ICON_CREATE_PACKS_SVG);
  addIcon(ICON_PLUS_SQUARE, ICON_PLUS_SQUARE_SVG);
  addIcon(ICON_PREVIOUS_GENERATIONS, ICON_PREVIOUS_GENERATIONS_SVG);
  addIcon(ICON_PACKS, ICON_PACKS_SVG);
  addIcon(ICON_PLACE_SHAPES, ICON_PLACE_SHAPES_SVG);
  addIcon(ICON_GENERIC_PLACE_NAMES, ICON_GENERIC_PLACE_NAMES_SVG);
  addIcon(ICON_EXPLORATION_PLACE_SHAPES, ICON_EXPLORATION_PLACE_SHAPES_SVG);
  addIcon(ICON_EMPIRE_EXPANSION_PLACE_SHAPES, ICON_EMPIRE_EXPANSION_PLACE_SHAPES_SVG);
  addIcon(ICON_NAME_AGEING, ICON_NAME_AGEING_SVG);
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
  addIcon(ICON_MIX_PACK, ICON_MIX_PACK_SVG);
  addIcon(ICON_SEED_LOCK, ICON_SEED_LOCK_SVG);
  addIcon(ICON_SEED_COPY, ICON_SEED_COPY_SVG);
  addIcon(ICON_FOLDER, ICON_FOLDER_SVG);
}
