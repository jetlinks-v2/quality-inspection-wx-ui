import test from 'node:test'
import assert from 'node:assert/strict'
import {computed,ref} from 'vue'
import {bindShell,shellRequest,shellState} from '../src/shell/runtime'
function fixture(respond=(..._args:unknown[])=>Promise.resolve({ok:true})){
 const project=ref<{code:string;name:string}|null>({code:'project',name:'项目'})
 const application=ref<{id:string;name:string;templateId:string;templateCode:string}|null>({id:'real-app',name:'应用',templateId:'template',templateCode:'RealCode'})
 const calls:unknown[][]=[]
 const context={project:computed(()=>project.value),application:computed(()=>application.value),request:async(...args:unknown[])=>{calls.push(args);return respond(...args)}}
 const dispose=bindShell(context,['RealCode'])
 return {project,application,calls,dispose}
}
test('preview and wrong template never issue a business request',async()=>{
 const project=computed(()=>({code:'project',name:'项目'})),application=computed(()=>null)
 let calls=0
 const dispose=bindShell({project,application,request:async()=>{calls++}},['RealCode'])
 await assert.rejects(shellRequest('/authorize/me'),/真实应用/);assert.equal(calls,0);dispose()
 const wrong=fixture();wrong.application.value!.templateCode='Wrong'
 await assert.rejects(shellRequest('/business/_query'),/已变化/);assert.equal(wrong.calls.length,0);wrong.dispose()
})
test('JSON, multipart and authenticated Blob preserve the official request options',async()=>{
 const blob=new Blob(['image'],{type:'image/png'}),vm=fixture(async()=>blob),body=new FormData();body.append('file',blob)
 assert.equal(await shellRequest('/file/upload',{method:'POST',body}),blob)
 assert.equal((vm.calls[0]![1] as {body:unknown}).body,body)
 assert.equal(await shellRequest('/file/image',{responseType:'blob'}),blob)
 assert.equal((vm.calls[1]![1] as {responseType:string}).responseType,'blob');vm.dispose()
})
test('application changes reject the old response',async()=>{
 let finish!:(value:unknown)=>void
 const vm=fixture(()=>new Promise(resolve=>{finish=resolve})),result=shellRequest('/business/_query')
 vm.application.value={...vm.application.value!,id:'other-app'};finish({old:true})
 await assert.rejects(result,/已变化/);vm.dispose()
})
test('dispose aborts pending work and a late 401 cannot expire its replacement',async()=>{
 let reject!:(error:Error)=>void
 const vm=fixture(()=>new Promise((_resolve,fail)=>{reject=fail})),result=shellRequest('/business/_query')
 const signal=(vm.calls[0]![1] as {signal:AbortSignal}).signal;vm.dispose();assert.equal(signal.aborted,true)
 const replacement=fixture();reject(Object.assign(Error('old expired'),{httpStatus:401}))
 await assert.rejects(result,/old expired/);assert.equal(shellState.error,'');assert.deepEqual(await shellRequest('/business/_query'),{ok:true});replacement.dispose()
})
test('ordinary 403 preserves shell access; genuine 401 blocks subsequent requests',async()=>{
 const vm=fixture(async()=>{throw Object.assign(Error('denied'),{httpStatus:403})})
 await assert.rejects(shellRequest('/business/_query'),/denied/);assert.equal(shellState.error,'');vm.dispose()
 const expired=fixture(async()=>{throw Object.assign(Error('expired'),{httpStatus:401})})
 await assert.rejects(shellRequest('/business/_query'),/expired/);assert.match(shellState.error,/失效/)
 await assert.rejects(shellRequest('/business/_query'),/失效/);assert.equal(expired.calls.length,1);expired.dispose()
})
test('caller cancellation is forwarded and canceled responses cannot succeed',async()=>{
 const vm=fixture(),controller=new AbortController();controller.abort()
 await assert.rejects(shellRequest('/business/_query',{signal:controller.signal}),{name:'AbortError'});vm.dispose()
})
