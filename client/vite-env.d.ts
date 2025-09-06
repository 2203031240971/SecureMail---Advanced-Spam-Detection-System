/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Social Authentication
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_APPLE_CLIENT_ID?: string
  
  // App Configuration
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_API_BASE_URL?: string
  
  // Development
  readonly VITE_DEV_MODE?: string
  readonly MODE: string
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
