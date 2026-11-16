export type Choice = string | number | boolean
export interface Option {
  value?: Choice; key?: string; id?: string
  label?: string; title?: string; name?: string; description?: string
  disabled?: boolean; children?: unknown[]
}
export interface SelectionRow {
  value: Choice; label: string; description?: string; disabled: boolean
  path: Choice[]; pathLabels: string[]; depth: number
}
/** Keep authorized hierarchy and paths for search; a disabled folder may contain selectable projects. */
export function selectionRows(options: Option[], tree = false, changeOnSelect = false, parent: Choice[] = [], labels: string[] = []): SelectionRow[] {
  return options.flatMap(option => {
    const value = option.value ?? option.key ?? option.id
    if (value === undefined) return []
    const children = (option.children || []) as Option[]
    const label = option.label || option.title || option.name || String(value)
    const path = [...parent, value], pathLabels = [...labels, label]
    return [{ value, label, description: option.description, disabled: !!option.disabled || tree && !!children.length && !changeOnSelect,
      path, pathLabels, depth: parent.length }, ...selectionRows(children, tree, changeOnSelect, path, pathLabels)]
  })
}
