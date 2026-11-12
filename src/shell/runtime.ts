import { reactive } from 'vue'
import type { MobileAppContext, MobileAppRequest } from '@jetlinks-mobile-core'

type HostOptions = NonNullable<Parameters<MobileAppRequest>[1]>
// The current host forwards HTTP methods to fetch, while its type omits DELETE.
// Keep that wire method and business download intent local; do not add host APIs.
type Options = Omit<HostOptions, 'method'> & { method?: HostOptions['method'] | 'DELETE'; responseType?: 'blob' }
interface Binding { context: MobileAppContext; signature: string; controller: AbortController }
let binding: Binding | undefined
export const shellState = reactive({ active: false, error: '', generation: 0 })
export const inShell = () => shellState.active
function signature(context: MobileAppContext): string {
  return JSON.stringify([context.project.value?.code, context.application.value?.id, context.application.value?.templateCode])
}
/** Only the shell owns project credentials. No browser token or URL context is consulted. */
export function bindShell(context: MobileAppContext, templateCodes: readonly string[]): () => void {
  binding?.controller.abort()
  shellState.active = true; shellState.error = ''; shellState.generation++
  binding = undefined
  if (!context.project.value || !context.application.value || !templateCodes.includes(context.application.value.templateCode)) {
    shellState.error = '请从应用列表打开已授权的真实应用'
    return () => { shellState.active = false; shellState.generation++ }
  }
  const current: Binding = { context, signature: signature(context), controller: new AbortController() }
  binding = current
  return () => {
    current.controller.abort()
    if (binding === current) { binding = undefined; shellState.active = false; shellState.error = ''; shellState.generation++ }
  }
}
export function shellApplication() { return binding?.context.application.value }
export function shellEnvironment() { return binding?.context.project.value?.code }
function assertCurrent(current: Binding | undefined): asserts current is Binding {
  if (!current || binding !== current || current.controller.signal.aborted || signature(current.context) !== current.signature || shellState.error)
    throw Object.assign(new Error(shellState.error || '项目或应用已变化，请重新进入应用'), { status: 409 })
}
/** Abort module-owned work on unmount and reject every result from a previous application. */
export async function shellRequest<T>(path: string, options: Options = {}): Promise<T> {
  const current = binding
  assertCurrent(current)
  const controller = new AbortController()
  const abort = () => controller.abort()
  current.controller.signal.addEventListener('abort', abort, { once: true })
  options.signal?.addEventListener('abort', abort, { once: true })
  if (options.signal?.aborted) controller.abort()
  try {
    const result = await current.context.request(path, { ...options, method: options.method as HostOptions['method'], signal: controller.signal })
    assertCurrent(current)
    if (controller.signal.aborted) throw new DOMException('操作已取消', 'AbortError')
    return result as T
  } catch (cause) {
    // A late 401 from an old module must not invalidate its replacement.
    if (binding === current && !current.controller.signal.aborted) {
      const error = cause as { unauthorized?: boolean; status?: number; httpStatus?: number; businessCode?: unknown }
      if (error.unauthorized || error.status === 401 || error.httpStatus === 401 || error.businessCode === 401)
        shellState.error = '项目登录已失效，请返回主应用重新进入'
    }
    throw cause
  } finally {
    current.controller.signal.removeEventListener('abort', abort)
    options.signal?.removeEventListener('abort', abort)
  }
}
