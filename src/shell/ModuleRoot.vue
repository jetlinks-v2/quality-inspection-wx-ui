<script setup lang="ts">
import {computed,onBeforeUnmount,onMounted,provide,ref,watch} from 'vue'
import {Button as VanButton,Empty as VanEmpty,Loading as VanLoading} from 'vant'
import {useMobileAppContext} from '@jetlinks-mobile-core'
import {jetlinksMobile} from '../../package.json'
import BusinessApp from '../App.vue'
import {clearSession,state} from '../services/session'
import type {Authorization} from '../types'
import {bindShell,shellState,shellRequest} from './runtime'
import {provideBusinessNavigation} from './navigation'
import {mountBusinessStyles} from './styles'
import businessCss from '../style.css?inline'
import mobileCss from '../components/mobile/mobile.css?inline'
const context=useMobileAppContext(),root=ref<HTMLElement>(),ready=ref(false),error=ref(''),generation=ref(0)
provideBusinessNavigation(`/applications/${jetlinksMobile.id}`)
provide('business-popup-target',computed(()=>root.value||'body'))
let dispose=()=>{},removeStyles=()=>{},attempt=0
async function start(){
 const current=++attempt;ready.value=false;error.value='';state.ready=false
 dispose();clearSession(false);
 dispose=bindShell(context,jetlinksMobile.templateCodes)
 if(shellState.error)return
 try{
  const authorization=await shellRequest<Authorization>('/authorize/me')
  if(current!==attempt)return
  if(!authorization?.user?.id)throw Error('应用授权未返回有效身份')
  state.session={token:'',applicationId:context.application.value!.id,environmentId:context.project.value!.code}
  state.authorization={...authorization,permissions:authorization.permissions||[]}

  if(current!==attempt)return
  state.ready=true;generation.value++;ready.value=true
 }catch(cause){if(current===attempt)error.value=cause instanceof Error?cause.message:'应用加载失败'}
}
watch(()=>[context.project.value?.code,context.application.value?.id,context.application.value?.templateCode],()=>{void start()},{flush:'sync'})
onMounted(()=>{removeStyles=mountBusinessStyles([businessCss,mobileCss],'quality-business');void start()})
onBeforeUnmount(()=>{attempt++;dispose();clearSession(false);;removeStyles()})
</script>
<template><section ref="root" class="quality-business official-module" style="--h5-app-safe-top:0px;--h5-app-safe-bottom:env(safe-area-inset-bottom,0px)"><VanEmpty v-if="error||shellState.error" :description="error||shellState.error"><VanButton v-if="!shellState.error" @click="start">重新加载</VanButton></VanEmpty><BusinessApp v-else-if="ready" :key="generation"/><VanLoading v-else vertical>正在连接应用</VanLoading></section></template>
