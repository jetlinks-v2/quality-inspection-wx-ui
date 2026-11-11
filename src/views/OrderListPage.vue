<script setup lang="ts">
import {reactive} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {ReloadOutlined,EnvironmentOutlined} from '../components/mobile/icons'
import {useQualityList} from '../hooks/useQualityList'
import {qualityModes} from '../services/navigation'
import {qualityText as qt} from '../../shared/i18n'
import WorkOrderCard from '../components/WorkOrderCard.vue'

const vm=reactive(useQualityList()),route=useRoute(),router=useRouter()
</script>

<template>
 <section class="list-page">
  <div class="list-toolbar">
   <div class="status-tabs" role="tablist" :aria-label="qt('h5OrderType')">
    <van-button v-for="item in qualityModes" :key="item.value" plain role="tab" :aria-selected="String(route.query.mode||'inspect')===item.value" :class="{selected:String(route.query.mode||'inspect')===item.value}" @click="router.replace('/orders?mode='+item.value)" native-type="button">{{item.label}}</van-button>
   </div>
   <div class="list-filters"><EnvironmentOutlined aria-hidden="true" /><label for="quality-project-filter" class="sr-only">{{qt('businessProject')}}</label><SelectField id="quality-project-filter" v-model="vm.projectId" :options="vm.projects.map(p=>({value:p.id,label:p.name}))" :placeholder="qt('h5AllProjects')" show-search option-filter-prop="label" clearable /><van-button plain :loading="vm.loading" @click="vm.load" native-type="button"><ReloadOutlined aria-hidden="true" />{{qt('refresh')}}</van-button></div>
  </div>
  <div class="list-content">
   <MobileNotice v-if="vm.error" :message="vm.error" type="error" show-icon><template #action><van-button size="small" @click="vm.load" native-type="button">{{qt('h5Retry')}}</van-button></template></MobileNotice>
   <div class="list-caption"><span>{{qt('h5TotalRecordsPrefix')}} <strong>{{vm.total}}</strong> {{qt('h5TotalRecordsSuffix')}}</span></div>
   <MobileLoading :loading="vm.loading">
    <div class="order-list"><WorkOrderCard v-for="order in vm.rows" :key="order.id" :order="order" @open="id=>router.push('/orders/'+id)" /></div>
    <van-empty v-if="!vm.loading&&!vm.error&&!vm.rows.length" :description="qt('h5NoOrders')" class="quality-empty"><template #image><img src="/images/quality/inspection.svg" alt="" /></template><p>{{qt('h5EmptyHint')}}</p></van-empty>
    <van-skeleton v-if="vm.loading&&!vm.rows.length" active class="list-skeleton" />
   </MobileLoading>
   <van-pagination v-if="vm.total" v-model="vm.current" :total="vm.total" :items-per-page="10" simple class="list-pagination" @change="vm.load" />
  </div>
 </section>
</template>
