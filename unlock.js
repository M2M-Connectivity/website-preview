(()=>{
const form=document.querySelector('form'),field=document.querySelector('input'),statusLine=document.querySelector('[role=status]');
let payload;
form.addEventListener('submit',async event=>{
 event.preventDefault();form.querySelector('button').disabled=true;statusLine.textContent='Opening preview…';
 try{
  if(!payload){const res=await fetch('preview.bin');if(!res.ok)throw Error('load');payload=new Uint8Array(await res.arrayBuffer());}
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(field.value),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:payload.slice(0,16),iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
  const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:payload.slice(16,28)},key,payload.subarray(28));
  const html=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  field.value='';document.open();document.write(html);document.close();
 }catch(error){statusLine.textContent=error.name==='OperationError'?'Incorrect password. Try again.':'Could not open the preview. Reload and try again.';form.querySelector('button').disabled=false;field.focus();}
});
})();
