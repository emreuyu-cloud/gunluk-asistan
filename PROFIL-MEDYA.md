# Profil, fotoğraf ve sesli mesaj — 21 Ekim 2026

Bu sürüm kullanıcının tercihiyle Spark planında kalır. Faturalandırma hesabı açmaz ve Firebase Storage kullanmaz. Küçük ekler Firestore'da, mesaj metadatasından ayrı belgelerde saklanır. Bu yaklaşım küçük ekipler içindir; ücretsiz Firestore kotaları geçerlidir. Kota dolduğunda gönderim/okuma başarısız olabilir. Yoğun kullanım ve büyük dosyalar için ayrı dosya depolama servisine geçilmelidir.

## Kullanım

- **Ekip → Profilimi düzenle** veya **Ayarlar → Hesap**: görünen adını ve fotoğrafını seç, **Profili kaydet**. Fotoğraf ortadan kare kırpılır. **Fotoğrafı kaldır** seçimi de Kaydet'e basınca uygulanır.
- Oda içindeki **Fotoğraf** düğmesiyle fotoğraf seç. Önizlemeyi kontrol edip **Gönder**'e bas.
- **Sesli mesaj → Kayda başla** ile mikrofon izni istenir. **Kaydı durdur** sonrası dinle, ardından **Gönder** veya **Vazgeç** seç. 30 saniyede kayıt otomatik durur; kendiliğinden gönderilmez.
- Alıcı fotoğrafı/sesi mesajdaki düğmeye dokunarak yükler. Ses ardından standart oynatıcıyla dinlenir. Her sohbet açılışında tüm dosyalar indirilmez.

## Sınırlar ve gizlilik

- Profil fotoğrafı: 160×160 JPEG, en fazla 20.000 bayt; odalarda küçük kopyası gösterilir.
- Oda fotoğrafı: uzun kenar en fazla 960 px, en fazla 180.000 bayt JPEG. Kaynak dosya en fazla 20 MB. JPG, PNG ve WebP desteklenir; HEIC yalnız tarayıcı çözebiliyorsa dönüştürülür.
- Fotoğraflar canvas ile yeniden kodlanır; kaynak EXIF konum bilgisi dosyaya kopyalanmaz.
- Ses: en fazla 30 saniye ve 300.000 bayt. Tarayıcıya göre MP4, WebM veya Ogg. Desteklenmeyen mikrofon/kayıt durumunda açıklama gösterilir.
- Mikrofon kayıt bitince, önizleme kapanınca, oturum değişince veya sayfa arka plana geçince durur. İzin isteği sonradan sonuçlansa da kapatılmış önizleme mikrofonu açık bırakmaz.
- Profili yalnız sahibi düzenler. Ad/fotoğraf kaydedilince katılınan odaların üyelik belgeleri güncellenir. Kısmi ağ hatasında yeniden Kaydet'e basılabilir.
- Mesajlar ve ekler yalnız o odanın üyelerine açıktır. Kalıcı, herkese açık dosya bağlantısı oluşturulmaz. Odadan ayrılan kişi yeni ek okumaları yapamaz; daha önce indirdiği dosya geri alınamaz.
- Yetkili Firebase proje yöneticileri bu verilere erişebilir. Uçtan uca şifreleme uygulanmaz.
- Son 60 mesaj ekranda gösterilir; daha eski kayıtlar otomatik silinmez. Mevcut sürümde uygulama içinden mesaj/ek silme arayüzü yoktur.

## Veri modeli ve yayın

- `users/{uid}/data/profile`: özel profil kaydı (`name`, `avatar`, `updatedAt`).
- `rooms/{roomId}/members/{uid}`: üyelerce görülen `name`/`avatar` kopyası; mevcut mola alanları korunur.
- `rooms/{roomId}/messages/{id}`: mevcut metin mesajları veya tür, MIME, boyut, süre ve ek kimliği.
- `rooms/{roomId}/attachments/{id}`: `Bytes` içeriği ve eşleşen metadata; mesajla aynı atomik batch'te oluşturulur.
- Güncel **firestore.rules önce yayımlanmalı**, ardından web kodu yayımlanmalıdır. Eski kurallar avatar alanını ve ekleri reddeder.
- PWA önbelleği v13; yeni `media.js` ve `profile.js` dosyaları dahildir.

## Doğrulama

`tests/firestore.test.cjs`: 11 test geçti; izinsiz okuma/yazma, yanlış MIME/boyut/süre, eksik/uyuşmayan ek, profil taklidi, değiştirilemez ek ve ayrılma sonrası erişim denetlendi.

`tests/media-ui.cjs`: iki ayrı emülatör hesabıyla profil kalıcılığı, fotoğraf gönderme/çözme, sentetik mikrofonla gerçek MediaRecorder kaydı ve karşı hesapta oynatma, izin reddi, kayıt iptali, geciken izin sonrası temizleme, 30 saniye otomatik durdurma, profil değişiminin odalara yansıması, çevrimdışı hata ve dar ekranlar doğrulandı. Gerçek kullanıcının mikrofonu kaydedilmedi ve üretim hesabına test içeriği gönderilmedi. Fiziksel iPhone/Android cihaz testi henüz yapılmadı.

Kaynaklar: [Firebase Storage plan gereksinimi](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), [Firestore sınırları](https://firebase.google.com/docs/firestore/quotas), [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder).
