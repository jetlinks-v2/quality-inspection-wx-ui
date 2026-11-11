import {createApp,watch} from 'vue'
import {createRouter,createWebHashHistory} from 'vue-router'
import 'vant/lib/index.css'
import './style.css'
import './components/mobile/mobile.css'
import Root from './Root.vue'
import {state} from './services/session'
import {hosted,hostState} from './services/host'
import {installMobile} from './components/mobile/install'
export const router=createRouter({history:createWebHashHistory(),routes:[
{path:'/',component:()=>import('./views/HomePage.vue')},
{path:'/login',component:()=>import('./views/LoginPage.vue')},
{path:'/orders',component:()=>import('./views/OrderListPage.vue')},
{path:'/orders/:id',component:()=>import('./views/OrderDetailPage.vue')},
{path:'/profile',component:()=>import('./views/ProfilePage.vue')},
{path:'/:pathMatch(.*)*',redirect:'/'}]})
router.beforeEach(to=>{
 if(!state.ready)return true
 if(hosted&&hostState.error)return false
 if(hosted&&to.path==='/login')return '/'
 if(to.path!=='/login'&&!state.session)return '/login'
 return true
})
const app=createApp(Root);installMobile(app);app.use(router).mount('#app')
