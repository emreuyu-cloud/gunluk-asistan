(function () {
  'use strict';
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function save(connection, value) {
    const {fs,db,user}=connection;
    if(!user||!navigator.onLine)throw new Error('Profilini kaydetmek için giriş ve internet bağlantısı gerekiyor.');
    const name=value.name.trim(),avatar=value.avatar||'';
    if(!name||name.length>40|| (avatar && !GAMedia.validAvatar(avatar)))throw new Error('Adını ve fotoğrafını kontrol et.');
    await fs.setDoc(fs.doc(db,'users',user.uid,'data','profile'),{name,avatar,updatedAt:fs.serverTimestamp()});
    App.store.set('teamName:'+user.uid,name);
    // Independent writes keep rule document reads within Firestore's batch limit.
    const rooms=await fs.getDocsFromServer(fs.collection(db,'users',user.uid,'rooms'));
    const results=await Promise.allSettled(rooms.docs.map(r=>fs.updateDoc(fs.doc(db,'rooms',r.id,'members',user.uid),{name,avatar})));
    return results.filter(r=>r.status==='rejected').length;
  }
  async function open() {
    App.openSheet('<h3>Profilim</h3><div class="empty">Profil yükleniyor…</div>');
    let alive=true;const close=()=>{alive=false;window.removeEventListener('ga:sheetclose',close);};window.addEventListener('ga:sheetclose',close);
    try {
      const c=await GAAccount.connection();if(!c?.user)return GAAccount.open();
      const snapshot=await c.fs.getDocFromServer(c.fs.doc(c.db,'users',c.user.uid,'data','profile'));
      if(!alive)return;const profile=snapshot.exists()?snapshot.data():GAAccount.profile();
      render(c,profile);
    } catch(e) {if(alive)App.openSheet(`<h3>Profilim</h3><p class="form-error">${esc(GAMedia.friendly(e))}</p><button class="btn secondary" id="profile-retry">Yeniden dene</button>`,root=>{root.querySelector('#profile-retry').onclick=open;});}
  }
  function render(c,profile) {
    let avatar=profile.avatar||'',alive=true,processing=false,busy=false,sequence=0;
    App.openSheet(`<h3>Profilim</h3><form id="profile-form" class="stack"><div id="profile-avatar" class="profile-avatar">${GAMedia.avatar(avatar,profile.name)}</div><div class="profile-photo-actions"><label class="btn secondary file-button">Fotoğraf seç<input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"></label><button type="button" class="btn plain" id="profile-remove">Fotoğrafı kaldır</button></div><label class="form-label" for="profile-name">Görünen adın</label><input id="profile-name" class="input" maxlength="40" required autocomplete="name" value="${esc(profile.name)}"><p class="section-foot">Adın ve fotoğrafın katıldığın odalarda görünür. Fotoğraf ortadan kare olarak kırpılır. E-posta adresin oda üyeleriyle paylaşılmaz.</p><p class="form-error" role="alert"></p><button class="btn" id="profile-save" type="submit">Profili kaydet</button></form><button class="btn plain quick-action" type="button" id="profile-signout">Çıkış yap</button>`,root=>{
      const cleanup=()=>{alive=false;sequence++;window.removeEventListener('ga:sheetclose',cleanup);window.removeEventListener('ga:auth',authClose);};
      const authClose=()=>{if(alive)App.closeSheet();};window.addEventListener('ga:sheetclose',cleanup);window.addEventListener('ga:auth',authClose);
      const error=root.querySelector('.form-error'),button=root.querySelector('#profile-save'),input=root.querySelector('#profile-photo');
      const draw=()=>{root.querySelector('#profile-avatar').innerHTML=GAMedia.avatar(avatar,root.querySelector('#profile-name').value);};
      root.querySelector('#profile-name').oninput=draw;
      input.onchange=async()=>{
        const file=input.files[0];if(!file)return;const seq=++sequence;processing=true;button.disabled=true;error.textContent='';
        try{const result=await GAMedia.image(file,true);const data=await GAMedia.dataUrl(result.blob);if(alive&&seq===sequence){avatar=data;draw();}}
        catch(e){if(alive)error.textContent=GAMedia.friendly(e);}
        finally{if(alive&&seq===sequence){processing=false;button.disabled=false;}}
      };
      root.querySelector('#profile-remove').onclick=()=>{sequence++;processing=false;button.disabled=false;avatar='';input.value='';draw();};
      root.querySelector('#profile-form').onsubmit=async e=>{
        e.preventDefault();if(processing||busy)return;busy=true;button.disabled=true;error.textContent='';button.textContent='Kaydediliyor…';
        input.disabled=true;root.querySelector('#profile-remove').disabled=true;
        try{const failed=await save(c,{name:root.querySelector('#profile-name').value,avatar});if(alive){if(failed)error.textContent='Profil kaydedildi; bazı odalar güncellenemedi. Aynı bilgilerle tekrar kaydet.';else{App.closeSheet();App.toast('Profilin kaydedildi');}}}
        catch(e){if(alive)error.textContent=GAMedia.friendly(e);}
        finally{busy=false;if(alive){button.disabled=false;button.textContent='Profili kaydet';input.disabled=false;root.querySelector('#profile-remove').disabled=false;}}
      };
      root.querySelector('#profile-signout').onclick=async()=>{try{await c.authMod.signOut(c.authMod.getAuth());if(alive)App.closeSheet();App.toast('Çıkış yapıldı');}catch(e){error.textContent='Çıkış yapılamadı. Yeniden dene.';}};
    });
  }
  window.GAProfile={open,save};
})();
