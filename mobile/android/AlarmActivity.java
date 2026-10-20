package org.gunlukasistan.alarmbridge;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.provider.AlarmClock;
import android.graphics.Color;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.text.DateFormat;
import java.util.Calendar;
import java.util.Date;

/** Narrow, offline bridge: user confirms in this app and then in their Clock UI. */
public final class AlarmActivity extends Activity {
  private LinearLayout layout;
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    layout = new LinearLayout(this); layout.setOrientation(LinearLayout.VERTICAL);
    layout.setPadding(48, 80, 48, 48); layout.setBackgroundColor(Color.rgb(243,245,249));
    // Respect system insets on devices enforcing edge-to-edge.
    layout.setOnApplyWindowInsetsListener((v, insets) -> {
      v.setPadding(48, 48 + insets.getSystemWindowInsetTop(), 48, 48 + insets.getSystemWindowInsetBottom()); return insets;
    });
    setContentView(layout); text("Günlük Alarm", 30);
    Uri uri = getIntent().getData();
    if (uri == null) { text("Günlük Asistan'da Telefonda alarm kur → Android seçeneğini aç.", 18); return; }
    try {
      if (!"gunlukasistan".equals(uri.getScheme()) || !"alarm".equals(uri.getHost())) throw new IllegalArgumentException();
      long at = Long.parseLong(uri.getQueryParameter("at"));
      long now = System.currentTimeMillis();
      Calendar target = Calendar.getInstance(); target.setTimeInMillis(at);
      Calendar next = Calendar.getInstance(); next.set(Calendar.HOUR_OF_DAY, target.get(Calendar.HOUR_OF_DAY));
      next.set(Calendar.MINUTE, target.get(Calendar.MINUTE)); next.set(Calendar.SECOND,0); next.set(Calendar.MILLISECOND,0);
      if (next.getTimeInMillis() <= now) next.add(Calendar.DAY_OF_MONTH,1);
      // Clock alarms are time-of-day alarms, not arbitrary future calendar dates.
      if (at <= now || Math.abs(at - next.getTimeInMillis()) > 1000) {
        text("Bu alarm bugünün veya yarının sıradaki saatine ait değil. Erken çalmasını önlemek için kurulum durduruldu. Uygulamadan güncel saati yeniden aç.",18);return;
      }
      text(DateFormat.getDateTimeInstance(DateFormat.MEDIUM,DateFormat.SHORT).format(new Date(at)),24);
      text("Tek seferlik vardiya alarmı. Saat uygulamasında saati ve alarmın açık olduğunu kontrol et.",17);
      Button button = new Button(this); button.setText("Saat uygulamasında devam et"); layout.addView(button);
      button.setOnClickListener((View v) -> {
        if (System.currentTimeMillis() >= at) {text("Alarm saati geçti. Günlük Asistan'dan güncel alarmı yeniden aç.",17);return;}
        Intent alarm = new Intent(AlarmClock.ACTION_SET_ALARM)
          .putExtra(AlarmClock.EXTRA_HOUR,target.get(Calendar.HOUR_OF_DAY))
          .putExtra(AlarmClock.EXTRA_MINUTES,target.get(Calendar.MINUTE))
          .putExtra(AlarmClock.EXTRA_MESSAGE,"Günlük Asistan · Vardiya")
          .putExtra(AlarmClock.EXTRA_SKIP_UI,false);
        try { startActivity(alarm); }
        catch (android.content.ActivityNotFoundException e) {text("Bu cihazda alarm bağlantısını destekleyen Saat uygulaması bulunamadı. Saati elle ekleyebilirsin.",17);}
        catch (SecurityException e) {text("Cihaz alarm kurulumuna izin vermedi. Saati Saat uygulamasında elle ekle.",17);}
      });
    } catch (Exception e) { text("Alarm bağlantısı geçersiz. Günlük Asistan'dan yeniden aç.",18); }
  }
  private void text(String value,int size) {
    TextView view = new TextView(this);view.setText(value);view.setTextSize(size);view.setTextColor(Color.rgb(24,37,61));view.setPadding(0,0,0,32);layout.addView(view);
  }
}
