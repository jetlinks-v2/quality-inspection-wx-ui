import type {MobileAppModule} from '@jetlinks-mobile-core'
import {jetlinksMobile} from './package.json'
import {businessRoutes} from './src/businessRoutes'
const {id,name,templateCodes}=jetlinksMobile
const entryPath=`/applications/${id}`
export default {id,name,templateCodes,entryPath,getRoutes:()=>[{path:entryPath,name:`${id}:entry`,meta:{title:name},component:()=>import('./src/shell/ModuleRoot.vue'),children:businessRoutes.map((route,index)=>({...route,name:`${id}:${index}`}))}]} satisfies MobileAppModule
