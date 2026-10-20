/* Native clock handoff; never equates launching another app with a confirmed alarm. */
(function () {
  'use strict';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shortcut = 'Günlük Asistan Alarm';
  const time = d => d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
  function eligible(at, now = new Date()) {
    const next = new Date(now);next.setHours(at.getHours(),at.getMinutes(),0,0);
    if (next <= now) next.setDate(next.getDate()+1);
    return at > now && Math.abs(next.getTime()-at.getTime()) < 1000;
  }
  function url(platform, at) {
    if (platform === 'ios') return 'shortcuts://run-shortcut?name='+encodeURIComponent(shortcut)+'&input=text&text='+encodeURIComponent(at.toISOString());
    const fallback = new URL(location.pathname, location.origin);fallback.hash='alarm-setup';
    return 'intent://alarm?at='+at.getTime()+'#Intent;scheme=gunlukasistan;package=org.gunlukasistan.alarmbridge;S.browser_fallback_url='+encodeURIComponent(fallback.href)+';end';
  }
  function open(platform) {
    const info = App.nextAlarm(), at = info?.at;
    if (!platform) platform = /Android/i.test(navigator.userAgent) ? 'android' : /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : null;
    if (!at) return App.openSheet('<h3>Telefon alarmı</h3><div class="empty">Önümüzdeki günlerde vardiya alarmı yok. Önce vardiya düzenini ayarla.</div>');
    const canLaunch = eligible(at);
    const ready = platform && App.store.get('phoneAlarmSetup:'+platform,false);
    const date = at.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'});
    const setup = platform === 'ios' ? `<div class="section-title">iPhone · bir defalık kurulum</div><ol class="setup-steps"><li>Kestirmeler uygulamasında yeni bir kestirme oluştur ve adını <strong>${shortcut}</strong> yap.</li><li><strong>Girdiden Tarihleri Al</strong> eylemini ekle; girdi olarak <strong>Kestirme Girdisi</strong> seç.</li><li><strong>Listeden Öğe Al</strong> ile ilk tarihi al.</li><li><strong>Alarm Oluştur</strong> eyleminde saati bu tarihe bağla. Etiketi “Günlük Asistan”, yinelemeyi “Asla” yap.</li></ol>` : platform === 'android' ? `<div class="section-title">Android · bir defalık kurulum</div><p class="section-foot">Günlük Alarm yardımcı uygulamasını bu telefona kur. Bağlantı bu uygulamayı, ardından telefonunun Saat ekranını açar.</p><a class="btn secondary alarm-launch quick-action" href="downloads/gunluk-alarm-test.apk" download>Android test uygulamasını indir</a><p class="section-foot">Bu bir yerel test paketidir; Play Store sürümü değildir. Yalnız alarm kurma izni ister, internet erişimi istemez.</p>` : '<p class="section-foot">Alarmı kuracağın telefonu seç. Bu bilgisayarda telefon alarmı kurulmaz.</p>';
    App.openSheet(`<h3>Telefonda alarm kur</h3><div class="alarm-time">${esc(time(at))}</div><p class="alarm-date">${esc(date)} · ${esc(info.type)} vardiyasından 2 saat önce</p><div class="alarm-platforms"><button class="btn ${platform==='ios'?'':'secondary'}" data-phone="ios">iPhone</button><button class="btn ${platform==='android'?'':'secondary'}" data-phone="android">Android</button></div>
      ${!canLaunch ? '<div class="team-notice">Bu tarih, Saat uygulamasının sıradaki alarm saatinden daha ileride. Yanlış gün çalmaması için şimdi kurulmuyor. Alarm günü yaklaşınca tekrar aç veya takvim hatırlatıcısı ekle.</div>' : ''}
      ${setup}
      ${platform ? `<label class="setup-confirm"><input type="checkbox" id="phone-ready" ${ready?'checked':''}><span>${platform==='ios'?'Kestirmeyi yukarıdaki gibi hazırladım.':'Günlük Alarm yardımcı uygulamasını kurdum.'}</span></label><a class="btn alarm-launch" id="phone-launch" href="${esc(url(platform,at))}" aria-disabled="${!ready||!canLaunch}" ${!ready||!canLaunch?'tabindex="-1"':''}>${platform==='ios'?'Kestirmeyi çalıştır':'Saat uygulamasına geç'}</a>` : ''}
      <p class="section-foot" id="phone-result" role="status">Kurulumdan sonra Saat uygulamasında alarmın açık olduğunu kontrol et. Bu web uygulaması telefon alarmını doğrulayamaz veya silemez. Vardiyan değişirse eski alarmı Saat'ten düzelt.</p><button type="button" class="btn plain" id="phone-calendar">Takvim hatırlatıcısı ekle</button>`, root => {
      root.querySelectorAll('[data-phone]').forEach(b=>b.onclick=()=>open(b.dataset.phone));
      const check=root.querySelector('#phone-ready'), launch=root.querySelector('#phone-launch');
      if(check) check.onchange=()=>{App.store.set('phoneAlarmSetup:'+platform,check.checked);launch.setAttribute('aria-disabled',String(!check.checked||!canLaunch));launch.tabIndex=check.checked&&canLaunch?0:-1;};
      if(launch) launch.onclick=e=>{
        if(!check.checked||!eligible(at)){e.preventDefault();if(!eligible(at))open(platform);return;}
        const deviceOK = platform==='android' ? /Android/i.test(navigator.userAgent) : /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
        if(!deviceOK){e.preventDefault();App.toast('Bu bağlantıyı '+(platform==='ios'?'iPhone':'Android telefon')+' üzerinde aç.');return;}
        root.querySelector('#phone-result').textContent='Telefon uygulamasına geçiliyor. Saat uygulamasında alarmı kontrol et; burada “kuruldu” olarak işaretlenmez.';
      };
      root.querySelector('#phone-calendar').onclick=()=>App.exportAlarmIcs();
    });
  }
  window.GAPhoneAlarm={open,eligible};
})();
