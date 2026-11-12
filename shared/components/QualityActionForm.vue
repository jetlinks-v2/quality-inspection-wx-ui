<script setup lang="ts">
import MobileNotice from '../../src/components/mobile/MobileNotice.vue'
import MobileCard from '../../src/components/mobile/MobileCard.vue'
import SelectField from '../../src/components/mobile/SelectField.vue'
import MobilePopup from '../../src/components/mobile/MobilePopup.vue'
import BusinessField from '../../src/components/mobile/BusinessField.vue'
import BusinessForm from '../../src/components/mobile/BusinessForm.vue'
import {Button as VanButton} from 'vant'
import {Field as VanField} from 'vant'
import {Radio as VanRadio} from 'vant'
import {RadioGroup as VanRadioGroup} from 'vant'
import {Stepper as VanStepper} from 'vant'
import {qualityText as qt} from '../i18n'

import {computed,defineAsyncComponent} from 'vue'
import type {QualityClient} from '../client'
import type {useQualityDetail} from '../useQualityDetail'
import type {UnwrapRef} from 'vue'
const Media=defineAsyncComponent(()=>import('./QualityMedia.vue'))
const props=defineProps<{api:QualityClient;vm:UnwrapRef<ReturnType<typeof useQualityDetail>>}>()
const titles=computed<Record<string,string>>(()=>({inspect:qt('submitInspection'),submit:qt('submitRectification'),pass:qt('reviewPassed'),reject:qt('rejectReview'),reassign:qt('reassignInspection2'),dispatch:qt('assignInspection'),rectReassign:qt('reassignRectification2')}))
const title=computed(()=>titles.value[props.vm.action]||qt('processOrder'))
</script>
<template><MobilePopup :show="!!vm.action" :title="title" :closable="!vm.saving" :close-on-click-overlay="false" @close="vm.close">
 <MobileNotice v-if="vm.error" :message="vm.error" type="error" show-icon /><MobileNotice v-if="vm.success" :message="vm.success" type="success" show-icon />
 <BusinessForm layout="vertical">
 <MobileCard v-for="result in vm.results" :key="result.recordId" :title="vm.record(result.recordId)?.checkContentName" size="small" style="margin-bottom:16px">
 <p>{{vm.record(result.recordId)?.subjectParentName}} / {{vm.record(result.recordId)?.subjectName}}</p><p style="white-space:pre-wrap">{{vm.record(result.recordId)?.checkRequirement}}</p><p>{{qt('photoRequirements2')}}{{vm.record(result.recordId)?.photoRequirement}}</p>
 <template v-if="vm.action==='inspect'"><BusinessField :label="qt('inspectionResults')"><van-radio-group v-model="result.isQualified"><van-radio :name="1">{{qt('qualified')}}</van-radio><van-radio :name="0">{{qt('unqualified')}}</van-radio></van-radio-group></BusinessField><BusinessField :label="qt('scoreOriginalPoints')+vm.record(result.recordId)?.originalScore+'）'"><van-stepper v-model="result.score" :precision="0" :min="vm.record(result.recordId)?.originalScore===0?undefined:0" :max="vm.record(result.recordId)?.originalScore" /><p>{{vm.record(result.recordId)?.deductionStandard}}</p></BusinessField><BusinessField :label="qt('checkInstructions')"><van-field v-model="result.checkResult" :maxlength="8000" :rows="3"  type="textarea" autosize /></BusinessField></template>
 <BusinessField :label="vm.action==='submit'?qt('perItemRectificationPhotos'):qt('inspectionPhotos')"><Media :api="api" :ids="result.photoIds" @change="ids=>result.photoIds=ids" /></BusinessField></MobileCard>
 <BusinessField v-if="['reassign','dispatch'].includes(vm.action)" :label="qt('reassignLine')"><SelectField multiple :options="vm.lineOptions" @change="(v:unknown)=>vm.selectLines(v as string[])" /></BusinessField>
 <BusinessField v-if="['inspect','reassign','dispatch','rectReassign'].includes(vm.action)" :label="vm.action==='inspect'?qt('rectifiersForUnqualifiedItems'):qt('assignee')"><SelectField v-model="vm.assigneeIds" multiple :max-tag-count="3" :options="vm.candidates.map(p=>({value:p.id,label:p.name}))" show-search option-filter-prop="label" /></BusinessField>
 <BusinessField v-if="['submit','reject'].includes(vm.action)" :label="vm.action==='submit'?qt('rectificationDescription'):qt('rejectionReason')"><van-field v-model="vm.description" :rows="4" :maxlength="8000"  type="textarea" autosize /></BusinessField><p v-if="vm.action==='pass'">{{qt('confirmAllIssuesInThisBatchAreRectifiedAndPassReview')}}</p>
 </BusinessForm><template #footer><van-button :disabled="vm.saving" @click="vm.close" native-type="button">{{qt('cancel')}}</van-button><van-button v-if="vm.action==='inspect'" :loading="vm.saving" @click="vm.submit(true)" native-type="button">{{qt('saveDraft')}}</van-button><van-button type="primary" :loading="vm.saving" @click="vm.submit(false)" native-type="button">{{title}}</van-button></template></MobilePopup></template>
