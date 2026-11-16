/** Keep business scrolling and fixed layers below the host-owned application bar.
 * Measure only our own root; never change the host DOM or assume its header height.
 */
export function mountBusinessViewport(root: HTMLElement): () => void {
  const view = root.ownerDocument.defaultView
  if (!view) return () => {}
  const viewport = view.visualViewport
  let frame = 0
  const update = () => {
    frame = 0
    const bottom = viewport ? viewport.offsetTop + viewport.height : view.innerHeight
    const height = `${Math.max(0, Math.floor(bottom - root.getBoundingClientRect().top))}px`
    if (root.style.getPropertyValue('--business-viewport-height') !== height) {
      root.style.setProperty('--business-viewport-height', height)
    }
  }
  const schedule = () => {
    if (!frame) frame = view.requestAnimationFrame(update)
  }
  update()
  // The parent can resize when the host safe area or orientation changes.
  const observer = new ResizeObserver(schedule)
  if (root.parentElement) observer.observe(root.parentElement)
  view.addEventListener('resize', schedule)
  viewport?.addEventListener('resize', schedule)
  viewport?.addEventListener('scroll', schedule)
  return () => {
    observer.disconnect()
    view.removeEventListener('resize', schedule)
    viewport?.removeEventListener('resize', schedule)
    viewport?.removeEventListener('scroll', schedule)
    if (frame) view.cancelAnimationFrame(frame)
    root.style.removeProperty('--business-viewport-height')
  }
}
