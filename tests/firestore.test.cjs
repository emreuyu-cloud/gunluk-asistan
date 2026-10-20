const {test,before,after} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {initializeTestEnvironment,assertSucceeds,assertFails} = require('@firebase/rules-unit-testing');
const {doc,collection,getDoc,getDocs,setDoc,updateDoc,deleteDoc,writeBatch,serverTimestamp,Timestamp,query,orderBy,limit} = require('firebase/firestore');
let env, a, b, outsider, anon;
const invitation = 'a'.repeat(48), revoked = 'b'.repeat(48), expired = 'c'.repeat(48);
function member(uid,name,joinToken='') {return {uid,name,joinToken,joinedAt:serverTimestamp(),updatedAt:serverTimestamp(),state:'ready',breakStartedAt:0,breakEndsAt:0};}
async function join(db,uid,token) {
  const batch=writeBatch(db);batch.set(doc(db,'rooms/f/members/'+uid),member(uid,uid,token));batch.set(doc(db,'users/'+uid+'/rooms/f'),{name:'F kontuvarı',joinedAt:serverTimestamp()});return batch.commit();
}
before(async()=>{
  env=await initializeTestEnvironment({projectId:'demo-gunluk',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync(path.resolve(__dirname,'../firestore.rules'),'utf8')}});
  await env.clearFirestore();
  a=env.authenticatedContext('alice').firestore(); b=env.authenticatedContext('bob').firestore(); outsider=env.authenticatedContext('eve').firestore();anon=env.unauthenticatedContext().firestore();
});
after(async()=>{await env.cleanup()});
test('creator atomically creates a private room, own membership and index',async()=>{
  const batch=writeBatch(a);batch.set(doc(a,'rooms/f'),{name:'F kontuvarı',createdBy:'alice',createdAt:serverTimestamp()});batch.set(doc(a,'rooms/f/members/alice'),member('alice','alice'));batch.set(doc(a,'users/alice/rooms/f'),{name:'F kontuvarı',joinedAt:serverTimestamp()});await assertSucceeds(batch.commit());
});
test('room, members and messages are unavailable to outsiders and unauthenticated clients',async()=>{
  for(const db of [outsider,anon]) for(const p of ['rooms/f','rooms/f/members/alice','rooms/f/messages/private']) await assertFails(getDoc(doc(db,p)));
  await assertFails(getDocs(collection(outsider,'rooms/f/members')));await assertFails(getDocs(collection(outsider,'rooms/f/messages')));await assertFails(getDocs(collection(a,'rooms')));
});
test('a member can create an unguessable invite, but no user may enumerate invites',async()=>{
  await assertSucceeds(setDoc(doc(a,'invites/'+invitation),{roomId:'f',name:'F kontuvarı',createdBy:'alice',createdAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+86400000)}));
  await assertSucceeds(getDoc(doc(b,'invites/'+invitation)));await assertFails(getDocs(collection(b,'invites')));await assertFails(getDoc(doc(anon,'invites/'+invitation)));
});
test('join requires a valid invite; forged membership/index and stale bootstrap denied',async()=>{
  await assertFails(join(outsider,'eve','d'.repeat(48)));
  await assertFails(setDoc(doc(outsider,'users/eve/rooms/f'),{name:'F kontuvarı',joinedAt:serverTimestamp()}));
  await assertSucceeds(join(b,'bob',invitation));
  await assertSucceeds(getDoc(doc(b,'rooms/f')));await assertSucceeds(getDocs(collection(b,'rooms/f/members')));
});
test('members can update only their own validated presence',async()=>{
  await assertSucceeds(updateDoc(doc(b,'rooms/f/members/bob'),{state:'break',breakStartedAt:Date.now()-1000,breakEndsAt:Date.now()+600000,updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(b,'rooms/f/members/alice'),{state:'returning',updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(outsider,'rooms/f/members/bob'),{state:'ready',updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(b,'rooms/f/members/bob'),{name:'alice',updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(b,'rooms/f/members/bob'),{state:'admin',updatedAt:serverTimestamp()}));
});
test('chat enforces membership, author identity, server time and message length',async()=>{
  const message={uid:'bob',name:'bob',text:'Molaya çıkıyorum',createdAt:serverTimestamp()};
  await assertSucceeds(setDoc(doc(b,'rooms/f/messages/one'),message));
  await assertSucceeds(getDocs(query(collection(a,'rooms/f/messages'),orderBy('createdAt','desc'),limit(60))));
  await assertFails(setDoc(doc(outsider,'rooms/f/messages/no'),{...message,uid:'eve',name:'eve'}));
  await assertFails(setDoc(doc(b,'rooms/f/messages/spoof'),{...message,uid:'alice',name:'alice'}));
  await assertFails(setDoc(doc(b,'rooms/f/messages/long'),{...message,text:'x'.repeat(2001)}));
  await assertFails(updateDoc(doc(a,'rooms/f/messages/one'),{text:'edited'}));
});
test('personal shifts and alarms stay private even to room members',async()=>{
  await assertSucceeds(setDoc(doc(a,'users/alice/data/state'),{alarm:{on:true},settings:{breakMin:60}}));
  await assertFails(getDoc(doc(b,'users/alice/data/state')));await assertFails(setDoc(doc(b,'users/alice/data/state'),{alarm:{on:false}}));
});
test('revoked and expired invitations cannot create memberships',async()=>{
  await env.withSecurityRulesDisabled(async c=>{
    const db=c.firestore();await setDoc(doc(db,'invites/'+expired),{roomId:'f',name:'F kontuvarı',createdBy:'alice',createdAt:Timestamp.now(),expiresAt:Timestamp.fromMillis(Date.now()-1000)});
  });
  await assertFails(join(outsider,'eve',expired));
  await assertSucceeds(setDoc(doc(a,'invites/'+revoked),{roomId:'f',name:'F kontuvarı',createdBy:'alice',createdAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+86400000)}));
  await assertFails(deleteDoc(doc(b,'invites/'+revoked)));await assertSucceeds(deleteDoc(doc(a,'invites/'+revoked)));await assertFails(join(outsider,'eve',revoked));
});
test('leaving removes access; a different room is isolated',async()=>{
  const batch=writeBatch(b);batch.delete(doc(b,'rooms/f/members/bob'));batch.delete(doc(b,'users/bob/rooms/f'));await assertSucceeds(batch.commit());
  await assertFails(getDoc(doc(b,'rooms/f/messages/one')));await assertFails(getDocs(collection(b,'rooms/f/members')));
  await assertFails(setDoc(doc(b,'rooms/f/members/bob'),member('bob','bob','')));
  await env.withSecurityRulesDisabled(c=>setDoc(doc(c.firestore(),'rooms/other/members/bob'),{uid:'bob'}));
  await assertFails(getDoc(doc(b,'rooms/f')));
});
