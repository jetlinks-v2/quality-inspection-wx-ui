import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { parse, compileScript } from 'vue/compiler-sfc'
import { createRenderer, defineComponent, h, nextTick, reactive, provide, ref } from 'vue'

const entry = fileURLToPath(new URL('../src/components/mobile/SelectField.vue', import.meta.url))
const bundled = await build({ entryPoints: [entry], bundle: true, write: false, platform: 'node', format: 'cjs', external: ['vue'], plugins: [{
  name: 'selection-component', setup(builder) {
    builder.onResolve({filter: /^vant$/}, () => ({path: 'vant', namespace: 'controls'}))
    builder.onLoad({filter: /.*/, namespace: 'controls'}, () => ({contents: `export const Button='VanButton',Cell='VanCell',Checkbox='VanCheckbox',Empty='VanEmpty',Field='VanField',Icon='VanIcon',Loading='VanLoading',Popup='VanPopup',Search='VanSearch'`}))
    builder.onResolve({filter: /^\.\.\/(i18n|services\/mobileText)$/}, () => ({path: 'locale', namespace: 'locale'}))
    builder.onLoad({filter: /.*/, namespace: 'locale'}, () => ({contents: `export const useI18n=()=>({t:key=>key});export const m=(zh,en)=>zh`}))
    builder.onLoad({filter: /\.vue$/}, args => {
      const {descriptor} = parse(readFileSync(args.path, 'utf8'), {filename: args.path})
      return {contents: compileScript(descriptor, {id: 'selection-test', inlineTemplate: true}).content, loader: 'ts'}
    })
  }
}] })
const loaded={exports:{}}
new Function('require','module','exports',bundled.outputFiles[0].text)(createRequire(import.meta.url), loaded, loaded.exports)
const Component=loaded.exports.default
const renderer=createRenderer({
  createElement: tag=>({tag,props:{},children:[]}),createText: text=>({text,children:[]}),createComment: text=>({text,children:[]}),
  insert(node,parent,anchor){if(node.parent){const i=node.parent.children.indexOf(node);if(i>=0)node.parent.children.splice(i,1)}node.parent=parent;const i=anchor?parent.children.indexOf(anchor):-1;if(i<0)parent.children.push(node);else parent.children.splice(i,0,node)},
  remove(node){const i=node.parent?.children.indexOf(node)??-1;if(i>=0)node.parent.children.splice(i,1)},
  setText(node,text){node.text=text},setElementText(node,text){node.text=text;node.children=[]},patchProp(node,key,_old,value){node.props[key]=value},parentNode:node=>node.parent,nextSibling:node=>node.parent?.children[node.parent.children.indexOf(node)+1]
})
function mount(initial={}) {
  const props=reactive({options:[{value:'a',label:'项目甲'},{value:'b',label:'项目乙'},{value:'blocked',label:'无权项目',disabled:true}],modelValue:'a',...initial})
  const emitted=[], target={tag:'business-root'}, container={children:[]}
  const app=renderer.createApp(defineComponent({setup(){provide('business-popup-target',ref(target));return()=>h(Component,{...props,'onUpdate:modelValue':value=>{emitted.push(value);props.modelValue=value},'onUpdate:show':value=>{if(props.show!==undefined)props.show=value}})}}))
  app.mount(container)
  const all=()=>{const rows=[];function walk(node){rows.push(node);for(const child of node.children||[])walk(child)}walk(container);return rows}
  const find=(tag,match=()=>true)=>all().find(node=>node.tag===tag&&match(node))
  const popup=()=>find('VanPopup')
  const confirm=()=>find('VanButton',node=>node.props.type==='primary')
  const open=async()=>{find('VanField').props.onClick();await nextTick()}
  const choose=async label=>{find('VanCell',node=>node.props.title===label).props.onClick();await nextTick()}
  return {props,emitted,find,popup,confirm,open,choose,stop:()=>app.unmount(),target}
}
test('single choice, clear and cancel remain drafts until confirmation',async()=>{
 const view=mount({clearable:true})
 try {
  await view.open();assert.equal(view.popup().props.show,true)
  await view.choose('项目乙');assert.deepEqual(view.emitted,[])
  view.popup().props['onUpdate:show'](false);await nextTick();assert.equal(view.props.modelValue,'a')
  await view.open();assert.equal(view.find('VanCell',n=>n.props.title==='项目甲').props['aria-selected'],true)
  await view.choose('项目乙');view.confirm().props.onClick();await nextTick();assert.deepEqual(view.emitted,['b'])
  await view.open();view.find('VanButton',n=>n.props.type!=='primary').props.onClick();await nextTick();assert.equal(view.props.modelValue,'b')
  view.popup().props['onUpdate:show'](false);await nextTick();await view.open();assert.equal(view.find('VanCell',n=>n.props.title==='项目乙').props['aria-selected'],true)
  view.find('VanButton',n=>n.props.type!=='primary').props.onClick();await nextTick();view.confirm().props.onClick();await nextTick();assert.equal(view.props.modelValue,undefined)
 } finally {view.stop()}
})
test('hierarchy search keeps paths; non-project and newly revoked choices cannot be committed',async()=>{
 const view=mount({options:[{value:'org',label:'华东组织',disabled:true,children:[{value:'a',label:'项目甲'},{value:'b',label:'项目乙'}]}]})
 try {
  assert.equal(view.find('VanField').props['model-value'],'项目甲')
  await view.open();view.find('VanSearch').props['onUpdate:modelValue']('华东组织');await nextTick()
  assert.ok(view.find('VanCell',n=>n.props.title==='项目乙'))
  assert.equal(view.find('VanCell',n=>n.props.title==='项目乙').props.label,undefined)
  assert.equal(view.find('VanCell',n=>n.props.title==='项目乙').props.style.paddingLeft,'28px')
  await view.choose('华东组织');assert.equal(view.find('VanCell',n=>n.props.title==='华东组织').props['aria-selected'],false)
  await view.choose('项目乙');view.props.options[0].children[1].disabled=true;await nextTick();assert.equal(view.confirm().props.disabled,true)
  view.confirm().props.onClick();assert.deepEqual(view.emitted,[])
 } finally {view.stop()}
})
test('multi choice and tree path payloads preserve their business contracts',async()=>{
 const multi=mount({multiple:true,modelValue:['a']})
 try{await multi.open();await multi.choose('项目乙');assert.deepEqual(multi.emitted,[]);multi.confirm().props.onClick();await nextTick();assert.deepEqual(multi.props.modelValue,['a','b'])}finally{multi.stop()}
 const tree=mount({tree:true,modelValue:['org','a'],options:[{value:'org',label:'区域',children:[{value:'a',label:'楼栋甲'},{value:'b',label:'楼栋乙'}]}]})
 try{assert.equal(tree.find('VanField').props['model-value'],'楼栋甲');await tree.open();await tree.choose('区域');assert.equal(tree.find('VanCell',n=>n.props.title==='区域').props['aria-selected'],false);await tree.choose('楼栋乙');tree.confirm().props.onClick();await nextTick();assert.deepEqual(tree.props.modelValue,['org','b']);assert.equal(tree.find('VanField').props['model-value'],'楼栋乙')}finally{tree.stop()}
})
test('required/controlled sheet, loading, disabled and business teleport stay safe',async()=>{
 const view=mount({show:true,modelValue:undefined,closable:false})
 try{assert.equal(view.popup().props.show,true);assert.equal(view.popup().props.closeable,false);assert.equal(view.popup().props.teleport.tag,view.target.tag);assert.equal(view.confirm().props.disabled,true)
 await view.choose('项目乙');view.props.loading=true;await nextTick();assert.equal(view.confirm().props.disabled,true);view.confirm().props.onClick();assert.deepEqual(view.emitted,[])
 view.props.loading=false;await nextTick();view.confirm().props.onClick();await nextTick();assert.equal(view.props.modelValue,'b');assert.equal(view.props.show,false)
 }finally{view.stop()}
 const disabled=mount({disabled:true});try{await disabled.open();assert.equal(disabled.popup().props.show,false)}finally{disabled.stop()}
})
