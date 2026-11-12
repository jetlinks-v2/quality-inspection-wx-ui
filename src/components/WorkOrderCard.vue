<script setup lang="ts">
import {Button as VanButton} from 'vant'
import {Tag as VanTag} from 'vant'
import {EnvironmentOutlined,ClockCircleOutlined,ArrowRightOutlined} from '../components/mobile/icons'
import {orderStates,time,type WorkOrder} from '../../shared/types'
import {qualityText as qt} from '../../shared/i18n'

defineProps<{order:WorkOrder}>()
defineEmits<{open:[id:string]}>()
const statusColors:Record<number,string>={1:'blue',2:'orange',3:'cyan',4:'green'}
</script>

<template>
 <article class="order-card">
  <div class="card-heading"><span class="order-code">{{order.taskCode||qt('h5QualityTitle')}}</span><van-tag :color="statusColors[order.workOrderStatus]">{{orderStates[order.workOrderStatus]||'—'}}</van-tag></div>
  <h2>{{order.taskName}}</h2>
  <div class="order-meta"><p><EnvironmentOutlined aria-hidden="true" /><span>{{order.projectName||'—'}}</span></p><p><ClockCircleOutlined aria-hidden="true" /><span>{{qt('submissionTimeLimit')}}：{{time(order.reportDeadline)}}</span></p></div>
  <div class="order-card-footer"><div class="order-numbers"><span><strong>{{order.recordCount}}</strong> {{qt('h5CheckItems')}}</span><span>{{qt('score')}} <strong>{{order.totalScore??'—'}}</strong></span></div><van-button type="primary" ghost size="small" @click="$emit('open',order.id)" native-type="button">{{qt('h5ViewProcess')}} <ArrowRightOutlined aria-hidden="true" /></van-button></div>
 </article>
</template>
