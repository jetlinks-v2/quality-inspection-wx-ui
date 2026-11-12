<script setup lang="ts">
import MobileLoading from '../../src/components/mobile/MobileLoading.vue'
import MobileNotice from '../../src/components/mobile/MobileNotice.vue'
import SelectField from '../../src/components/mobile/SelectField.vue'
import MobilePopup from '../../src/components/mobile/MobilePopup.vue'
import BusinessField from '../../src/components/mobile/BusinessField.vue'
import BusinessForm from '../../src/components/mobile/BusinessForm.vue'
import {Button as VanButton} from 'vant'
import {Cell as VanCell} from 'vant'
import {Field as VanField} from 'vant'
import {Radio as VanRadio} from 'vant'
import {RadioGroup as VanRadioGroup} from 'vant'
import {qualityText as qt} from '../i18n'

import {reactive} from 'vue'
import type {QualityClient} from '../client'
import type {CheckRecord} from '../types'
import {useQualityRepair} from '../useQualityRepair'
const props=defineProps<{api:QualityClient}>(),emit=defineEmits<{changed:[]}>(),vm=reactive(useQualityRepair(props.api,async()=>emit('changed')))
defineExpose({show:(record:CheckRecord)=>vm.show(record)})
</script>
<template><MobilePopup v-model:show="vm.open" :title="vm.linked?qt('linkedRepairOrder'):qt('createRepairFromIssue')"><MobileNotice v-if="vm.error" :message="vm.error" type="error" show-icon /><MobileLoading :loading="vm.loading"><div v-if="vm.linked" :column="1" bordered><van-cell :title="qt('repairNumber')">{{vm.linked.number}}</van-cell><van-cell :title="qt('orderStatus')">{{[qt('pendingAssignment'),qt('inProgress'),qt('finished'),qt('obsolete'),qt('closed'),qt('archived'),qt('pendingAcceptance'),qt('pendingFollowUp'),qt('pendingFollowUpVisit'),qt('pendingApproval')][vm.linked.status]}}</van-cell><van-cell :title="qt('orderId')">{{vm.linked.id}}</van-cell></div><BusinessForm v-else layout="vertical" :model="vm.form" @submit="vm.submit">
 <BusinessField :label="qt('repairCategory')" name="categoryId" :rules="[{required:true,message:qt('selectARepairCategory')}]"><SelectField v-model="vm.form.categoryId" :options="vm.choices('category')" /></BusinessField><BusinessField :label="qt('repairChannel')" name="channelId" :rules="[{required:true,message:qt('selectARepairChannel')}]"><SelectField v-model="vm.form.channelId" :options="vm.choices('channel')" /></BusinessField><BusinessField :label="qt('issueLabels')"><SelectField v-model="vm.form.labelIds" multiple :options="vm.choices('label')" /></BusinessField><BusinessField :label="qt('issueDescription')" name="description" :rules="[{required:true,message:qt('enterAnIssueDescription')}]"><van-field v-model="vm.form.description" :rows="4" :maxlength="800"  type="textarea" autosize /></BusinessField><BusinessField :label="qt('contact')" name="contactName" :rules="[{required:true,message:qt('enterTheContactName')}]"><van-field v-model="vm.form.contactName" /></BusinessField><BusinessField :label="qt('phone')" name="contactPhone" :rules="[{required:true,message:qt('enterAContactPhoneNumber')}]"><van-field v-model="vm.form.contactPhone" /></BusinessField><BusinessField :label="qt('issueLocation')"><van-radio-group v-model="vm.form.positionType"><van-radio :name="1">{{qt('publicArea')}}</van-radio><van-radio :name="2">{{qt('indoor')}}</van-radio></van-radio-group></BusinessField><BusinessField :label="qt('locationDetails')"><van-field v-model="vm.form.location" /></BusinessField><BusinessField :label="qt('urgency')"><SelectField v-model="vm.form.urgency" :options="[{value:1,label:qt('normal')},{value:2,label:qt('urgent')},{value:3,label:qt('critical')}]" /></BusinessField><p>{{qt('theInspectionProjectAndSitePhotosWillBeIncluded')}}</p><van-button type="primary" native-type="submit" :loading="vm.loading">{{qt('createRepairOrder')}}</van-button></BusinessForm></MobileLoading></MobilePopup></template>
