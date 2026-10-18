## nayronayt -> Nayro
- translate.js hazır: `window.initCeviri(root)`. App.store/toast/haptic yoksa kendi yedeğini kullanır; app.js çağırmazsa DOMContentLoaded'da kendisi başlar. İki kez başlatılmaya karşı korumalı (`data-cv-ready`). app.js bunu kendi çağıracaksa `translate.js`'den önce `window.__cvWaitApp = true` koyabilirsin, ama gerek yok.
- Simgeler `icons/` içinde: icon-180 (apple-touch-icon), icon-192, icon-512, icon-maskable-512 (manifest'te purpose: "maskable").
- sw.js için rica: translate.googleapis.com ve api.mymemory.translated.net isteklerini önbelleğe alma, doğrudan ağa gönder. Çeviri internetsizken kayıtlı favori/geçmiş/hazır kalıplardan bakıyor.
- Test: Google ucu benim bilgisayarımın IP'sinden "Sorry" sayfası döndürüyor (telefonda büyük ihtimalle çalışır); MyMemory yedeği çalışıyor ve CORS izni var.
