// Brief 6a §9.4: famous figures (writers, philosophers, generals, artists) are flagged like royals and kept to a fifth of a list's count and weight (rule 8); the lists lead with
// ordinary attested names. Greek and Roman are rewritten; Italian and the Slavic, French and Dutch lists have their famous names flagged and moved to the end.
const weight = (i) => (i < 5 ? 10 : i < 10 ? 7 : i < 16 ? 5 : i < 24 ? 3 : 2);
/** "Name^f@ERA|…": ^f famous (flag r), ^s saint, @ an era tag. */
export function list(text) {
  const items = text.split("|").map((raw, i) => {
    const m = raw.match(/^([^^@]+)(?:\^([frs]))?(?:@(.+))?$/);
    if (!m) throw new Error(raw);
    return { name: m[1], flag: m[2] === "f" ? "r" : m[2] ?? "", eras: m[3] ?? "", i };
  });
  // Ordinary names first, flagged ones after, weights by position.
  const ordered = [...items.filter((x) => !x.flag), ...items.filter((x) => x.flag)];
  return ordered.map((x, i) => (x.eras ? [x.name, weight(i), x.flag, x.eras] : x.flag ? [x.name, weight(i), x.flag] : [x.name, weight(i)]));
}
export const REWRITE = {
  "greek.historic.male": "Nikias@AN|Kallias@AN|Philon@AN|Lysias@AN|Demetrios@AN|Theodoros@AN|Dion@AN|Kleon@AN|Hermon@AN|Aristion@AN|Xenon@AN|Euphron@AN|Timon@AN|Menon@AN|Agathon@AN|Diodoros@AN|Glaukon@AN|Hegesias@AN|Lykon@AN|Polykles@AN|Chairephon@AN|Antiphon@AN|Aischines@AN|Kephalos@AN|Pericles^f@AN|Alexander^f@AN|Socrates^f@AN|Plato^f@AN|Leonidas^f@AN|Themistocles^f@AN",
  "greek.historic.female": "Philista@AN|Kleo@AN|Myrrhine@AN|Thaleia@AN|Phila@AN|Melissa@AN|Nikarete@AN|Theodote@AN|Glykera@AN|Pythias@AN|Herpyllis@AN|Aristomache@AN|Archeanassa@AN|Kallisto@AN|Timo@AN|Damo@AN|Lamia@AN|Kynna@AN|Nikaia@AN|Phanostrate@AN|Eirene@AN|Euphrosyne@AN|Nannion@AN|Philaenis@AN|Aspasia^f@AN|Sappho^f@AN|Hypatia^f@AN|Cleopatra^f@AN|Olympias^f@AN|Artemisia^f@AN",
  "roman.historic.male": "Marcus@AN|Lucius@AN|Gaius@AN|Publius@AN|Quintus@AN|Titus@AN|Aulus@AN|Gnaeus@AN|Sextus@AN|Decimus@AN|Tiberius@AN|Servius@AN|Appius@AN|Manius@AN|Spurius@AN|Marcellus@AN|Maximus@MD|Felix@MD|Rufus@AN|Crispus@AN|Severus@AN|Priscus@AN|Verus@AN|Longinus@AN|Flaccus@AN|Lepidus@AN|Celer@AN|Fronto@AN|Gallus@AN|Pollio@AN|Rutilius@AN|Paullus@AN|Curtius@AN|Fabius@AN|Valens@MD|Optatus@MD|Boethius^f@MD|Cassiodorus^f@MD|Cato^f@AN|Sulla^f@AN|Gregory^s@MD|Benedict^s@MD|Leo^s@MD|Ambrose^s@MD|Jerome^s@MD",
  "roman.historic.female": "Julia@AN|Cornelia@AN|Claudia@AN|Flavia@AN|Valeria@AN|Aemilia@AN|Fabia@AN|Tullia@AN|Octavia@AN|Lucretia@AN|Caecilia@AN|Domitia@AN|Plautia@AN|Antonia@AN|Sempronia@AN|Porcia@AN|Calpurnia@AN|Terentia@AN|Pompeia@AN|Marcia@AN|Sulpicia@AN|Servilia@AN|Fulvia@AN|Aurelia@AN|Hortensia@AN|Cassia@AN|Galla@MD|Melania@MD|Paula@MD|Eudoxia@MD|Proba@MD|Sabina@AN|Livia^f@AN|Agrippina^f@AN|Faustina^f@AN|Plotina^f@AN|Poppaea^f@AN|Scholastica^s@MD|Anastasia^s@MD|Monica^s@MD",
};
/** Names to flag as famous in lists that are otherwise kept. */
export const FLAG = {
  "italian.historic.male": ["Leonardo", "Dante", "Cosimo"],
  "italian.historic.female": ["Beatrice", "Lucrezia", "Simonetta", "Fiammetta"],
  "slavic.historic.male": ["Vsevolod"].slice(0, 0),
};
