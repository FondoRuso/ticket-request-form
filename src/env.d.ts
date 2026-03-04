declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined
    VUE_ROUTER_BASE: string | undefined
    APP_VERSION: string

    NOCODB_API_URL: string
    NOCODB_API_TOKEN: string
    NOCODB_MEMBERS_TABLE_ID: string
    NOCODB_MEMBERS_VIEW_ID: string
  }
}
