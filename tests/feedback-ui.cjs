const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
(async()=>{
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||undefined,headless:true});const c=await browser.newContext({baseURL:process.env.APP_URL||'http://127.0.0.1:4173',viewport:{width:390,height:844},deviceScaleFactor:2});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
const output=process.env.TEST_OUTPUT||path.resolve(__dirname,'../test-results');fs.mkdirSync(output,{recursive:true});
// Isolated origin storage: no changes to the user's open browser session.
await p.goto(process.env.APP_URL||'http://127.0.0.1:4173');
await p.getByRole('button',{name:'Mola',exact:true}).click();
for(const [minutes,label] of [[15,'15 dk'],[30,'30 dk'],[45,'45 dk'],[60,'1 saat'],[90,'1 saat 30 dk'],[120,'2 saat']]){
 await p.getByRole('button',{name:'Mola süresini seç'}).click();await p.locator('#sheet').getByRole('button',{name:label,exact:true}).click();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('settings')).breakMin),minutes);
}
await p.reload();assert.equal(await p.locator('#ringtime').textContent(),'2:00:00');
await p.getByRole('button',{name:'Molaya başla',exact:true}).click();const started=await p.evaluate(()=>localStorage.getItem('activeBreak'));await p.getByRole('button',{name:'Mola süresini seç'}).click();await p.getByRole('button',{name:'30 dk',exact:true}).click();assert.equal(await p.evaluate(()=>localStorage.getItem('activeBreak')),started);
await p.getByRole('button',{name:'Mola süresini seç'}).click();await p.waitForTimeout(350);await p.screenshot({path:path.join(output,'mola-secenekleri.png')});await p.getByRole('button',{name:'Kapat',exact:true}).click();
await p.getByRole('button',{name:'Bugün',exact:true}).click();await p.getByRole('button',{name:/Telefonda alarm kur/}).click();await p.getByRole('button',{name:'iPhone',exact:true}).click();assert.equal(await p.locator('#phone-launch').getAttribute('aria-disabled'),'true');await p.locator('#phone-ready').check();
const link=await p.locator('#phone-launch').getAttribute('href');assert.ok(link.startsWith('shortcuts://run-shortcut?'));assert.equal(new URL(link).searchParams.get('name'),'Günlük Asistan Alarm');assert.ok(!Number.isNaN(Date.parse(new URL(link).searchParams.get('text'))));
await p.getByRole('button',{name:'Android',exact:true}).click();assert.match(await p.locator('#phone-launch').getAttribute('href'),/package=org.gunlukasistan.alarmbridge/);assert.equal(await p.locator('#phone-launch').getAttribute('aria-disabled'),'true');
const response=await p.request.get('/downloads/gunluk-alarm-test.apk');assert.equal(response.status(),200);assert.equal((await response.body()).subarray(0,2).toString(),'PK');
await p.waitForTimeout(350);await p.screenshot({path:path.join(output,'telefon-alarmi.png')});
assert.deepEqual(await p.evaluate(()=>{const now=new Date(2026,9,20,13);return [new Date(2026,9,20,14),new Date(2026,9,21,12),new Date(2026,9,22,14),new Date(2026,9,20,12)].map(at=>GAPhoneAlarm.eligible(at,now))}),[true,true,false,false]);
await p.getByRole('button',{name:'Kapat',exact:true}).click();
// Open the real signed-out form; do not authenticate or submit to a real account.
await p.evaluate(()=>App.show('ayarlar'));await p.locator('[data-act="account"]').click();await p.locator('#acc-google .google-logo').waitFor();await p.waitForTimeout(350);await p.screenshot({path:path.join(output,'google-giris.png')});
assert.deepEqual(errors,[]);console.log('PASS: 6 duration options; reload persistence; active break preserved; iPhone URL; Android intent and APK; future/past date guards; logo source; no page errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
