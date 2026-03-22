/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL completa do endpoint (ex.: https://teu-proj.vercel.app/api/anamnese) para testes locais opcionais */
  readonly VITE_ANAMNESE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
