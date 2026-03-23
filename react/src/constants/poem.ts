export type PoemLang = "fr" | "en" | "de" | "explain";

/** Georges Castera — "Certitude", formatted in stanzas. */
export const CASTERA_POEM = `Ce n'est pas avec de l'encre que je t'écris
c'est avec ma voix de tambour
assiégé par des chutes de pierres

Je n'appartiens pas au temps des grammairiens
mais à celui de l'éloquence étouffée

Aime-moi comme une maison qui brûle….`;

export const POEM_BUTTONS: { id: PoemLang; flag: string; label: string }[] = [
  { id: "fr",      flag: "🇫🇷", label: "Français" },
  { id: "en",      flag: "🇬🇧", label: "English"  },
  { id: "de",      flag: "🇩🇪", label: "Deutsch"  },
  { id: "explain", flag: "💬",  label: "Analyse"  },
];

export const LANG_LABEL: Record<PoemLang, string> = {
  fr:      "Traduction française",
  en:      "English translation",
  de:      "Deutsche Übersetzung",
  explain: "Analyse littéraire",
};

export const POEM_LANG_MAP: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
};
