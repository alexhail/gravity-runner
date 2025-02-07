/// <reference types="vite/client" />

// Environment variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GAME_WIDTH: string;
  readonly VITE_GAME_HEIGHT: string;
  readonly VITE_DEBUG_MODE: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Audio file declarations
declare module '*.mp3' {
  const src: string;
  export default src;
} 