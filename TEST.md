# Doğrulama — 20 Ekim 2026

## Profil ve medya güncellemesi — 21 Ekim 2026

- Güncel erişim kuralları: **11/11 geçti**. Özel profil, üyelikte fotoğraf/ad güncellemesi, eklerin atomik yazılması, üye olmayan erişimi, MIME/boyut/süre sınırları ve ayrılma sonrası erişim denetlendi.
- `npm run test:media`: iki emülatör hesabıyla profil fotoğrafı yükleme/kaldırma, kalıcılık, odalara yansıma, fotoğraf gönderme ve karşı tarafta açma geçti.
- Sentetik mikrofonla gerçek MediaRecorder kaydı, önizleme, karşı hesapta oynatma, 30 saniyede otomatik durdurma, kapanış/iptal/izin reddi ve geç sonuçlanan izin isteğinde mikrofon temizliği geçti.
- 320/390/768 px medya ekranları, yanlış dosya türü ve çevrimdışı gönderim hatası doğrulandı. Sayfa hatası: 0.
- Önceki ekip testleri ve 32 kişisel görünüm kombinasyonu yeniden geçti. Kişisel test saati gece yarısı kaynaklı tarih değişiminden bağımsız olacak şekilde sabitlendi.
- Üretim hesabına test fotoğrafı/sesi gönderilmedi, gerçek mikrofon kaydedilmedi. Fiziksel iPhone/Android testi henüz yapılmadı.
- Kullanım ve veri sınırları: `PROFIL-MEDYA.md`.

Aşağıdaki rapor önceki tasarım ve ekip sürümünün doğrulamasıdır.

Ortam: Windows, headless Microsoft Edge/Chromium, Playwright 1.62.1, Auth ve Firestore emülatörleri (`demo-gunluk`). Gerçek üretim hesabına/veritabanına test verisi yazılmadı.

## Erişim kuralları: 9/9 geçti

`tests/firestore.test.cjs`:
- Oda, ilk üyelik ve kişisel oda dizini atomik oluşturuluyor.
- Üye olmayan ve giriş yapmamış istemciler oda, üye durumu ve mesaj okuyamıyor.
- Oda ve davet listeleri sorgulanamıyor; tam rastgele davet token'ı gerekir.
- Geçerli davet olmadan üyelik veya sahte oda dizini oluşturulamıyor.
- Üye yalnız kendi durumunu değiştirebiliyor; başka üyenin verisi, sahte ad/kimlik ve geçersiz durum reddediliyor.
- Mesajın üyesi, gönderen kimliği, sunucu zamanı ve uzunluğu denetleniyor.
- Aynı odadaki kullanıcılar birbirlerinin kişisel vardiya/alarm belgesine erişemiyor.
- Süresi dolmuş/iptal edilmiş davet reddediliyor; başkası daveti iptal edemiyor.
- Odadan ayrılınca erişim kesiliyor; başka odaya üye olmak erişim vermiyor.

## İki kullanıcıyla uçtan uca ekip akışı: geçti

`tests/team-ui.cjs`:
- Ayrı tarayıcı oturumlarında iki e-posta hesabı açma.
- Serbest adla oda oluşturma, 192 bit davet oluşturma, davetten ikinci kullanıcıyla katılma.
- İki yönlü gerçek zamanlı sohbet, HTML enjeksiyonunun metin olarak kalması.
- Kişisel mola başlatıldığında karşı tarafta kalan dakika görünmesi.
- Geliyorum/döndüm, yeniden yükleme sonrası durumun korunması, kişisel mola kaydı.
- Çevrimdışı mesajın gönderilmiş gibi gösterilmemesi.
- Odadan ayrıldıktan sonra ortak durumun silinmesi.
- Tarayıcı sayfa hatası: 0.

Ekip ekran görüntüleri bu emülatör oturumlarından alındı; üretim kullanıcıları veya sahte tamamlanmış ekranlar değildir.

## Kişisel özellikler ve görsel düzen: geçti

`tests/personal-ui.cjs`:
- 320, 390, 768 ve 1440 px genişliklerde açık/koyu tema × dört kişisel ekran: 32 kombinasyonda yatay taşma yok.
- Tema tercihi yeniden yüklemede korunuyor, otomatik tema sistem değişimini izliyor.
- Takvim ay gezinmesi, tek günlük vardiya değişikliği ve düzene dönüş.
- Alt sayfanın Escape ile kapanması, arka planın odak dışında kalması.
- Elle mola ekleme/düzenleme ve kalıcı kayıt.
- `.ics` dışa aktarımında vardiyalar ve alarm blokları.
- Mevcut Tetris modunun açılması.
- Servis çalışanı kurulduktan sonra çevrimdışı yeniden açılma, takvim ve mola ekranları.
- Tarayıcı sayfa hatası: 0.

`node --check` ve `git diff --check` de uygulandı.

## Tarayıcı yorumları sonrası doğrulama

`tests/feedback-ui.cjs` (`npm run test:feedback`) geçti:

- Altı mola süresi seçeneği, yeniden yüklemede kalıcılık ve aktif molanın korunması.
- iPhone kestirme adı/tarih girdisi, Android intent paketi ve APK dosyasına erişim.
- Kurulum onayı olmadan başlatmanın engellenmesi; ileri/geçmiş tarih korumaları.
- Gerçek giriş formunda Google logosu; sayfa hatası yok.
- Kişisel arayüzün 32 görünüm kombinasyonu ve işlev testleri yeniden geçti.
- Android APK derlendi; v2/v3 imzası ve yalnız SET_ALARM izni doğrulandı. Cihazda çalıştırılmadı.

## Sınırlar

- Fiziksel iPhone/Safari, ana ekrana ekleme ve gerçek Google oturumu bu ortamda test edilmedi.
- Google/e-posta entegrasyonu ve dolu Firebase yapılandırması mevcut koddan doğrulandı. Üretimde sağlayıcı etkinliği, yetkili alan adı ve Firestore kuralları yönetici erişimiyle doğrulanmadı.
- Yeni `firestore.rules` üretime uygulanmadan ekip akışları canlı sitede kullanıma hazır sayılmaz. Kurulum: `KURULUM-EKIP.md`.
- Arka planda anlık durum, kapalı PWA'da alarm veya sohbet push bildirimi garantisi yok. Son durum zamanı gösterilir; mevcut takvim alarmı yolu korunur.
- Mesajların son 60 tanesi görüntülenir. Dosya eki, eski mesaj sayfalaması, oda/mesaj yönetimi bu sürümün kapsamı dışında.
- Kod ve görseller inceleme için yerelde hazırlandı; GitHub'a push, PR birleştirme veya dağıtım yapılmadı.
