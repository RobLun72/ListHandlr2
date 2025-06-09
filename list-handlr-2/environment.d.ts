declare namespace NodeJS {
  export interface ProcessEnv {
    readonly NEXT_PUBLIC_SERVER_ACTION_URL: string;
    readonly NEXT_PUBLIC_BACK_END_URL: string;
    readonly NEXT_PUBLIC_ENABLE_MSW_MOCKING: string;
    readonly NEXT_PUBLIC_MSW_API_DELAY: number;
    readonly NEXT_PUBLIC_MSW_WARN: string;
    readonly NEXT_PUBLIC_AUTH_ACTIVE: string;
  }
}
