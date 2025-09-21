/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_S3_URL: string
  readonly VITE_S3_ACCESS_KEY: string
  readonly VITE_S3_SECRET_KEY: string
  readonly VITE_S3_API: string
  readonly VITE_S3_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}