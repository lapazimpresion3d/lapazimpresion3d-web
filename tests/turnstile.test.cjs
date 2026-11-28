const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const server=fs.readFileSync('src/index.js','utf8');
const helper=server.slice(server.indexOf('async function verificarTurnstile('),server.indexOf('async function api('));
function harness(response){
 const calls=[];
 const context={URL,URLSearchParams,AbortSignal,error:(message,status)=>({message,status}),fetch:async(url,opts)=>{calls.push({url,opts});if(response instanceof Error)throw response;return response;}};
 vm.createContext(context);vm.runInContext(helper,context);
 const request=(token,hostname='lapazimpresion3d.com')=>({url:'https://'+hostname+'/api/web/propuestas',headers:{get:key=>key==='X-Turnstile-Token'?token:null}});
 return {calls,verify:(token,secret='test-only-secret',action='cotizacion_web',host)=>context.verificarTurnstile(request(token,host),{TURNSTILE_SECRET:secret},action)};
}
const good={success:true,action:'cotizacion_web',hostname:'lapazimpresion3d.com'};
const response=data=>({ok:true,json:async()=>data});
test('valid token reaches Siteverify and is accepted',async()=>{const h=harness(response(good));assert.equal(await h.verify('test-token'),null);assert.equal(h.calls.length,1);assert.equal(h.calls[0].url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');assert.equal(h.calls[0].opts.body.get('response'),'test-token');});
test('missing secret, missing token and oversized token fail without external request',async()=>{const h=harness(response(good));assert.equal((await h.verify('x','')).status,503);assert.equal((await h.verify(null)).status,400);assert.equal((await h.verify('x'.repeat(2049))).status,400);assert.equal(h.calls.length,0);});
test('invalid, expired, reused, wrong action and wrong hostname rejected',async()=>{for(const data of [{success:false,'error-codes':['timeout-or-duplicate']},{...good,success:false},{...good,action:'cotizacion_quiz'},{...good,hostname:'example.org'},{...good,hostname:'www.lapazimpresion3d.com'}]){assert.equal((await harness(response(data)).verify('token')).status,403);}});
test('provider failure closes submission safely',async()=>{for(const res of [new Error('network'),{ok:false},{ok:true,json:async()=>{throw Error('bad JSON')}}])assert.equal((await harness(res).verify('token')).status,503);});
test('three routes verify before parsing or writes; three pages load matching scripts',()=>{for(const [route,action,page,script] of [['web','cotizacion_web','cotizacion-web','cotizacion-web'],['servicios','cotizacion_impresion','cotizar-impresion','cotizar-impresion'],['quiz','cotizacion_quiz','index','quiz-negocio']]){const start=server.indexOf('/api/'+route+'/propuestas');assert.ok(start>=0);const part=server.slice(start);const verify=part.indexOf('verificarTurnstile(request,env,"'+action+'")');assert.ok(verify>=0&&verify<500);assert.ok(verify<part.indexOf('INSERT'));const html=fs.readFileSync('public/'+page+'.html','utf8');assert.ok(html.indexOf('js/turnstile.js')>=0&&html.indexOf('js/turnstile.js')<html.indexOf('js/'+script+'.js'));const js=fs.readFileSync('public/js/'+script+'.js','utf8');assert.ok(js.includes('X-Turnstile-Token'));assert.ok(js.includes(action));}});
