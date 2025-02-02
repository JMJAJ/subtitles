// src/pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css"; // Import our global CSS

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
