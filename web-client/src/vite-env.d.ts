/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_SOCKET_URL?: string
  readonly VITE_DISABLE_SOCKET?: string
  readonly VITE_PR_NUMBER?: string
  readonly VITE_VERCEL_ENV?: string
  readonly MODE: string
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
