import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import { 
  translate, 
  TranslationValue 
} from "../../utils/translator";
import { GoogleLanguage, GoogleLanguages } from "../../utils/languages";
import { SrtBlock } from "../../types/subtitles";
import { enhanceSubtitleQuality } from "../../utils/subtitle-enhancer";
import { formatSubtitleText } from "../../utils/subtitle-formatter";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Type-safe form fields
interface ParsedFields {
  sourceLang: string;
  targetLang: string;
  [key: string]: string | string[];
}

// Type-safe formidable result
interface ParsedForm {
  fields: ParsedFields;
  files: {
    file?: formidable.File | formidable.File[];
  };
}

// Promisify formidable parsing with types
const parseForm = (req: NextApiRequest): Promise<ParsedForm> =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields: fields as ParsedFields, files });
    });
  });

function parseSrt(content: string): SrtBlock[] {
  const blocks: SrtBlock[] = [];
  const rawBlocks = content.trim().split(/\n\s*\n/);
  for (const raw of rawBlocks) {
    const lines = raw.split(/\r?\n/);
    if (lines.length >= 3) {
      const index = lines[0].trim();
      const timestamps = lines[1].trim();
      const text = lines.slice(2).join(" ").trim();
      blocks.push({ index, timestamps, text });
    }
  }
  return blocks;
}

function assembleSrt(blocks: SrtBlock[]): string {
  return blocks.map((b) => `${b.index}\n${b.timestamps}\n${b.text}`).join("\n\n");
}

// Type guard to validate language codes
function isValidLanguage(code: string): code is GoogleLanguage {
  return code in GoogleLanguages;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      console.log("Starting SRT translation process...");
      
      if (req.method !== 'POST') {
        console.log(`Invalid method: ${req.method}`);
        return res.status(405).json({ error: "Method not allowed" });
      }
  
      const { fields, files } = await parseForm(req);
      console.log("Form parsed:", {
        sourceLang: fields.sourceLang,
        targetLang: fields.targetLang,
        hasFile: !!files.file
      });
      
      const sourceLang = fields.sourceLang || "en";
      const targetLang = fields.targetLang || "es";
      
      if (!isValidLanguage(sourceLang) || !isValidLanguage(targetLang)) {
        console.log("Invalid language codes:", { sourceLang, targetLang });
        return res.status(400).json({ 
          error: "Invalid language code provided." 
        });
      }
  
      const fileObj = files.file;
      if (!fileObj) {
        console.log("No file uploaded");
        return res.status(400).json({ error: "No file uploaded." });
      }
  
      const filePath = Array.isArray(fileObj) ? fileObj[0].filepath : fileObj.filepath;
      console.log("File path:", filePath);
      
      let srtContent: string;
      try {
        srtContent = fs.readFileSync(filePath, "utf8");
        console.log("SRT file read successfully, length:", srtContent.length);
      } catch (readError) {
        console.error("Error reading file:", readError);
        return res.status(500).json({ error: "Failed to read file." });
      }
  
      const blocks = parseSrt(srtContent);
      console.log(`Parsed ${blocks.length} subtitle blocks`);
  
      try {
        // First enhance all blocks with context
        console.log('Enhancing subtitle quality with context...');
        const enhancedBlocks = await enhanceSubtitleQuality(blocks);
        
        // Then translate each enhanced block
        const translatedBlocks: SrtBlock[] = [];
        for (let i = 0; i < enhancedBlocks.length; i++) {
          const block = enhancedBlocks[i];
          console.log(`Processing block ${i + 1}/${enhancedBlocks.length}`);
          
          if (block.text) {
            try {
              console.log(`Translating enhanced block ${i + 1}`);
              const translated: TranslationValue = await translate(
                block.text,
                sourceLang,
                targetLang
              );
              
              // Format the translated text to match original line structure
              const formattedText = formatSubtitleText(translated.text, blocks[i].text);
              
              translatedBlocks.push({
                ...block,
                text: formattedText
              });
            } catch (err) {
              console.error(`Error processing block ${i + 1}:`, err);
              translatedBlocks.push({
                ...block,
                text: `[Processing Error: ${(err as Error).message}]`
              });
            }
          } else {
            console.log(`Block ${i + 1} has no text, skipping`);
            translatedBlocks.push(block);
          }
        }
  
        const newSrtContent = assembleSrt(translatedBlocks);
        console.log("Final translated SRT length:", newSrtContent.length);
        
        // Log the first few characters of the content to verify it's not empty
        console.log("First 200 characters of translated content:", newSrtContent.slice(0, 200));
  
        res.setHeader("Content-Type", "text/plain");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="translated_subtitles.srt"'
        );
        
        return res.status(200).send(newSrtContent);
      } catch (err) {
        console.error("Error enhancing or translating subtitles:", err);
        return res.status(500).json({ 
          error: "Failed to enhance or translate subtitles." 
        });
      }
    } catch (err) {
      const error = err as Error;
      console.error("Handler error:", {
        message: error.message,
        stack: error.stack
      });
      return res.status(500).json({ 
        error: "Internal Server Error",
        details: error.message 
      });
    }
  }