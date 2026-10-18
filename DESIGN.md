# Günlük Asistan v3: tasarım ve iş bölümü

Hedef: iPhone'da ana ekrana eklenen, tam ekran açılan, internetsiz çalışan ve bitmiş bir iOS uygulaması gibi görünen bir PWA. Dil Türkçe.

## Dosyalar ve sahipleri
| Dosya | Sahip |
|---|---|
| index.html, styles.css, app.js (iskelet, Vardiya, Mola, Ayarlar) | Nayro |
| manifest.webmanifest, sw.js (çevrimdışı önbellek) | Nayro |
| translate.js (Çeviri ekranı) | nayronayt |
| icons/icon-180.png, icon-192.png, icon-512.png, icon-maskable-512.png | nayronayt |
| Son test raporu: TEST.md | nayronayt |

Başkasının dosyasını düzenleme; değişiklik gerekiyorsa NOTES.md'ye yaz.

## Çeviri ekranı arayüzü (translate.js)
- index.html içinde `<section class="screen" id="screen-ceviri"></section>` hazır, boş.
- translate.js şu fonksiyonu tanımlar: `window.initCeviri = function (root) { ... }`. app.js bunu açılışta bir kere `root = section` ile çağırır.
- Ekranın en üstünde iOS büyük başlık kullan: `<h1 class="large-title">Çeviri</h1>`.
- Yardımcılar (app.js global olarak sağlar): `App.store.get(key, varsayılan)`, `App.store.set(key, değer)`, `App.toast(metin)`, `App.haptic()`.
- localStorage anahtarlarına `ceviri.` öneki koy.
- Çeviri kaynağı: önce `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=..&tl=..&q=..`, olmazsa MyMemory, o da olmazsa Google Çeviri bağlantısı. Sesli okuma için speechSynthesis.
- Önerilen özellikler: iki yön, yön değiştirme düğmesi, kopyala, sesli oku, geçmiş, favori ifadeler (iş yerinde sık lazım olan hazır İngilizce kalıplar güzel olur).

## Tasarım sistemi (styles.css içinde hazır sınıflar)
- Font: `-apple-system, "SF Pro Text", system-ui`. Açık ve koyu tema `prefers-color-scheme` ile otomatik.
- Renk değişkenleri: `--bg`, `--card`, `--text`, `--muted`, `--sep`, `--accent` (#0A84FF), `--green` (#30D158), `--red` (#FF453A), `--orange` (#FF9F0A), `--indigo` (#5E5CE6).
- Sınıflar:
  - `.large-title`: 34px kalın başlık.
  - `.section-title`: küçük gri büyük harfli grup başlığı.
  - `.group`: yuvarlak köşeli (12px) kart grubu; içinde `.cell` satırları (ayraçlı).
  - `.cell`: `display:flex`, solda içerik, sağda `.cell-detail` gri metin.
  - `.btn` (dolu mavi), `.btn.secondary` (gri dolgu), `.btn.danger`, `.btn.green`; tam genişlik, 50px yükseklik, 12px köşe.
  - `.segmented`: iOS segment kontrol; içinde `<button>`ler, seçili olana `.active`.
  - `.input`, `.textarea`: kart renginde, kenarlıksız, 12px köşe.
  - `.icon-btn`: 40px yuvarlak ikon düğmesi.
- İkonlar: satır içi SVG, 24px, `stroke="currentColor"`, çizgi kalınlığı 2, emoji kullanma.
- Boşluk: ekran kenarı 16px, gruplar arası 24px.
- Animasyon: ekran değişiminde 200ms fade; düğmede `:active` ile scale(.97).
- Güvenli alanlar: `env(safe-area-inset-*)` iskelette hallediliyor.
