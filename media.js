/* Small, explicit media previews. No upload happens until the user presses Send. */
(function () {
  'use strict';
  const MAX_BYTES = 300000, MAX_SECONDS = 30;
  const esc = s => String(s || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function validAvatar(value) { return typeof value === 'string' && value.length <= 30000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value); }
  function avatar(value, name, extra = '') { return `<span class="avatar ${extra}">${validAvatar(value) ? `<img src="${value}" alt="" decoding="async">` : esc((name || 'E')[0])}</span>`; }
  async function image(file, profile = false) {
    if (!file || !['image/jpeg','image/png','image/webp','image/heic','image/heif'].includes(file.type)) throw new Error('JPG, PNG veya WebP fotoğraf seç. HEIC açılamıyorsa JPG olarak paylaş.');
    if (file.size > 20 * 1024 * 1024) throw new Error('Fotoğraf en fazla 20 MB olabilir.');
    const url = URL.createObjectURL(file), img = new Image();
    try {
      img.src = url; await img.decode();
      if (!img.naturalWidth || !img.naturalHeight) throw new Error();
      const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
      const max = profile ? 160 : 960, budget = profile ? 20000 : 180000;
      const side = Math.min(img.naturalWidth,img.naturalHeight);
      const ratio = Math.min(1,max / Math.max(img.naturalWidth,img.naturalHeight));
      canvas.width = profile ? 160 : Math.max(1,Math.round(img.naturalWidth*ratio));
      canvas.height = profile ? 160 : Math.max(1,Math.round(img.naturalHeight*ratio));
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
      if (profile) ctx.drawImage(img,(img.naturalWidth-side)/2,(img.naturalHeight-side)/2,side,side,0,0,160,160);
      else ctx.drawImage(img,0,0,canvas.width,canvas.height);
      for (const quality of [.82,.65,.45,.25]) {
        const blob = await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
        if (blob && blob.size <= budget) return {blob,kind:'image',mime:'image/jpeg',size:blob.size,duration:0};
      }
      throw new Error('Fotoğraf küçültülemedi. Daha küçük bir fotoğraf seç.');
    } catch(e) { throw new Error(e.message?.includes('küçültülemedi') ? e.message : 'Fotoğraf açılamadı. JPG, PNG veya WebP biçiminde yeniden seç.'); }
    finally { URL.revokeObjectURL(url); }
  }
  function dataUrl(blob) { return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);}); }
  function friendly(e) {
    if (['NotAllowedError','SecurityError'].includes(e?.name)) return 'Mikrofon izni verilmedi. Tarayıcının site izinlerinden açabilirsin.';
    if(e?.name==='NotFoundError') return 'Mikrofon bulunamadı.';
    if(e?.name==='NotReadableError') return 'Mikrofon başka bir uygulama tarafından kullanılıyor olabilir.';
    if(e?.code==='permission-denied') return 'Paylaşım izni yok. Oda üyeliğini kontrol et.';
    if(e?.code==='resource-exhausted') return 'Ücretsiz kullanım kotası doldu. Daha sonra tekrar dene.';
    if(e?.code==='unavailable'||!navigator.onLine) return 'İnternet bağlantısı gerekiyor. Gönderim tamamlanmadı.';
    return e?.message && !e?.code ? e.message : 'Gönderilemedi. Yeniden dene.';
  }
  function composer(kind, send) {
    let root, alive=true, stream=null, recorder=null, timer=null, started=0, parts=[], total=0, payload=null, url=null, generation=0, busy=false;
    const stopTracks=()=>{stream?.getTracks().forEach(t=>t.stop());stream=null;};
    const stop=()=>{clearInterval(timer);timer=null;if(recorder?.state==='recording')recorder.stop();stopTracks();};
    const cleanup=()=>{alive=false;generation++;stop();if(url)URL.revokeObjectURL(url);window.removeEventListener('ga:sheetclose',cleanup);window.removeEventListener('ga:auth',closeForAuth);document.removeEventListener('visibilitychange',hidden);};
    const hidden=()=>{if(document.hidden && recorder?.state==='recording')stop();};
    const closeForAuth=()=>{if(alive)App.closeSheet();};
    const message=t=>{if(alive)root.querySelector('.form-error').textContent=t;};
    function preview(value) {
      if(!alive)return;payload=value;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(value.blob);
      root.querySelector('#media-preview').innerHTML=kind==='image'?`<img class="media-preview" src="${url}" alt="Gönderilecek fotoğraf">`:`<audio controls preload="metadata" src="${url}" aria-label="Sesli mesaj önizlemesi"></audio><p class="section-foot">${value.duration} saniye · göndermeden önce dinleyebilirsin.</p>`;
      root.querySelector('#media-send').disabled=false;
    }
    App.openSheet(`<h3>${kind==='image'?'Fotoğraf gönder':'Sesli mesaj'}</h3><p class="section-foot">${kind==='image'?'Fotoğraf otomatik küçültülür. Yalnız bu odanın üyeleri görebilir.':'En fazla 30 saniye. Kaydı dinleyip gönderebilir veya vazgeçebilirsin.'}</p><div id="media-preview" class="media-stage"></div>${kind==='image'?'<label class="btn secondary file-button">Fotoğraf seç<input id="media-file" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"></label>':'<p id="record-time" class="record-time" role="status">Kayda hazır</p><button id="record-start" class="btn secondary" type="button">Kayda başla</button><button id="record-stop" class="btn danger" type="button" hidden>Kaydı durdur</button>'}<p class="form-error" role="alert"></p><div class="stack quick-action"><button id="media-send" class="btn" disabled>Gönder</button><button id="media-cancel" class="btn plain">Vazgeç</button></div>`, el=>{root=el;});
    window.addEventListener('ga:sheetclose',cleanup);window.addEventListener('ga:auth',closeForAuth);document.addEventListener('visibilitychange',hidden);
    root.querySelector('#media-cancel').onclick=()=>App.closeSheet();
    root.querySelector('#media-send').onclick=async()=>{
      if(!payload||busy)return;busy=true;const button=root.querySelector('#media-send');button.disabled=true;button.textContent='Gönderiliyor…';message('');
      const file=root.querySelector('#media-file');if(file)file.disabled=true;root.querySelector('#media-cancel').textContent='Kapat';
      try {await send(payload);if(alive){App.closeSheet();App.toast('Gönderildi');}}
      catch(e){message(friendly(e));}
      finally{busy=false;if(alive){button.disabled=!payload;button.textContent='Gönder';if(file)file.disabled=false;root.querySelector('#media-cancel').textContent='Vazgeç';}}
    };
    if(kind==='image') root.querySelector('#media-file').onchange=async e=>{
      const seq=++generation;payload=null;root.querySelector('#media-send').disabled=true;message('');
      try{const value=await image(e.target.files[0]);if(alive&&seq===generation)preview(value);}catch(e){message(friendly(e));}
    };
    else {
      root.querySelector('#record-stop').onclick=stop;
      root.querySelector('#record-start').onclick=async()=>{
        if(busy)return;const seq=++generation;const start=root.querySelector('#record-start'),end=root.querySelector('#record-stop');
        start.disabled=true;payload=null;parts=[];total=0;root.querySelector('#media-send').disabled=true;message('');
        if(url){URL.revokeObjectURL(url);url=null;}root.querySelector('#media-preview').innerHTML='';
        try {
          if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error('Bu tarayıcı ses kaydını desteklemiyor. Güncel Safari veya Chrome ile aç.');
          const acquired=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true},video:false});
          if(!alive||seq!==generation){acquired.getTracks().forEach(t=>t.stop());return;}stream=acquired;
          const mime=['audio/mp4','audio/webm;codecs=opus','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported(t));
          if(!mime)throw new Error('Bu tarayıcıda desteklenen ses biçimi bulunamadı.');
          recorder=new MediaRecorder(stream,{mimeType:mime,audioBitsPerSecond:32000});started=Date.now();
          recorder.ondataavailable=e=>{if(e.data.size){parts.push(e.data);total+=e.data.size;if(total>MAX_BYTES)stop();}};
          recorder.onerror=()=>{generation++;stop();message('Ses kaydı kesildi. Yeniden kaydet.');start.hidden=false;start.disabled=false;end.hidden=true;};
          recorder.onstop=()=>{
            clearInterval(timer);stopTracks();if(!alive||seq!==generation)return;
            start.hidden=false;start.disabled=false;start.textContent='Yeniden kaydet';end.hidden=true;
            const blob=new Blob(parts,{type:mime.split(';')[0]}),duration=Math.max(1,Math.min(MAX_SECONDS,Math.ceil((Date.now()-started)/1000)));
            root.querySelector('#record-time').textContent='Kayıt tamamlandı';
            if(!blob.size||blob.size>MAX_BYTES){message('Kayıt boyutu sınırı aşıldı. Daha kısa bir kayıt yap.');return;}
            preview({blob,kind:'audio',mime:blob.type,size:blob.size,duration});
          };
          recorder.start(250);start.hidden=true;end.hidden=false;
          const tick=()=>{const seconds=Math.floor((Date.now()-started)/1000);if(alive)root.querySelector('#record-time').textContent=`Kayıt · ${Math.min(seconds,MAX_SECONDS)} / ${MAX_SECONDS} sn`;if(seconds>=MAX_SECONDS)stop();};tick();timer=setInterval(tick,200);
        } catch(e){stopTracks();if(alive){start.disabled=false;message(friendly(e));}}
      };
    }
  }
  window.GAMedia={image,dataUrl,avatar,validAvatar,composer,friendly,MAX_BYTES,MAX_SECONDS};
})();
