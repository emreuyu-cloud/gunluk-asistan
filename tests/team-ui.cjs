const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const report = [];
const output = process.env.TEST_OUTPUT || path.resolve(__dirname,'../test-results');
require('node:fs').mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || undefined,headless:true});
 const errors=[];
 async function person(){
  const c=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
  await c.addInitScript(()=>{window.GA_EMULATORS=true;window.GA_FIREBASE_CONFIG={apiKey:'demo-key',authDomain:'demo-gunluk.firebaseapp.com',projectId:'demo-gunluk',appId:'demo-app'};});
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);await p.goto(process.env.APP_URL || 'http://127.0.0.1:4173');return {c,p};
 }
 async function signup(p,mail){
  await p.getByRole('button',{name:'Ekip',exact:true}).click();
  await p.getByRole('button',{name:'Google veya e-posta ile giriş'}).click();
  await p.getByRole('button',{name:'Kayıt ol',exact:true}).click();
  await p.getByLabel('E-posta',{exact:true}).fill(mail);await p.getByLabel('Şifre',{exact:true}).fill('Test123456!');
  await p.getByRole('button',{name:'Kayıt ol',exact:true}).click();await p.locator('#sheet.on').waitFor({state:'hidden'});
  await p.getByRole('button',{name:'+ Yeni oda oluştur'}).waitFor();
 }
 const {p:a,c:ca}=await person();const {p:b,c:cb}=await person();
 const stamp=Date.now();await signup(a,`alice${stamp}@example.test`);await signup(b,`bob${stamp}@example.test`);report.push('Two independent email accounts created through UI against Auth emulator.');
 await a.getByRole('button',{name:'+ Yeni oda oluştur'}).click();await a.getByLabel('Oda adı',{exact:true}).fill('F kontuvarı ekibi');await a.getByLabel('Ekipte görünecek adın').fill('Elif');await a.getByRole('button',{name:'Odayı oluştur',exact:true}).click();
 await a.locator('#team-members').getByText('Elif',{exact:false}).waitFor();
 await a.getByRole('button',{name:'Davet bağlantısı',exact:true}).click();const invite=await a.locator('input[aria-label="Davet bağlantısı"]').inputValue();assert.match(invite,/#invite=[a-f0-9]{48}$/);await a.getByRole('button',{name:'Kapat',exact:true}).click();
 await b.goto(invite);await b.getByRole('button',{name:'Odaya katıl',exact:true}).click();await b.getByLabel('Ekipte görünecek adın').fill('Emre');await b.getByRole('button',{name:'Katıl ve durumumu paylaş'}).click();await b.locator('#sheet.on').waitFor({state:'hidden'});await a.locator('#team-members').getByText('Emre',{exact:false}).waitFor();report.push('Room creation, random invite, second-user join and realtime membership passed.');
 await a.getByLabel('Mesajın',{exact:true}).fill('F kontuvarında buluşalım.');await a.getByRole('button',{name:'Mesaj gönder',exact:true}).click();await b.locator('#team-messages').getByText('F kontuvarında buluşalım.',{exact:true}).waitFor();
 await b.getByLabel('Mesajın',{exact:true}).fill('<img src=x onerror=alert(1)> Tamam, geliyorum.');await b.getByRole('button',{name:'Mesaj gönder',exact:true}).click();await a.locator('#team-messages').getByText('<img src=x onerror=alert(1)> Tamam, geliyorum.',{exact:true}).waitFor();assert.equal(await a.locator('#team-messages img').count(),0);report.push('Realtime chat, author display and HTML escaping passed.');
 // Remove the security-test message in the emulator before making review screenshots.
 await b.evaluate(async()=>{const c=await GAAccount.connection();const rooms=await c.fs.getDocs(c.fs.collection(c.db,'users',c.user.uid,'rooms'));const messages=await c.fs.getDocs(c.fs.collection(c.db,'rooms',rooms.docs[0].id,'messages'));for(const m of messages.docs)if(m.data().uid===c.user.uid&&m.data().text.startsWith('<img'))await c.fs.deleteDoc(m.ref);});
 await b.getByLabel('Mesajın',{exact:true}).fill('Tamam, moladan sonra yanınızdayım.');await b.getByRole('button',{name:'Mesaj gönder',exact:true}).click();await a.getByText('Tamam, moladan sonra yanınızdayım.',{exact:true}).waitFor();
 await b.getByRole('button',{name:'Mola',exact:true}).click();await b.locator('#screen-mola').getByRole('button',{name:'Molaya başla'}).click();
 await a.waitForFunction(()=>document.querySelector('#team-members').textContent.includes('Molada ·'));
 await a.locator('#toast.on').waitFor({state:'hidden'});await a.waitForTimeout(300);
 await a.screenshot({path:path.join(output,'ekip-light.png')});
 await b.getByRole('button',{name:'Ekip',exact:true}).click();await b.getByRole('button',{name:'Geliyorum',exact:true}).click();await a.waitForFunction(()=>document.querySelector('#team-members').textContent.includes('Geliyorum'));
 await b.reload();await b.locator('[data-room]').first().click();await a.waitForFunction(()=>document.querySelector('#team-members').textContent.includes('Geliyorum'));report.push('Returning status survives reload.');
 await b.waitForTimeout(5500);await b.getByRole('button',{name:'Döndüm',exact:true}).click();await a.waitForFunction(()=>!document.querySelector('#team-members').textContent.includes('Geliyorum'));assert.equal(await b.evaluate(()=>JSON.parse(localStorage.getItem('activeBreak'))),null);assert.ok((await b.evaluate(()=>JSON.parse(localStorage.getItem('breaks')))).length>0);report.push('Break countdown, returning, back-to-work and personal break recording passed.');
 await a.getByRole('button',{name:'Ayarlar',exact:true}).click();await a.getByRole('button',{name:'Koyu',exact:true}).click();await a.getByRole('button',{name:'Ekip',exact:true}).click();await a.waitForTimeout(350);await a.screenshot({path:path.join(output,'ekip-dark.png')});
 await cb.setOffline(true);await b.getByLabel('Mesajın',{exact:true}).fill('çevrimdışı mesaj');await b.getByRole('button',{name:'Mesaj gönder',exact:true}).click();await b.locator('#message-error').getByText(/internet/).waitFor();assert.equal(await a.getByText('çevrimdışı mesaj',{exact:true}).count(),0);await cb.setOffline(false);report.push('Offline send reports failure without falsely claiming delivery.');
 await b.getByRole('button',{name:'Odadan ayrıl',exact:true}).click();await b.locator('#leave-confirm').click();await b.locator('#sheet.on').waitFor({state:'hidden'});await a.waitForFunction(()=>!document.querySelector('#team-members').textContent.includes('Emre'));report.push('Leaving removes shared membership/presence.');
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:report,pageErrors:errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
