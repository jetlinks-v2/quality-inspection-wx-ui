<script setup lang="ts">
import {NoticeBar as VanNoticeBar} from 'vant'
defineProps<{message:string;type?:string}>()
</script>
<template><div class="mobile-notice" :role="type==='error'?'alert':'status'"><van-notice-bar wrapable :text="message" :color="type==='error'?'#b42318':undefined" :background="type==='error'?'#fff1f0':undefined"/><slot/><slot name="action"/></div></template>
