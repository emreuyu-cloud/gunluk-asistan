# iPhone ve Android telefon alarmı

Bugün ekranındaki **Telefonda alarm kur**, sıradaki vardiyadan iki saat önceki saati telefonun Saat uygulamasına aktarır. Her yeni alarm için bu işlemi yapmalısın; vardiya döngüsünün tüm alarmları kendiliğinden kurulmaz.

## Android

1. Günlük Asistan'ı telefonda aç, **Telefonda alarm kur → Android** seç.
2. **Android test uygulamasını indir** ile `gunluk-alarm-test.apk` dosyasını indirip kur. Android gerekirse indirmeyi yaptığın uygulama için yükleme izni ister.
3. Günlük Asistan'a dön, **Günlük Alarm yardımcı uygulamasını kurdum** kutusunu işaretle.
4. **Saat uygulamasına geç** düğmesine dokun. Yardımcı uygulamada tarih ve saati kontrol edip devam et.
5. Telefonunun Saat uygulamasında alarmın doğru saatte ve açık olduğunu kontrol et.

APK yerel test anahtarıyla imzalanmıştır; Play Store dağıtımı değildir. Yalnızca alarm kurma izni ister; internet izni, hesap veya veri gönderimi içermez. Android 8 veya üzerini hedefler. Fiziksel cihazda yükleme ve çalma testi henüz yapılmadı; telefonunun Saat uygulamasıyla uyumluluğu ayrıca doğrulanmalı.

## iPhone

Önce Apple **Kestirmeler** uygulamasında bir defalık şu kurulumu yap:

1. Yeni kestirme oluştur; adını tam olarak **Günlük Asistan Alarm** yap.
2. **Girdiden Tarihleri Al** eylemini ekle. Girdi olarak **Kestirme Girdisi** seç.
3. **Listeden Öğe Al** eylemini ekle; ilk tarihi al.
4. **Alarm Oluştur** eylemini ekle. Saat değerini önceki adımın tarihine bağla. Etiketi **Günlük Asistan**, yinelemeyi **Asla** yap. Eylem adları iOS diline/sürümüne göre biraz değişebilir.

Sonra Günlük Asistan'da **Telefonda alarm kur → iPhone** seç. **Kestirmeyi yukarıdaki gibi hazırladım** kutusunu işaretleyip **Kestirmeyi çalıştır** düğmesine dokun. İstenen geçiş/izinleri tamamladıktan sonra Saat uygulamasında alarmın doğru saatte ve açık olduğunu kontrol et.

Bu paket bir yerel iOS uygulaması veya yüklenebilir hazır kestirme içermez. Kestirme cihazda oluşturulmalıdır. Fiziksel iPhone'da çalıştırma ve çalma testi henüz yapılmadı.

## Tarih ve değişiklikler

- Saat alarmının sıradaki çalma zamanına uymayan ileri tarihlerde kurma düğmesi kapalıdır. Böylece birkaç gün sonraki vardiya için yanlışlıkla yarın çalacak alarm kurulmaz. Tarih yaklaşınca tekrar açabilir veya takvim hatırlatıcısı ekleyebilirsin.
- **Uygulama içi uyarı** anahtarı yalnızca web uygulamasındaki bildirimi/sesi yönetir. Telefonun Saat alarmını kapatmaz.
- Vardiyan değişirse veya aynı alarmı tekrar kurarsan Saat uygulamasındaki eski/çift alarmı kendin düzenlemelisin. Web uygulaması telefon alarmlarını okuyamaz veya silemez.
- Takvim hatırlatıcısı ayrı bir seçenektir; Saat alarmı olarak gösterilmez.
- Bilgisayardaki `127.0.0.1` adresi telefonda bu bilgisayarı açmaz. Telefon kurulumu için kaynakları erişilebilir bir web adresinde çalıştırmak gerekir. Bu çalışma canlı siteye yayımlanmadı.

## Kaynak ve doğrulama

Android kaynakları: `mobile/android/`; yeniden derleme betiği: `mobile/android/build.ps1`. APK imzası ve izin listesi denetlendi. Özel test imzalama anahtarı kaynak paketine dahil değildir.

APK SHA-256: `9E5D2A9154B0FA921480622CF8959013D4C5D3736F3E6FCF95DBA4A5A46C8561`

Resmî belgeler: [Apple kestirme URL girdisi](https://support.apple.com/guide/shortcuts/run-a-shortcut-from-a-url-apd624386f42/ios), [Android AlarmClock](https://developer.android.com/reference/android/provider/AlarmClock), [Chrome Android intent bağlantıları](https://developer.chrome.com/docs/android/intents).
