<script setup lang="ts" generic="T = unknown">
import { computed, inject, ref, watch } from 'vue'
import { Button as VanButton, Cell as VanCell, Checkbox as VanCheckbox, Empty as VanEmpty, Field as VanField, Icon as VanIcon, Loading as VanLoading, Popup as VanPopup, Search as VanSearch } from 'vant'
import { selectionRows, type Choice, type Option } from './selection'

defineOptions({ inheritAttrs: false })
const popupTarget = inject('business-popup-target', ref<HTMLElement | string>('body'))
const props = withDefaults(defineProps<{
  modelValue?: T; options?: Option[]; multiple?: boolean; tree?: boolean; changeOnSelect?: boolean
  clearable?: boolean; disabled?: boolean; loading?: boolean; placeholder?: string; title?: string; label?: string
  filterOption?: boolean; show?: boolean; closable?: boolean
}>(), { options: () => [], filterOption: true, closable: true, show: undefined })
const emit = defineEmits<{
  'update:modelValue': [value: T]; change: [value: T]; search: [text: string]; 'update:show': [value: boolean]
}>()
const words = { select: '请选择', search: '搜索', loading: '加载中', empty: '没有匹配选项', clear: '清空', confirm: '确定' }
const localOpen = ref(false), keyword = ref(''), chosen = ref<Choice[]>([])
const open = computed({ get: () => props.show ?? localOpen.value, set: value => { localOpen.value = value; emit('update:show', value) } })
const rows = computed(() => selectionRows(props.options, props.tree, props.changeOnSelect))
const filtered = computed(() => {
  const search = keyword.value.trim().toLocaleLowerCase()
  return props.filterOption === false || !search ? rows.value : rows.value.filter(row =>
    [...row.pathLabels, row.description || ''].join(' / ').toLocaleLowerCase().includes(search))
})
const selected = computed(() => {
  const values: unknown[] = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
  return values.filter((value): value is Choice => ['string', 'number', 'boolean'].includes(typeof value))
})
const text = computed(() => rows.value.filter(row => selected.value.includes(row.value) &&
  (!props.tree || row.value === selected.value.at(-1))).map(row => row.label).join('、'))
// Recheck against current options: withdrawn permissions or changed projects must not commit a stale draft.
const canConfirm = computed(() => !props.disabled && !props.loading &&
  (chosen.value.length ? chosen.value.every(value => rows.value.some(row => row.value === value && !row.disabled)) : !!(props.clearable || props.multiple)))
function begin() { if (!props.disabled) open.value = true }
function select(value: Choice, disabled: boolean) {
  if (disabled || props.disabled || props.loading) return
  chosen.value = props.multiple ? chosen.value.includes(value) ? chosen.value.filter(item => item !== value) : [...chosen.value, value] : [value]
}
function confirm() {
  if (!canConfirm.value) return
  const row = rows.value.find(row => row.value === chosen.value[0])
  const value = props.multiple ? [...chosen.value] : props.tree ? row?.path || [] : chosen.value[0]
  emit('update:modelValue', value as T); emit('change', value as T); open.value = false
}
// The draft belongs to this opening; cancellation (including clear then close) never changes the business filter.
watch(open, value => {
  if (!value) return
  keyword.value = ''
  chosen.value = props.multiple ? [...selected.value] : props.tree ? selected.value.slice(-1) : selected.value.slice(0, 1)
}, { immediate: true, flush: 'sync' })
watch(keyword, value => emit('search', value))
</script>
<template>
  <slot name="trigger" :open="begin" :text="text">
    <VanField v-bind="$attrs" readonly clickable :label="label" :model-value="text" :placeholder="placeholder || words.select" :disabled="disabled" right-icon="arrow-down" @click="begin" />
  </slot>
  <VanPopup v-model:show="open" class="selection-popup" position="bottom" round :teleport="popupTarget" :closeable="closable" :close-on-click-overlay="closable" safe-area-inset-bottom>
    <h2 class="selection-heading">{{ title || label || placeholder || words.select }}</h2>
    <VanSearch v-model="keyword" :placeholder="words.search" :disabled="disabled" />
    <slot name="notice" />
    <VanLoading v-if="loading" class="selection-loading" vertical>{{ words.loading }}</VanLoading>
    <div class="selection-options" role="listbox" :aria-label="title || label || placeholder || words.select" :aria-multiselectable="multiple || undefined">
      <VanCell v-for="row in filtered" :key="String(row.value)" :title="row.label" :label="row.description" :class="{ 'option-disabled': row.disabled }" :style="{ paddingLeft: `${16 + row.depth * 12}px` }" :clickable="!row.disabled && !disabled && !loading" role="option" :aria-disabled="row.disabled || disabled || loading || undefined" :aria-selected="chosen.includes(row.value)" :tabindex="row.disabled ? -1 : 0" @click="select(row.value, row.disabled)" @keydown.enter.prevent="select(row.value, row.disabled)" @keydown.space.prevent="select(row.value, row.disabled)">
        <template #right-icon>
          <VanCheckbox v-if="multiple" :model-value="chosen.includes(row.value)" :disabled="row.disabled || disabled || loading" @click.stop="select(row.value, row.disabled)" />
          <VanIcon v-else-if="chosen.includes(row.value)" name="success" class="selection-check" />
        </template>
      </VanCell>
      <VanEmpty v-if="!filtered.length && !loading" :description="words.empty" />
    </div>
    <div class="selection-actions">
      <VanButton v-if="clearable" block :disabled="disabled || loading" native-type="button" @click="chosen = []">{{ words.clear }}</VanButton>
      <VanButton type="primary" block :disabled="!canConfirm" native-type="button" @click="confirm">{{ words.confirm }}</VanButton>
    </div>
  </VanPopup>
</template>
<style scoped>
.selection-popup { display: flex; flex-direction: column; width: 100%; max-height: min(85dvh, var(--business-viewport-height, 85dvh)); overflow: hidden; }
.selection-heading { flex: none; margin: 0; padding: 20px 44px 16px 16px; font-size: 18px; line-height: 24px; }
.selection-popup > :deep(.van-search) { flex: none; }
.selection-options { flex: 1; min-height: 0; max-height: 50dvh; overflow-y: auto; overscroll-behavior-y: contain; }
.selection-options :deep(.van-cell__title) { min-width: 0; overflow-wrap: anywhere; }
.option-disabled { color: var(--van-text-color-3, #969799); cursor: default; }
.selection-check { color: var(--van-primary-color); align-self: center; }
.selection-actions { flex: none; display: flex; gap: 12px; margin: 0; padding: 16px; border-top: 1px solid var(--van-border-color); }
.selection-loading { flex: none; padding: 16px; }
</style>
