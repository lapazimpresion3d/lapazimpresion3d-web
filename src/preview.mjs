// Worker independiente para revisión visual. No importa el Worker de producción.
export function bloquear(path,method) {
  if (!['GET','HEAD'].includes(method)) return 405;
  let p; try{p=decodeURIComponent(path).toLowerCase();}catch{return 400;}
  if (/^\/(?:api|admin|cliente)(?:\/|$)/.test(p)) return 403;
  return 0;
}
export default {async fetch(request,env) {
  const url=new URL(request.url);
  const code=bloquear(url.pathname,request.method);
  if(code) return new Response(JSON.stringify({ok:false,error:'Vista previa de solo lectura. No se registran solicitudes ni se permite acceso administrativo.'}),{status:code,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex, nofollow'}});
  if(url.pathname==='/'&&!url.searchParams.has('revision-demos')){
    url.searchParams.set('revision-demos','1');
    return Response.redirect(url.href,302);
  }
  const asset=await env.ASSETS.fetch(request);
  const headers=new Headers(asset.headers);
  headers.set('x-robots-tag','noindex, nofollow, noarchive');
  headers.set('cache-control','no-store');
  headers.set('content-security-policy',"form-action 'none'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'");
  let result=new Response(asset.body,{status:asset.status,statusText:asset.statusText,headers});
  if(request.method==='GET'&&asset.ok&&/text\/html/i.test(headers.get('content-type')||'')){
    result=new HTMLRewriter().on('body',{element(el){el.prepend('<aside role="status" style="background:#ffcf40;color:#142c4b;padding:10px;text-align:center;font:600 14px/1.5 system-ui">VISTA PREVIA · Solo revisión. No se guardan solicitudes ni se realizan pagos.</aside>',{html:true});}}).transform(result);
  }
  return result;
}};
