// Standalone type-checking contract. The host build resolves the real public facade instead.
declare module '@jetlinks-mobile-core' {
  import type { ComputedRef } from 'vue'
  import type { RouteRecordRaw } from 'vue-router'
  export interface MobileAppProject { code: string; name: string }
  export interface MobileAppApplication { id: string; name: string; templateId: string; templateCode: string }
  export interface MobileRequestOptions { method?: 'GET'|'POST'|'PUT'|'PATCH'; body?: unknown; bodyType?: 'text'; headers?: Record<string,string>; signal?: AbortSignal }
  export type MobileAppRequest = (path: string, options?: MobileRequestOptions) => Promise<unknown>
  export interface MobileAppContext { project: ComputedRef<MobileAppProject|null>; application: ComputedRef<MobileAppApplication|null>; request: MobileAppRequest }
  export interface MobileAppModule { id: string; name: string; templateCodes: string[]; entryPath: string; getRoutes(): RouteRecordRaw[] }
  export function useMobileAppContext(): MobileAppContext
}
