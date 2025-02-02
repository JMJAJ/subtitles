// src/pages/index.tsx
import { useState, ChangeEvent, useRef } from "react";
import styles from "../styles/Home.module.css";
import { GoogleLanguages } from "../utils/languages";
import { FiUpload, FiCheck, FiX } from 'react-icons/fi';

const languages = GoogleLanguages;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setProgress(0);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.srt')) {
        setFile(selectedFile);
      } else {
        setError("Please upload a valid .srt file!");
        setFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.srt')) {
      setFile(droppedFile);
      setError("");
    } else {
      setError("Please drop a valid .srt file!");
    }
  };

  const handleTranslate = async () => {
    if (!file) {
      setError("Please upload an .srt file!");
      return;
    }
    setLoading(true);
    setError("");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sourceLang", sourceLang);
    formData.append("targetLang", targetLang);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/translate-srt");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentCompleted = Math.round((event.loaded * 100) / event.total);
        setProgress(percentCompleted);
      }
    };

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentDownloaded = Math.round((event.loaded * 100) / event.total);
        setProgress(percentDownloaded);
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        setLoading(false);
        if (xhr.status === 200) {
          const blob = new Blob([xhr.response], { type: "text/plain" });
          if (blob.size === 0) {
            setError("The translated file is empty!");
            return;
          }
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `translated_${file.name}`;
          a.click();
          window.URL.revokeObjectURL(url);
          setProgress(100);
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            setError(response.error || "Translation failed");
          } catch (err) {
            setError("Translation failed");
          }
        }
      }
    };

    xhr.responseType = "blob";
    xhr.send(formData);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Subtitle Translator</h1>
      
      <div 
        className={styles.fileUploadContainer}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".srt"
          onChange={handleFileChange}
          className={styles.fileInput}
          id="file-upload"
        />
        <label 
          htmlFor="file-upload" 
          className={styles.fileLabel}
        >
          <FiUpload size={24} />
          {file ? (
            <span>
              <FiCheck className="text-green-500" /> File selected
            </span>
          ) : (
            <span>Choose a file or drag it here</span>
          )}
        </label>
        {file && (
          <div className={styles.fileName}>
            Selected file: {file.name}
          </div>
        )}
      </div>

      <div className={styles.selectContainer}>
        <div className={styles.selectGroup}>
          <label className={styles.selectLabel} htmlFor="sourceLang">
            Source Language
          </label>
          <select
            id="sourceLang"
            className={styles.select}
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
          >
            {Object.entries(languages).map(([lang, label]) => (
              <option key={lang} value={lang}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectGroup}>
          <label className={styles.selectLabel} htmlFor="targetLang">
            Target Language
          </label>
          <select
            id="targetLang"
            className={styles.select}
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {Object.entries(languages).map(([lang, label]) => (
              <option key={lang} value={lang}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button 
        className={styles.button} 
        onClick={handleTranslate}
        disabled={!file || loading}
      >
        {loading ? 'Translating...' : 'Translate Subtitles'}
      </button>

      {loading && (
        <div className={styles.progressContainer}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${progress}%` }}
          >
            <span className={styles.progressText}>{progress}%</span>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <FiX size={16} /> {error}
        </div>
      )}
    </div>
  );
}
