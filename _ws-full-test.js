const { io } = require('socket.io-client');
const http = require('http');

async function login(u, p) {
  return new Promise((res, rej) => {
    const d = JSON.stringify({ username: u, password: p });
    const r = http.request({ hostname:'localhost', port:3000, path:'/auth/login', method:'POST',
      headers:{'Content-Type':'application/json','Content-Length':d.length}}, resp=>{
      let b=''; resp.on('data',c=>b+=c); resp.on('end',()=>res(JSON.parse(b)));
    }); r.on('error',rej); r.write(d); r.end();
  });
}

async function post(path, body, hdr) {
  return new Promise((res, rej) => {
    const d = JSON.stringify(body);
    const r = http.request({ hostname:'localhost', port:3000, path, method:'POST',
      headers:{'Content-Type':'application/json','Content-Length':d.length, ...hdr}}, resp=>{
      let b=''; resp.on('data',c=>b+=c); resp.on('end',()=>{
        if(resp.statusCode>=200&&resp.statusCode<300) res(JSON.parse(b));
        else rej({status:resp.statusCode,body:b});
      });}); r.on('error',rej); r.write(d); r.end();
  });
}

async function run() {
  let pass = 0, fail = 0;
  const a = await login('emailtest_a','Test1234!');
  const b = await login('emailtest_b','Test1234!');
  const hA = { Authorization: 'Bearer '+a.access_token };
  const hB = { Authorization: 'Bearer '+b.access_token };

  console.log('\n=== WS TESTS ===');

  // --- TEST 1: Non-host startGame rejected ---
  const room1 = await post('/api/rooms', { name:'WS1', players:4 }, hA);
  await post(`/api/rooms/${room1.code}/join`, { name:'Host' }, hA);
  await post(`/api/rooms/${room1.code}/join`, { name:'P2' }, hB);
  
  const r1 = await new Promise(resolve => {
    const s = io('http://localhost:3000',{auth:{token:b.access_token}});
    const out = [];
    s.on('connect',()=>{ out.push('CONNECTED'); s.emit('startGame',{roomCode:room1.code}); });
    s.on('gameError',d=>{ out.push('ERR:'+d.message); s.disconnect(); resolve(out); });
    s.on('gameStarted',()=>{ out.push('UNEXPECTED'); s.disconnect(); resolve(out); });
    setTimeout(()=>{s.disconnect();resolve(out);},3000);
  });
  const w1 = r1.some(r=>r.includes('ERR:') && r.includes('صاحب الغرفة'));
  console.log(`W1 Non-host startGame: ${w1?'PASS':'FAIL'} (${r1.join(' | ')})`);
  w1?pass++:fail++;

  // --- TEST 2: Host startGame via WS ---
  const r2 = await new Promise(resolve => {
    const s = io('http://localhost:3000',{auth:{token:a.access_token}});
    const out = [];
    s.on('connect',()=>{ out.push('CONNECTED'); s.emit('joinRoom',{roomCode:room1.code,name:'HostWS'}); });
    s.on('roomUpdated',()=>{
      if(!out.includes('STARTING')){ out.push('STARTING'); s.emit('startGame',{roomCode:room1.code}); }
    });
    s.on('gameStarted',d=>{ out.push('GAME_STARTED:tiles='+d.hand.length); s.disconnect(); resolve(out); });
    s.on('gameError',d=>{ out.push('ERR:'+d.message); });
    setTimeout(()=>{s.disconnect();resolve(out);},3000);
  });
  const w2 = r2.some(r=>r.includes('GAME_STARTED'));
  console.log(`W2 Host startGame: ${w2?'PASS':'FAIL'} (${r2.join(' | ')})`);
  w2?pass++:fail++;

  // --- TEST 3: Valid domino play (fresh room, start then play) ---
  const room3 = await post('/api/rooms', { name:'WS3', players:4 }, hA);
  await post(`/api/rooms/${room3.code}/join`, { name:'HostPlay' }, hA);
  await post(`/api/rooms/${room3.code}/join`, { name:'P2Play' }, hB);
  
  const r3 = await new Promise(resolve => {
    const s = io('http://localhost:3000',{auth:{token:a.access_token}});
    const out = [];
    let phase = 'join';
    s.on('connect',()=>{ out.push('CONNECTED'); s.emit('joinRoom',{roomCode:room3.code,name:'HostPlay'}); });
    s.on('roomUpdated',()=>{
      if(phase==='join'){ phase='start'; s.emit('startGame',{roomCode:room3.code}); }
    });
    s.on('gameStarted',()=>{ phase='play'; s.emit('playDomino',{roomCode:room3.code,tileIndex:0}); });
    s.on('dominoPlayed',d=>{ out.push('DOMINO:board='+d.board.length); s.disconnect(); resolve(out); });
    s.on('gameError',d=>{ out.push('ERR:'+d.message); s.disconnect(); resolve(out); });
    setTimeout(()=>{s.disconnect();resolve(out);},3000);
  });
  const w3 = r3.some(r=>r.includes('DOMINO:board=1'));
  console.log(`W3 Valid domino play: ${w3?'PASS':'FAIL'} (${r3.join(' | ')})`);
  w3?pass++:fail++;

  // --- TEST 4: Chat from member (fresh room) ---
  const room4 = await post('/api/rooms', { name:'WS4', players:4 }, hA);
  await post(`/api/rooms/${room4.code}/join`, { name:'HostChat' }, hA);
  
  const r4 = await new Promise(resolve => {
    const s = io('http://localhost:3000',{auth:{token:a.access_token}});
    const out = [];
    s.on('connect',()=>{ out.push('CONNECTED'); s.emit('joinRoom',{roomCode:room4.code,name:'ChatHost'}); });
    s.on('roomUpdated',()=>{
      if(!out.includes('CHATTED')){ out.push('CHATTED'); s.emit('chat',{roomCode:room4.code,message:'Salam!'}); }
    });
    s.on('chat',d=>{ out.push('CHAT:'+d.message); s.disconnect(); resolve(out); });
    setTimeout(()=>{s.disconnect();resolve(out);},3000);
  });
  const w4 = r4.some(r=>r.includes('CHAT:Salam!'));
  console.log(`W4 Chat from member: ${w4?'PASS':'FAIL'} (${r4.join(' | ')})`);
  w4?pass++:fail++;

  // --- TEST 5: Chat from non-member ---
  const r5 = await new Promise(resolve => {
    const s = io('http://localhost:3000',{auth:{token:a.access_token}});
    const out = [];
    s.on('connect',()=>{ out.push('CONNECTED'); s.emit('chat',{roomCode:room4.code,message:'Infiltrate!'}); });
    s.on('gameError',d=>{ out.push('ERR:'+d.message); s.disconnect(); resolve(out); });
    s.on('chat',()=>{ out.push('UNEXPECTED'); });
    setTimeout(()=>{s.disconnect();resolve(out);},3000);
  });
  const w5 = r5.some(r=>r.includes('ERR:') && r.includes('عضو'));
  console.log(`W5 Chat from non-member: ${w5?'PASS':'FAIL'} (${r5.join(' | ')})`);
  w5?pass++:fail++;

  // --- TEST 6: No token connection ---
  const r6 = await new Promise(resolve => {
    const s = io('http://localhost:3000');
    const out = [];
    s.on('connect',()=>{ out.push('UNEXPECTED'); });
    s.on('gameError',d=>{ out.push('ERR:'+d.message); });
    setTimeout(()=>{s.disconnect();resolve(out);},3000);
  });
  const w6 = r6.some(r=>r.includes('ERR:'));
  console.log(`W6 No token: ${w6?'PASS':'FAIL'} (${r6.join(' | ')})`);
  w6?pass++:fail++;

  // --- TEST 7: Invalid token ---
  const r7 = await new Promise(resolve => {
    const s = io('http://localhost:3000',{auth:{token:'garbage.jwt.token'}});
    const out = [];
    s.on('connect',()=>{ out.push('UNEXPECTED'); });
    s.on('gameError',d=>{ out.push('ERR:'+d.message); });
    setTimeout(()=>{s.disconnect();resolve(out);},3000);
  });
  const w7 = r7.some(r=>r.includes('ERR:'));
  console.log(`W7 Invalid token: ${w7?'PASS':'FAIL'} (${r7.join(' | ')})`);
  w7?pass++:fail++;

  console.log(`\n=========================================`);
  console.log(`WS TOTAL: ${pass} PASS / ${fail} FAIL`);
  process.exit(0);
}

run().catch(e=>{ console.error(e); process.exit(1); });
