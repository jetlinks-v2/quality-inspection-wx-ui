<script setup lang="ts">
import {Loading as VanLoading} from 'vant'
withDefaults(defineProps<{loading?:boolean;text?:string}>(),{loading:true})
</script>
<template><div class="mobile-loading" :aria-busy="loading"><van-loading v-if="loading" class="loading-indicator" vertical>{{text||'加载中'}}</van-loading><slot /></div></template>
