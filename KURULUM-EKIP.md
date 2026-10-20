# Ekip odaları — kurulum ve doğrulama

Mevcut `firebase-config.js`, `gunluk-asistan-df06c` projesini tanımlıyor. Google ve e-posta/parola giriş kodu zaten vardı; korundu. Yeni proje veya yeni hesap servisi gerekmiyor. İlk ekip kuralları 21 Ekim 2026'da Firebase Console üzerinden yayımlandı. Profil ve medya sürümü için güncel `firestore.rules` kullanılmalı; ayrıntılar `PROFIL-MEDYA.md` dosyasında.

## Canlıya almadan önce gerekli işlem

**Yeni bir kurulumda veya kural değişikliğinde, web kodundan önce güncel erişim kuralları yayımlanmalıdır.**

Mevcut belgelendirmedeki yalnız `users/{uid}` erişimine izin veren kurallar ekip koleksiyonlarını açmaz. Mevcut üretim kurallarını yedekleyip bu depodaki **`firestore.rules`** ile karşılaştırın. Ek bir uygulamanızın koleksiyonları varsa kuralları körlemesine değiştirmeyin. Uygulamanın kişisel verisi `users/{uid}/data/state` yolunda korunur. Ekip kurallarını Firebase Console > Firestore Database > Rules alanından yetkili kişi yayımlamalıdır. Bu adım burada yapılmadı.

Google ve E-posta/Parola sağlayıcıları etkin olmalı. Kullanılan yayın adresi Authentication > Settings > Authorized domains listesinde bulunmalı. Gerçek bir Google hesabıyla giriş ve iPhone Safari/PWA davranışı ayrıca cihaz üzerinde denenmeli.

## Kullanım

- Kişisel vardiya, mola ve alarm hesap olmadan çalışır.
- Profil fotoğrafı, odada küçük fotoğraf ve en fazla 30 saniyelik sesli mesaj desteklenir. Dosyalar açık bağlantı verilmeden yalnız oda üyelerine sunulur. Spark kotaları geçerlidir.
- Ekip sekmesinde mevcut Google veya e-posta hesabıyla giriş yapılır.
- Her kullanıcı istediği adla oda oluşturabilir. Merkezi yönetici ve zorunlu ekip üyeliği yoktur.
- Her üye 7 gün geçerli davet bağlantısı oluşturabilir, kopyalayabilir veya telefonun paylaşım menüsünü açabilir. Bağlantıyı bilen, giriş yapmış kişiler katılabilir. Daveti oluşturan kişi aynı paylaşım ekranından o daveti iptal edebilir.
- Katılım ekranı gösterilecek adı ve paylaşım kapsamını açıklar. Üyelik, isim ve güncel mola durumu paylaşılır. Kişisel vardiya planı, alarm ayarları ve geçmiş mola kayıtları paylaşılmaz.
- Mola başlangıcı/bitişi katılınan odalara aktarılır. `Geliyorum` ve `Döndüm` durumları elle seçilebilir. `Döndüm`, devam eden kişisel molayı da bitirir.
- Mola bitiş tahmini günlük kalan mola hakkından hesaplanır; sürenin dolması otomatik olarak “döndü” sayılmaz.
- Uygulama açıkken durumlar değişikliklerde ve dakikada bir güncellenir. Kapalı uygulamada arka plan bağlantısı veya çevrimiçi olma garantisi yoktur; eski durumların son güncelleme zamanı gösterilir.
- Sohbet son 60 mesajı gösterir. Eski mesajlar veritabanından silinmez. Fotoğraf/ses desteği vardır; genel dosya eki, push bildirim ve eski mesaj sayfalaması yoktur.
- Ayrılınca üyelik ve ortak durum silinir, eski mesajlar odada kalır. Oda adını değiştirme, oda silme ve başka üyeyi çıkarma bu sürümde yoktur.

## Veri ve erişim modeli

| Yol | İçerik | Erişim |
| --- | --- | --- |
| `users/{uid}/data/state` | Kişisel vardiya, mola, alarm | Yalnız sahibi |
| `users/{uid}/rooms/{roomId}` | Kişinin oda listesi | Yalnız sahibi; yeni kayıt gerçek üyeliğe bağlı |
| `rooms/{roomId}` | Oda adı ve oluşturulma bilgisi | Yalnız üyeler; oda listesi sorgusu kapalı |
| `rooms/{roomId}/members/{uid}` | Ad, mola/dönüş durumu, son güncelleme | Üyeler okuyabilir; kişi yalnız kendisini değiştirebilir |
| `rooms/{roomId}/messages/{id}` | Metin, gönderen, sunucu zamanı | Üyeler okuyabilir; gönderen kendi kimliğiyle yazabilir |
| `invites/{token}` | 192 bit rastgele davet, oda adı, son geçerlilik | Giriş yapmış kişi tam token ile okuyabilir; listeleme kapalı |

İsim ve mesajlar HTML olarak çalıştırılmaz. Mesaj 2.000 karakterle sınırlı. Katılım işlemi üyelik ve kişisel oda dizinini aynı Firestore batch içinde oluşturur. Süresi dolan/iptal edilen davetle katılım kurallarda reddedilir. Mesajlarda sunucu zamanı zorunlu. Firestore Lite yerine gerçek zamanlı dinleyicileri destekleyen aynı sürüm Full SDK tembel yüklenir.

## Yerel testler

Node.js, Java 21+ ve geliştirme bağımlılıkları gerekir:

```sh
npm ci
npm run test:rules
```

Testler yalnız `demo-gunluk` emülatör projesine bağlanır. Üretim projesine veri yazmaz. UI testleri için:

```sh
npm run emulators
# ayrı terminal
npm run preview
# ayrı terminal; Chromium bir kez kurulmalı
npx playwright install chromium
npm run test:ui
```

Kurulu Edge ile `BROWSER_CHANNEL=msedge` kullanılabilir. `APP_URL` varsayılanı `http://127.0.0.1:4173`, `TEST_OUTPUT` varsayılanı `test-results/` dizinidir. UI testleri iki ayrı tarayıcı oturumu açar ve emülatörde test kullanıcıları oluşturur. Test kodu yalnız localhost/127.0.0.1 üzerinde Firebase emülatör yönlendirmesine izin verir.

Resmî başvurular: [Firestore dinleyicileri](https://firebase.google.com/docs/firestore/query-data/listen), [erişim kuralları ve atomik işlemler](https://firebase.google.com/docs/firestore/security/rules-conditions), [yerel emülatör kurulumu](https://firebase.google.com/docs/emulator-suite/install_and_configure).
