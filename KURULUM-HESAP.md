# Hesap kurulumu

> Güncel durum: `firebase-config.js` doldurulmuş; mevcut Google/e-posta entegrasyonu korunuyor. Yeni ekip sürümü için `KURULUM-EKIP.md` ve `firestore.rules` dosyalarını kullanın. Aşağıdaki eski kişisel veri kuralları tek başına ekip odalarını etkinleştirmez.

Hesap özelliği Firebase ile çalışır. `firebase-config.js` boşken uygulama **Hesap özelliği henüz kurulmadı** der; vardiya, mola, takvim ve alarm eskisi gibi durur. Aşağıdaki adımlar bir kez yapılır.

## 1. Firebase projesi

1. [Firebase konsolu](https://console.firebase.google.com/) → **Proje ekle**.
2. Proje ayarları (dişli) → **Genel** → **Uygulamanız** → **Web** (`</>`).
3. Uygulamaya bir ad ver (örneğin Günlük Asistan). Hosting'i şimdi kurma.
4. Çıkan `firebaseConfig` değerlerini `firebase-config.js` içindeki boş alanlara yapıştır:

```javascript
window.GA_FIREBASE_CONFIG = {
  apiKey: '...',
  authDomain: '...firebaseapp.com',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...'
};
```

Dosyayı kaydedip `main` dalına gönder. Yayınla iş akışı siteyi günceller.

## 2. Giriş yöntemleri

Authentication → **Sign-in method**:

- **Google** sağlayıcısını etkinleştir.
- **E-posta/Parola** sağlayıcısını etkinleştir. E-posta bağlantısı (passwordless) gerekmez.

Authentication → **Settings** → **Authorized domains** listesine ekle:

- `emreuyu-cloud.github.io`
- `localhost` (yerelde deneyeceksen)

## 3. Firestore

1. **Firestore Database** → veritabanı oluştur. Konum olarak `eur3` (Avrupa) uygun.
2. Üretim kuralları olarak aşağıyı yapıştır. Kullanıcı yalnız kendi belgesini okuyup yazabilir:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Veri `users/{uid}/data/state` belgesindedir (kurallar `users/{userId}` altındaki belgeleri kapsar): vardiya saatleri ve düzen, gün değişiklikleri (izin dahil), molalar, süren mola, alarm açık/kapalı ve son çalma zamanı. Tetris skoru eşitlenmez.

## 4. Nasıl eşitlenir

- Bu telefonda localStorage durur; internet yokken uygulama ondan çalışır.
- Girişte yerel ve buluttaki kayıt birleştirilir (molalar ve gün değişiklikleri birleşir, daha yeni tarafın saatleri ve alarmı kalır) ve hesaba yazılır.
- Diğer cihaz giriş yapınca aynı belgeyi indirir.
- Uygulama açıkken yaklaşık dakikada bir ve her kayıtta yeniden bakar. Anlık bir sohbet gibi sürekli açık bir bağlantı yoktur.

Çıkış yapmak telefondaki veriyi silmez. **Şifremi unuttum** Firebase üzerinden sıfırlama e-postası gönderir.

## 5. iPhone ve Google girişi

- **E-posta ve şifre** ana ekrana eklenmiş uygulamada çalışır.
- **Google ile giriş** önce `signInWithPopup` dener. Pencere engellenirse, site Safari sekmesindeyse `signInWithRedirect` yedeğine düşer.
- Ana ekran (standalone) PWA'da Google penceresi çoğu zaman hiç açılmaz. Yönlendirme de oturumu Safari'ye taşır, ana ekran uygulamasına geri getirmez. Bu yüzden iPhone'da e-posta ile giriş kullanılmalı. Uygulama bu durumda Google'ı zorlamaz, kısa bir uyarı gösterir.
- Google girişi için siteyi Safari sekmesinde açmak da oturumu ana ekran simgesine taşımaz; ikisi ayrı depodur.
