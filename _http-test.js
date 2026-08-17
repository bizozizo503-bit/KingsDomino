const http = require('http');

function req(method, path, body, hdr) {
  return new Promise((res, rej) => {
    const d = body ? JSON.stringify(body) : null;
    const h = { 'Content-Type': 'application/json', ...hdr };
    if (d) h['Content-Length'] = Buffer.byteLength(d);
    const r = http.request({ hostname: 'localhost', port: 3000, path, method, headers: h }, resp => {
      let b = ''; resp.on('data', c => b += c); resp.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(b); } catch { parsed = b; }
        res({ status: resp.statusCode, body: parsed });
      });
    });
    r.on('error', rej);
    if (d) r.write(d);
    r.end();
  });
}

async function run() {
  let pass = 0, fail = 0;
  const hdr = (token) => ({ Authorization: 'Bearer ' + token });

  console.log('=== HTTP TESTS ===\n');

  // A: Register new user
  const uname_a = 'http_a_' + Date.now();
  const ra = await req('POST', '/auth/register', { username: uname_a, password: 'Test1234!' });
  console.log(`A Register: ${ra.status === 201 ? 'PASS' : 'FAIL'} (${ra.status})`);
  ra.status === 201 ? pass++ : fail++;

  // B: Login
  const rb = await req('POST', '/auth/login', { username: uname_a, password: 'Test1234!' });
  const tokenA = rb.body.access_token;
  console.log(`B Login: ${rb.status >= 200 && rb.status < 300 && tokenA ? 'PASS' : 'FAIL'} (${rb.status})`);
  rb.status >= 200 && rb.status < 300 && tokenA ? pass++ : fail++;

  // C: Get wallet
  const rc = await req('GET', '/api/wallet/me', null, hdr(tokenA));
  console.log(`C Wallet: ${rc.status === 200 && rc.body.balance !== undefined ? 'PASS' : 'FAIL'} (${rc.status})`);
  rc.status === 200 ? pass++ : fail++;

  // D: List rooms (empty)
  const rd = await req('GET', '/api/rooms', null, hdr(tokenA));
  console.log(`D Rooms list: ${rd.status === 200 && Array.isArray(rd.body) ? 'PASS' : 'FAIL'} (${rd.status})`);
  rd.status === 200 ? pass++ : fail++;

  // E: Create room
  const re = await req('POST', '/api/rooms', { name: 'HTTPTest', players: 4 }, hdr(tokenA));
  console.log(`E Create room: ${re.status === 201 ? 'PASS' : 'FAIL'} (${re.status} code=${re.body.code})`);
  re.status === 201 ? pass++ : fail++;
  const roomCode = re.body.code;

  // F: Join room as host
  const rf = await req('POST', `/api/rooms/${roomCode}/join`, { name: 'Host' }, hdr(tokenA));
  console.log(`F Host join: ${rf.status === 201 ? 'PASS' : 'FAIL'} (${rf.status})`);
  rf.status === 201 ? pass++ : fail++;

  // Register + login user B
  const uname_b = 'http_b_' + Date.now();
  await req('POST', '/auth/register', { username: uname_b, password: 'Test1234!' });
  const rb2 = await req('POST', '/auth/login', { username: uname_b, password: 'Test1234!' });
  const tokenB = rb2.body.access_token;

  // G: Join room as player B
  const rg = await req('POST', `/api/rooms/${roomCode}/join`, { name: 'PlayerB' }, hdr(tokenB));
  console.log(`G Player B join: ${rg.status === 201 ? 'PASS' : 'FAIL'} (${rg.status})`);
  rg.status === 201 ? pass++ : fail++;

  // H: Non-host startGame -> 403
  const rh = await req('POST', `/api/rooms/${roomCode}/start`, null, hdr(tokenB));
  console.log(`H Non-host start -> 403: ${rh.status === 403 ? 'PASS' : 'FAIL'} (${rh.status})`);
  rh.status === 403 ? pass++ : fail++;

  // I: Host startGame -> playing
  const ri = await req('POST', `/api/rooms/${roomCode}/start`, null, hdr(tokenA));
  console.log(`I Host start -> playing: ${ri.status >= 200 && ri.status < 300 && ri.body.status === 'playing' ? 'PASS' : 'FAIL'} (${ri.status} ${ri.body.status})`);
  ri.status >= 200 && ri.status < 300 && ri.body.status === 'playing' ? pass++ : fail++;

  // J: Coupon 404
  const rj = await req('POST', '/api/coupons/FAKE/redeem', { username: uname_a }, hdr(tokenA));
  console.log(`J Coupon 404: ${rj.status === 404 ? 'PASS' : 'FAIL'} (${rj.status})`);
  rj.status === 404 ? pass++ : fail++;

  console.log(`\n=========================================`);
  console.log(`HTTP TOTAL: ${pass} PASS / ${fail} FAIL`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
