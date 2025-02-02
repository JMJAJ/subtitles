import { classNameFactory } from "@api/Styles";
import { showToast, Toasts } from "@webpack/common";
import {
  DeeplLanguages,
  deeplLanguageToGoogleLanguage,
  GoogleLanguages,
  GoogleLanguage  // Import this type
} from "../../utils/languages";

export const cl = classNameFactory("vc-trans-");

interface GoogleData {
  src: string;  // Keep as string since it comes from API
  sentences: {
    trans: string;
  }[];
}

interface DeeplData {
  translations: {
    detected_source_language: string;
    text: string;
  }[];
}

export interface TranslationValue {
  sourceLanguage: string;
  text: string;
}

export const getLanguages = () => GoogleLanguages;

export async function translateText(
    text: string,
    sourceLang: string,
    targetLang: string
): Promise<TranslationValue> {
    return googleTranslate(text, sourceLang, targetLang);
}

/** Google Translate implementation */
export async function googleTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
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

  // Type guard to check if src is a valid GoogleLanguage key
  function isGoogleLanguage(code: string): code is GoogleLanguage {
    return code in GoogleLanguages;
  }

  // Use the type guard to safely access GoogleLanguages
  const sourceLanguage = isGoogleLanguage(src) 
    ? GoogleLanguages[src]
    : src;

  return {
    sourceLanguage,
    text: sentences.map((s) => s?.trans).filter(Boolean).join(""),
  };
}