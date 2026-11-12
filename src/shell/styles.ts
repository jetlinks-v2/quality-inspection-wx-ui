/** Scope legacy selectors at mount time so loading another module cannot restyle the portal. */
export function mountBusinessStyles(css: string[], className: string): () => void {
  const style = document.createElement('style')
  const prefix = '.' + className
  const sheet = new CSSStyleSheet()
  const selector = (value: string) => value.split(',').map(part => {
    const trimmed = part.trim()
    if (/^(:root|html|body|#app)$/.test(trimmed)) return prefix
    return prefix + ' ' + trimmed
  }).join(',')
  const render = (rules: CSSRuleList): string => Array.from(rules).map(rule => {
    if (rule instanceof CSSStyleRule) return selector(rule.selectorText) + '{' + rule.style.cssText + '}'
    if (rule instanceof CSSMediaRule) return '@media ' + rule.conditionText + '{' + render(rule.cssRules) + '}'
    if (rule instanceof CSSSupportsRule) return '@supports ' + rule.conditionText + '{' + render(rule.cssRules) + '}'
    return rule.cssText
  }).join('\n')
  style.textContent = css.map(source => { sheet.replaceSync(source); return render(sheet.cssRules) }).join('\n')
  document.head.append(style)
  return () => style.remove()
}
