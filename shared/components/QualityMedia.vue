<script setup lang="ts">
import MobileLoading from '../../src/components/mobile/MobileLoading.vue'
import MobileNotice from '../../src/components/mobile/MobileNotice.vue'
import {Button as VanButton} from 'vant'
import {Image as VanImage} from 'vant'
import {Uploader as VanUploader} from 'vant'
import {qualityText as qt} from '../i18n'

import {reactive} from 'vue'
import {showImagePreview,type UploaderFileListItem} from 'vant'
import type {QualityClient} from '../client'
import {useQualityMedia} from '../useQualityMedia'
const props=defineProps<{api:QualityClient;ids:string[];readonly?:boolean}>()
const emit=defineEmits<{change:[ids:string[]]}>()
const vm=reactive(useQualityMedia(props.api,()=>props.ids,ids=>emit('change',ids)))
async function upload(value:UploaderFileListItem|UploaderFileListItem[]){for(const item of Array.isArray(value)?value:[value])if(item.file)await vm.upload(item.file,props.ids)}
</script>

<template>
 <div class="quality-media">
  <MobileNotice v-if="vm.error" :message="vm.error" type="error" show-icon />
  <div>
   <div class="quality-media-list">
    <div v-for="(id,i) in ids" :key="id" class="quality-media-item">
     <MobileLoading :loading="vm.photos[id]?.loading??true">
      <van-image v-if="vm.photos[id]?.url" :src="vm.photos[id].url" :width="96" :height="96" :alt="vm.names[id]||qt('photo')+(i+1)" @click="showImagePreview([vm.photos[id].url!])" @error="vm.unavailable(id)" />
      <van-button v-else-if="vm.photos[id]?.error" class="quality-media-placeholder" :title="vm.photos[id].error" @click="vm.retry(id)" native-type="button">{{qt('photoUnavailable')}}<br />{{qt('refresh')}}</van-button>
      <div v-else class="quality-media-placeholder" />
     </MobileLoading>
     <div class="quality-media-caption" :title="vm.names[id]||qt('photo')+(i+1)">{{vm.names[id]||qt('photo')+(i+1)}}</div>
     <van-button v-if="!readonly" plain type="danger" size="small" :disabled="vm.busy" @click="emit('change',ids.filter(v=>v!==id))" native-type="button">{{qt('remove')}}</van-button>
    </div>
    <van-uploader v-if="!readonly" :preview-image="false" accept="image/*" :disabled="vm.busy" :after-read="upload">
     <van-button :loading="vm.busy" native-type="button">{{qt('takeAddPhoto')}}</van-button>
    </van-uploader>
    <span v-if="!ids.length&&readonly">—</span>
   </div>
  </div>
 </div>
</template>

<style scoped>
.quality-media-list{display:flex;flex-wrap:wrap;align-items:flex-start;gap:12px}
.quality-media-item{width:96px;text-align:center}
.quality-media-item :deep(.van-image__img){object-fit:cover;border-radius:6px}
.quality-media-placeholder{width:96px;height:96px;background:var(--van-background,#f5f5f5);border:1px solid var(--van-border-color,#d9d9d9);border-radius:6px;font-size:12px;white-space:normal}
.quality-media-caption{margin-top:4px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style>
