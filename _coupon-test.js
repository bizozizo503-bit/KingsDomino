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

  console.log('=== COUPON E2E TESTS ===\n');

  // Setup: register + login
  const uname = 'coupon_test_' + Date.now();
  const reg = await req('POST', '/auth/register', { username: uname, password: 'Test1234!' });
  const login = await req('POST', '/auth/login', { username: uname, password: 'Test1234!' });
  const token = login.body.access_token;

  // Get wallet before
  const wBefore = await req('GET', '/api/wallet/me', null, hdr(token));
  const balanceBefore = BigInt(wBefore.body.balance);
  console.log(`Wallet before: ${wBefore.body.balance}`);

  // A: Redeem valid coupon
  const ra = await req('POST', '/api/coupons/redeem', { code: 'WS-TEST-100' }, hdr(token));
  console.log(`A Redeem valid: ${ra.status === 201 || ra.status === 200 ? 'PASS' : 'FAIL'} (${ra.status}) ${JSON.stringify(ra.body)}`);
  (ra.status >= 200 && ra.status < 300) ? pass++ : fail++;

  // B: Wallet balance increased by 100
  const wAfter = await req('GET', '/api/wallet/me', null, hdr(token));
  const balanceAfter = BigInt(wAfter.body.balance);
  const increased = balanceAfter - balanceBefore;
  console.log(`B Wallet after: ${wAfter.body.balance} (increased by ${increased})`);
  (increased === 100n) ? pass++ : fail++;
  console.log(`   B Result: ${increased === 100n ? 'PASS' : 'FAIL'}`);

  // C: Redeem same coupon again → conflict
  const rc = await req('POST', '/api/coupons/redeem', { code: 'WS-TEST-100' }, hdr(token));
  console.log(`C Redeem duplicate: ${rc.status === 409 ? 'PASS' : 'FAIL'} (${rc.status}) ${rc.body.message || ''}`);
  rc.status === 409 ? pass++ : fail++;

  // D: Redeem nonexistent coupon → 404
  const rd = await req('POST', '/api/coupons/redeem', { code: 'DOES-NOT-EXIST' }, hdr(token));
  console.log(`D Redeem fake: ${rd.status === 404 ? 'PASS' : 'FAIL'} (${rd.status})`);
  rd.status === 404 ? pass++ : fail++;

  // E: Without auth → 401
  const re = await req('POST', '/api/coupons/redeem', { code: 'WS-TEST-100' }, {});
  console.log(`E No auth: ${re.status === 401 ? 'PASS' : 'FAIL'} (${re.status})`);
  re.status === 401 ? pass++ : fail++;

  // F: Check transaction recorded
  const txns = await req('GET', '/api/wallet/me/transactions', null, hdr(token));
  const couponTxn = Array.isArray(txns.body) ? txns.body.find(t => t.source === 'COUPON') : null;
  console.log(`F Coupon transaction exists: ${couponTxn ? 'YES' : 'NO'}`);
  couponTxn ? pass++ : fail++;

  console.log(`\n=========================================`);
  console.log(`COUPON TOTAL: ${pass} PASS / ${fail} FAIL`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
