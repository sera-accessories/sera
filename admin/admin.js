(function(){
  const configured=!!(window.SERA_SUPABASE_URL&&window.SERA_SUPABASE_ANON_KEY&&window.supabase);
  const login=document.getElementById('login'), dash=document.getElementById('dashboard'), msg=document.getElementById('loginMsg');
  if(!configured){msg.textContent='أضف بيانات Supabase داخل supabase-config.js أولاً.';document.getElementById('loginBtn').disabled=true;return;}
  const db=window.supabase.createClient(window.SERA_SUPABASE_URL,window.SERA_SUPABASE_ANON_KEY);
  const $=id=>document.getElementById(id);
  async function boot(){const {data:{session}}=await db.auth.getSession(); if(session) show();}
  function show(){login.hidden=true;dash.hidden=false;loadSettings();loadProducts();}
  function fail(e){msg.textContent=e?.message||String(e);}
  $('loginBtn').onclick=async()=>{msg.textContent='...';const {error}=await db.auth.signInWithPassword({email:$('email').value,password:$('password').value});if(error)return fail(error);show();};
  $('logoutBtn').onclick=async()=>{await db.auth.signOut();location.reload();};
  async function loadSettings(){const {data,error}=await db.from('site_settings').select('key,value');if(error)return alert(error.message);(data||[]).forEach(r=>{if($(r.key))$(r.key).value=r.value||'';});}
  $('saveSettings').onclick=async()=>{const keys=['whatsapp','instagram','tagline','heroText','banner'];for(const key of keys){const {error}=await db.from('site_settings').upsert({key,value:$(key).value},{onConflict:'key'});if(error)return alert(error.message);} alert('تم حفظ الإعدادات');};
  function clear(){['pid','name','category','price','image_url'].forEach(k=>$(k).value='');$('sold_out').checked=false;$('active').checked=true;}
  $('clearForm').onclick=clear;
  $('saveProduct').onclick=async()=>{const obj={name:$('name').value.trim(),category:$('category').value.trim(),price:Number($('price').value)||0,image_url:$('image_url').value.trim(),sold_out:$('sold_out').checked,active:$('active').checked};if(!obj.name)return alert('اكتب اسم المنتج');let res;if($('pid').value)res=await db.from('products').update(obj).eq('id',$('pid').value);else res=await db.from('products').insert(obj);if(res.error)return alert(res.error.message);clear();loadProducts();};
  async function loadProducts(){const box=$('products');box.textContent='تحميل...';const {data,error}=await db.from('products').select('*').order('created_at',{ascending:true});if(error){box.textContent=error.message;return;}box.textContent='';(data||[]).forEach(p=>{const row=document.createElement('div');row.className='product'+(p.active?'':' muted');const img=p.image_url?`<img src="${p.image_url}" alt="">`:'<div class="ph">SERA</div>';row.innerHTML=`${img}<div><b>${esc(p.name)}</b><div>${esc(p.category||'')} · ${p.price||0} ج.م ${p.active?'':'<span class="tag">مخفي</span>'} ${p.sold_out?'<span class="tag">خلصت</span>':''}</div></div><div class="actions"><button data-edit="${p.id}" class="secondary">تعديل</button><button data-toggle="${p.id}" class="secondary">${p.active?'إخفاء':'إظهار'}</button><button data-delete="${p.id}" class="danger">حذف</button></div>`;box.appendChild(row);});box.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>edit(b.dataset.edit,data));box.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=async()=>{const p=data.find(x=>x.id===b.dataset.toggle);await db.from('products').update({active:!p.active}).eq('id',p.id);loadProducts();});box.querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('تحذف المنتج؟'))return;await db.from('products').delete().eq('id',b.dataset.delete);loadProducts();});}
  function edit(id,data){const p=data.find(x=>x.id===id);$('pid').value=p.id;$('name').value=p.name;$('category').value=p.category||'';$('price').value=p.price||'';$('image_url').value=p.image_url||'';$('sold_out').checked=!!p.sold_out;$('active').checked=p.active!==false;scrollTo(0,0);}
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  boot();
})();
