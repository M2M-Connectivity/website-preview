(()=>{
const form=document.querySelector('form'),field=document.querySelector('input'),statusLine=document.querySelector('[role=status]');
const gate=form.closest('main');
let payload;const slot='au-connectivity-preview-session-v1';
form.addEventListener('submit',async event=>{
 event.preventDefault();form.querySelector('button').disabled=true;statusLine.textContent='Opening preview…';
 try{
  if(!payload){const res=await fetch('preview.bin',{cache:'no-cache'});if(!res.ok)throw Error('load');payload=new Uint8Array(await res.arrayBuffer());}
  let key;const cached=sessionStorage.getItem(slot);if(!field.value && cached){key=await crypto.subtle.importKey('raw',Uint8Array.from(atob(cached),c=>c.charCodeAt(0)),'AES-GCM',false,['decrypt']);}else{const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(field.value),'PBKDF2',false,['deriveKey']);
  key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:payload.slice(0,16),iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},true,['decrypt']);}
  const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:payload.slice(16,28)},key,payload.subarray(28));
  const html=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  if(key.extractable)sessionStorage.setItem(slot,btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey('raw',key)))));field.value='';document.open();document.write(html);document.close();
 }catch(error){sessionStorage.removeItem(slot);gate.hidden=false;statusLine.textContent=error.name==='OperationError'?'Incorrect password. Try again.':'Could not open the preview. Reload and try again.';form.querySelector('button').disabled=false;field.focus();}
});
if(sessionStorage.getItem(slot)){
 form.dispatchEvent(new Event('submit',{cancelable:true}));
}else{
 gate.hidden=false;
}
})();
