# Günlük Asistan v3: tasarım ve iş bölümü

Hedef: iPhone'da ana ekrana eklenen, tam ekran açılan, internetsiz çalışan ve bitmiş bir iOS uygulaması gibi görünen bir PWA. Dil Türkçe.

## Dosyalar ve sahipleri
| Dosya | Sahip |
|---|---|
| index.html, styles.css, app.js (iskelet, Vardiya, Mola, Ayarlar) | Nayro |
| manifest.webmanifest, sw.js (çevrimdışı önbellek) | Nayro |
| account.js, firebase-config.js (hesap, tembel yüklenir) | — |
| icons/icon-180.png, icon-192.png, icon-512.png, icon-maskable-512.png | nayronayt |
| Son test raporu: TEST.md | nayronayt |

Başkasının dosyasını düzenleme; değişiklik gerekiyorsa NOTES.md'ye yaz.

## Tasarım sistemi (styles.css içinde hazır sınıflar)
- Font: `-apple-system, "SF Pro Text", system-ui`. Açık ve koyu tema `prefers-color-scheme` ile otomatik.
- Renk değişkenleri: `--bg`, `--card`, `--text`, `--muted`, `--sep`, `--accent` (#0A84FF), `--green` (#30D158), `--red` (#FF453A), `--orange` (#FF9F0A), `--indigo` (#5E5CE6).
- Sınıflar:
  - `.large-title`: 34px kalın başlık.
  - `.section-title`: küçük gri büyük harfli grup başlığı.
  - `.group`: yuvarlak köşeli (12px) kart grubu; içinde `.cell` satırları (ayraçlı).
  - `.cell`: `display:flex`, solda içerik, sağda `.cell-detail` gri metin.
  - `.btn` (dolu mavi), `.btn.secondary` (gri dolgu), `.btn.danger`, `.btn.green`; tam genişlik, 50px yükseklik, 12px köşe.
  - `.input`: kart renginde, kenarlıksız, 12px köşe.
  - `.switch`: iOS anahtar. Açıkken `.on`.
  - `.icon-btn`: 40px yuvarlak ikon düğmesi.
- İkonlar: satır içi SVG, 24px, `stroke="currentColor"`, çizgi kalınlığı 2, emoji kullanma.
- Boşluk: ekran kenarı 16px, gruplar arası 24px.
- Animasyon: ekran değişiminde 200ms fade; düğmede `:active` ile scale(.97).
- Güvenli alanlar: `env(safe-area-inset-*)` iskelette hallediliyor.

## Güncelleme (18 Ekim 2026)
- Çeviri özelliği kullanıcının isteğiyle tamamen kaldırıldı (translate.js silindi, sekme ve ceviri.* verileri temizlendi).
- Alt sekme çubuğu iPhone güvenli alanına göre aşağı alındı (--tb-pad).

## Sürüm 4.0 (18 Ekim 2026)
- Gece vardiyası molaları artık vardiyanın başladığı güne sayılıyor; gece yarısı "Kalan mola" sıfırlanmıyor.
- Güvenilir güncelleme: servis çalışanı v7, ağdan önbelleksiz çekiyor, 3 sn içinde yanıt yoksa önbellekten açıyor; yeni sürümde "Yeni sürüm yüklendi" deyip yenileniyor.
- Yedek: paylaş menüsüyle yedek alma (ga-backup biçimi), "Yedeği geri yükle", "Son yedek: X gün önce".
- Sağlamlık: kayıt hatasında uyarı, bozuk ayar saatlerine varsayılan, kalıcı depolama isteği, 365 günlük mola geçmişi, aynı başlangıç/bitiş saatine izin yok.
- Mola: çift dokunma koruması, 5 sn'den kısa mola kaydedilmiyor, unutulan mola uyarısı, "+ Mola ekle", molaya dokunup düzenleme/silme, 5 sn "Geri al", onay kutuları yerine iOS alt sayfası.
- Bugün: "Sonraki vardiya" (Ayarlar'daki yol süresine göre "…'te çık") ve "Sonraki izin" kartları.
- Ayarlar: "Yol süresi", "Takvime aktar (.ics)" (60 gün, her vardiyadan 1 saat önce hatırlatma), gizli "Tetris modu" (Nayro'nun yüzü logolu; tetris.js ilk açılışta yüklenir).
- Erişilebilirlik: süs SVG'lerinde aria-hidden, sekmelerde aria-label/aria-current, pasif ekranlar inert, ay düğmesi etiketleri, toast aria-live, sayfayı aşağı sürükleyerek kapatma, azaltılmış hareket desteği.
- Manifest açıklamasından çeviri ifadesi kaldırıldı.

## Alarm ve hesap (19 Ekim 2026)
- Bugün ekranında Alarm anahtarı. Açıkken sıradaki vardiyanın başlangıcından 2 saat önce çalar (düzen ve saatler uygulamadaki vardiya hesabından gelir; izin gününde alarm yok). Sonraki alarm saati aynı kartta görünür.
- Uygulama açıkken Bildirim API'si ve kısa bir WebAudio sesi. Kilitliyken çalması için "Takvime ekle" (.ics, VALARM). Ayrıntı ve sınırlar uygulama içinde kısa not olarak durur.
- Ayarlar'da Hesap. `firebase-config.js` boşken "Hesap özelliği henüz kurulmadı"; uygulama geri kalanı hesapsız çalışır. Kurulum: KURULUM-HESAP.md.
- Servis çalışanı önbelleği v8. Firebase SDK yalnızca hesap açılınca veya oturum varken, gstatic üzerinden yüklenir.
