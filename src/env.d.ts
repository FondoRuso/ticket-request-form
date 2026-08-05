declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined
    VUE_ROUTER_BASE: string | undefined
    APP_VERSION: string

    NOCODB_API_URL: string
    NOCODB_REQUESTS_FORM_PUBLIC_UUID: string
    NOCODB_REQUESTS_VIEW_URL: string

    DATA_BASE_URL: string

    OPENPANEL_API_URL: string
    OPENPANEL_CLIENT_ID: string
  }
}

interface Window {
  // Set by prerender.js so the build-time render can opt out of analytics.
  __PRERENDER__?: boolean
}
