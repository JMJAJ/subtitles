// src/utils/translator.ts
/*
 * Translator utility for the Next.js project.
 * This demo function uses the Google Translate API.
 */

import { classNameFactory } from "@api/Styles";
import { showToast, Toasts } from "@webpack/common";

export interface TranslationValue {
  sourceLanguage: string;
  text: string;
}

// For our demo, we supply some language maps
export const GoogleLanguages: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    cs: "Czech",
    ru: "Russian",
    pl: "Polish",
    tr: "Turkish",
    nl: "Dutch",
    pt: "Portuguese",
    ar: "Arabic",
    hu: "Hungarian",
    sv: "Swedish",
    fi: "Finnish",
    ko: "Korean",
    ja: "Japanese",
    id: "Indonesian",
    th: "Thai",
    vi: "Vietnamese"
};

export const getLanguages = () => GoogleLanguages;

/**
 * Translates the given text using the Google Translate API.
 */
export async function translate(
  text: string,
  sourceLang: string = "auto",
  targetLang: string = "en"
): Promise<TranslationValue> {
  try {
    return await googleTranslate(text, sourceLang, targetLang);
  } catch (e) {
    const userMessage =
      typeof e === "string"
        ? e
        : "Something went wrong. Please check the console or ask for help.";
    showToast(userMessage, Toasts.Type.FAILURE);
    throw e instanceof Error ? e : new Error(userMessage);
  }
}

/** Demo implementation using Google Translate unofficial API */
async function googleTranslate(
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
      q: text
    });

  const res = await fetch(url);
  if (!res.ok)
    throw new Error(
      `Failed to translate "${text}" (${sourceLang} -> ${targetLang})` +
        `\n${res.status} ${res.statusText}`
    );

  const data = await res.json();
  // For the demo, assume data has properties 'src' and 'sentences'
  const { src, sentences } = data as {
    src: string;
    sentences: { trans: string }[];
  };

  return {
    sourceLanguage: GoogleLanguages[src] ?? src,
    text: sentences.map((s) => s.trans).join("")
  };
}
