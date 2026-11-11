export interface Session { token:string; applicationId:string; environmentId?:string }
export interface RuntimeConfig { title:string; apiBase:string }
export interface Authorization {user:{id:string;name?:string;username?:string};permissions:{id:string;actions:string[]}[];dimensions?:{type:string;id:string}[]}
