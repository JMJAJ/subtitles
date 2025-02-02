import { classNameFactory } from "@api/Styles";

export const GoogleLanguages = {
    "auto": "Detect language",
    "af": "Afrikaans",
    "sq": "Albanian",
    "am": "Amharic",
    "ar": "Arabic",
    "hy": "Armenian",
    "as": "Assamese",
    "ay": "Aymara",
    "az": "Azerbaijani",
    "bm": "Bambara",
    "eu": "Basque",
    "be": "Belarusian",
    "bn": "Bengali",
    "bho": "Bhojpuri",
    "bs": "Bosnian",
    "bg": "Bulgarian",
    "ca": "Catalan",
    "ceb": "Cebuano",
    "ny": "Chichewa",
    "zh-CN": "Chinese (Simplified)",
    "zh-TW": "Chinese (Traditional)",
    "co": "Corsican",
    "hr": "Croatian",
    "cs": "Czech",
    "da": "Danish",
    "dv": "Dhivehi",
    "doi": "Dogri",
    "nl": "Dutch",
    "en": "English",
    "eo": "Esperanto",
    "et": "Estonian",
    "ee": "Ewe",
    "tl": "Filipino",
    "fi": "Finnish",
    "fr": "French",
    "fy": "Frisian",
    "gl": "Galician",
    "ka": "Georgian",
    "de": "German",
    "el": "Greek",
    "gn": "Guarani",
    "gu": "Gujarati",
    "ht": "Haitian Creole",
    "ha": "Hausa",
    "haw": "Hawaiian",
    "iw": "Hebrew",
    "hi": "Hindi",
    "hmn": "Hmong",
    "hu": "Hungarian",
    "is": "Icelandic",
    "ig": "Igbo",
    "ilo": "Ilocano",
    "id": "Indonesian",
    "ga": "Irish",
    "it": "Italian",
    "ja": "Japanese",
    "jw": "Javanese",
    "kn": "Kannada",
    "kk": "Kazakh",
    "km": "Khmer",
    "rw": "Kinyarwanda",
    "gom": "Konkani",
    "ko": "Korean",
    "kri": "Krio",
    "ku": "Kurdish (Kurmanji)",
    "ckb": "Kurdish (Sorani)",
    "ky": "Kyrgyz",
    "lo": "Lao",
    "la": "Latin",
    "lv": "Latvian",
    "ln": "Lingala",
    "lt": "Lithuanian",
    "lg": "Luganda",
    "lb": "Luxembourgish",
    "mk": "Macedonian",
    "mai": "Maithili",
    "mg": "Malagasy",
    "ms": "Malay",
    "ml": "Malayalam",
    "mt": "Maltese",
    "mi": "Maori",
    "mr": "Marathi",
    "mni-Mtei": "Meiteilon (Manipuri)",
    "lus": "Mizo",
    "mn": "Mongolian",
    "my": "Myanmar (Burmese)",
    "ne": "Nepali",
    "no": "Norwegian",
    "or": "Odia (Oriya)",
    "om": "Oromo",
    "ps": "Pashto",
    "fa": "Persian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pa": "Punjabi",
    "qu": "Quechua",
    "ro": "Romanian",
    "ru": "Russian",
    "sm": "Samoan",
    "sa": "Sanskrit",
    "gd": "Scots Gaelic",
    "nso": "Sepedi",
    "sr": "Serbian",
    "st": "Sesotho",
    "sn": "Shona",
    "sd": "Sindhi",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenian",
    "so": "Somali",
    "es": "Spanish",
    "su": "Sundanese",
    "sw": "Swahili",
    "sv": "Swedish",
    "tg": "Tajik",
    "ta": "Tamil",
    "tt": "Tatar",
    "te": "Telugu",
    "th": "Thai",
    "ti": "Tigrinya",
    "ts": "Tsonga",
    "tr": "Turkish",
    "tk": "Turkmen",
    "ak": "Twi",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "ug": "Uyghur",
    "uz": "Uzbek",
    "vi": "Vietnamese",
    "cy": "Welsh",
    "xh": "Xhosa",
    "yi": "Yiddish",
    "yo": "Yoruba",
    "zu": "Zulu"
} as const;

export const DeeplLanguages = {
    "": "Detect language",
    "ar": "Arabic",
    "bg": "Bulgarian",
    "zh-hans": "Chinese (Simplified)",
    "zh-hant": "Chinese (Traditional)",
    "cs": "Czech",
    "da": "Danish",
    "nl": "Dutch",
    "en-us": "English (American)",
    "en-gb": "English (British)",
    "et": "Estonian",
    "fi": "Finnish",
    "fr": "French",
    "de": "German",
    "el": "Greek",
    "hu": "Hungarian",
    "id": "Indonesian",
    "it": "Italian",
    "ja": "Japanese",
    "ko": "Korean",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "nb": "Norwegian",
    "pl": "Polish",
    "pt-br": "Portuguese (Brazilian)",
    "pt-pt": "Portuguese (European)",
    "ro": "Romanian",
    "ru": "Russian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "es": "Spanish",
    "sv": "Swedish",
    "tr": "Turkish",
    "uk": "Ukrainian"
} as const;


// Define more precise types
export type GoogleLanguage = keyof typeof GoogleLanguages;
export type DeeplLanguage = keyof typeof DeeplLanguages;

interface GoogleData {
  src: GoogleLanguage;  // Now properly typed to match your language keys
  sentences: {
    trans: string;
  }[];
}

export interface TranslationValue {
  sourceLanguage: string;
  text: string;
}

export function deeplLanguageToGoogleLanguage(language: DeeplLanguage): GoogleLanguage {
    switch (language) {
        case "": return "auto";
        case "nb": return "no";
        case "zh-hans": return "zh-CN";
        case "zh-hant": return "zh-TW";
        case "en-us":
        case "en-gb":
            return "en";
        case "pt-br":
        case "pt-pt":
            return "pt";
        default:
            return language as GoogleLanguage;
    }
}

export async function googleTranslate(
  text: string,
  sourceLang: GoogleLanguage,
  targetLang: GoogleLanguage
): Promise<TranslationValue> {
  const url =
    "https://translate.googleapis.com/translate_a/single?" +
    new URLSearchParams({
      client: "gtx",
      sl: sourceLang,
      tl: targetLang,
      dt: "t",
      dj: "1",
      source: "input",
      q: text,
    });

  const res = await fetch(url);
  if (!res.ok)
    throw new Error(
      `Failed to translate "${text}" (${sourceLang} -> ${targetLang})\n` +
        `${res.status} ${res.statusText}`
    );

  const { src, sentences }: GoogleData = await res.json();

  // Now this is type-safe because src is guaranteed to be a valid GoogleLanguage
  const sourceLanguage = GoogleLanguages[src];
  return {
    sourceLanguage,
    text: sentences.map((s) => s?.trans).filter(Boolean).join(""),
  };
}

// If you need a more general translation function that can handle either service
export async function translateText(
    text: string,
    sourceLang: GoogleLanguage,
    targetLang: GoogleLanguage
): Promise<TranslationValue> {
    return googleTranslate(text, sourceLang, targetLang);
}