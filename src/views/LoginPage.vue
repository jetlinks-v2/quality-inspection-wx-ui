<script setup lang="ts">
import MobileNotice from '../components/mobile/MobileNotice.vue'
import BusinessField from '../components/mobile/BusinessField.vue'
import BusinessForm from '../components/mobile/BusinessForm.vue'
import {Button as VanButton} from 'vant'
import {Field as VanField} from 'vant'
import {reactive} from 'vue'
import {useSession} from '../hooks/useSession'
import LoginVerification from '../components/LoginVerification.vue'
import {qualityText as qt} from '../../shared/i18n'
const vm=reactive(useSession())
</script>
<template><section class="login-page"><div class="login-hero"><div class="login-brand">{{qt('h5QualityTitle')}}<span>员工工作台</span></div><img src="../assets/images/quality/inspection.svg" alt="" /></div><div class="panel"><h1>应用登录</h1><p class="muted">使用当前应用的账号和密码登录</p><MobileNotice v-if="vm.error" :message="vm.error" type="error" show-icon /><BusinessForm layout="vertical" :model="vm.form" @submit="vm.login">
 
 <BusinessField label="应用账号" name="username" :rules="[{required:true,whitespace:true,message:'请输入应用账号'}]"><van-field v-model="vm.form.username" placeholder="请输入应用账号" autocomplete="username" :disabled="vm.loading" /></BusinessField>
 <BusinessField label="密码" name="password" :rules="[{required:true,message:'请输入密码'}]"><van-field v-model="vm.form.password" autocomplete="current-password" :disabled="vm.loading"  type="password" /></BusinessField>
 <van-button type="primary" native-type="submit" block :loading="vm.loading" size="large">登录</van-button>
 </BusinessForm></div><p class="login-footnote">应用账号 · 项目权限 · 跨端协同</p><LoginVerification v-if="vm.verification" :requirement="vm.verification" @success="vm.completeVerification" @cancel="vm.cancelVerification" /></section></template>
