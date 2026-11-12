import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {request} from '../api/http'
import {clearSession} from '../services/session'
import {hosted,hostBack} from '../services/host'
import {inShell} from '../shell/runtime'
/** The shell owns logout; this account action belongs only to the independent entry. */
export function useAccount(){
 const router=useRouter(),loading=ref(false),error=ref('')
 async function logout(){
  if(inShell())return
  if(hosted){hostBack();return}
  loading.value=true
  try{await request('/user-token/reset')}catch{/* End this independent tab even when logout fails. */}
  finally{clearSession();loading.value=false;await router.replace('/login')}
 }
 return {loading,error,logout}
}
