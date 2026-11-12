import {request,downloadBlob} from './http'
import {qualityClient} from '../../shared/client'
import type {Authorization} from '../types'
export const authorize=()=>request<Authorization>('/authorize/me')
export const quality=qualityClient({get:<T>(url:string)=>request<T>(url),post:<T>(url:string,data:unknown)=>request<T>(url,data),remove:<T>(url:string)=>request<T>(url,undefined,'DELETE'),upload:async(url:string,file:File)=>{const form=new FormData();form.append('file',file);return request(url,form)},download:downloadBlob})
