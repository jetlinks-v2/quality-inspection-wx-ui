import { computed, provide, reactive } from 'vue'
import { routerKey, routeLocationKey, useRoute, useRouter, type RouteLocationRaw, type Router } from 'vue-router'
/** The legacy business views use local paths; every resolved URL stays in this module namespace. */
export function provideBusinessNavigation(base: string): void {
  const router = useRouter(), route = useRoute()
  const local = (path: string) => path === base ? '/' : path.startsWith(base + '/') ? path.slice(base.length) : path
  const target = (to: RouteLocationRaw): RouteLocationRaw => {
    if (typeof to === 'string') {
      if (!to.startsWith('/') || to.startsWith('//') || to.includes('..') || to.includes('://')) throw new Error('业务路由无效')
      return to === '/' ? base : base + to
    }
    if ('name' in to && to.name) {
      if (!String(to.name).startsWith(base.split('/').pop() + ':')) throw new Error('业务路由名称无效')
      return to
    }
    return to.path ? { ...to, path: target(to.path) as string } : to
  }
  const localRoute = reactive(new Proxy(route, { get(source, key) {
    if (key === 'path' || key === 'fullPath') return local(source[key])
    return Reflect.get(source, key)
  } }))
  const facade = new Proxy(router, { get(source, key) {
    if (key === 'push' || key === 'replace') return (to: RouteLocationRaw) => source[key](target(to))
    if (key === 'resolve') return (to: RouteLocationRaw) => source.resolve(target(to))
    if (key === 'currentRoute') return computed(() => localRoute)
    return Reflect.get(source, key)
  } }) as Router
  provide(routerKey, facade)
  provide(routeLocationKey, localRoute)
}
