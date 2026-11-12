<script setup lang="ts">
import {inShell} from '../shell/runtime'
import MobileNotice from '../components/mobile/MobileNotice.vue'
import {Button as VanButton} from 'vant'
import {reactive} from 'vue'
import {RightOutlined,FileSearchOutlined,ToolOutlined,SafetyCertificateOutlined,CheckCircleOutlined,HistoryOutlined,LogoutOutlined} from '../components/mobile/icons'
import {state} from '../services/session'
import {useAccount} from '../hooks/useAccount'
import {qualityModes} from '../services/navigation'
import {qualityText as qt} from '../../shared/i18n'

const vm=reactive(useAccount())
const icons={inspect:FileSearchOutlined,rectify:ToolOutlined,review:SafetyCertificateOutlined,completed:CheckCircleOutlined,related:HistoryOutlined}
</script>

<template>
 <section class="page profile-page">
  <div class="profile-panel panel"><div class="avatar">{{(state.authorization?.user.name||state.authorization?.user.username||qt('h5Employee')).slice(0,1)}}</div><h2>{{state.authorization?.user.name||state.authorization?.user.username||qt('h5Employee')}}</h2><span class="profile-badge"><SafetyCertificateOutlined aria-hidden="true" /> {{qt('h5EmployeeWorkspace')}}</span></div>
  <div class="panel profile-links"><router-link v-for="item in qualityModes" :key="item.value" class="setting-row" :to="'/orders?mode='+item.value"><i><component :is="icons[item.value]" aria-hidden="true" /></i><span>{{item.value==='related'?qt('h5ParticipationHistory'):item.label}}</span><RightOutlined aria-hidden="true" /></router-link></div>
  <MobileNotice v-if="vm.error" :message="vm.error" type="error" show-icon />
  <van-button v-if="!inShell()" block type="danger" :loading="vm.loading" class="logout-button" @click="vm.logout" native-type="button"><LogoutOutlined aria-hidden="true" />{{qt('h5Logout')}}</van-button>
 </section>
</template>
