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

  console.log('=== MAX_PER_USER=2 TEST ===\n');

  // Register + login fresh user
  const uname = 'per2_test_' + Date.now();
  const reg = await req('POST', '/auth/register', { username: uname, password: 'Test1234!' });
  const login = await req('POST', '/auth/login', { username: uname, password: 'Test1234!' });
  const token = login.body.access_token;
  console.log(`User: ${uname} (${reg.status})`);

  const w0 = await req('GET', '/api/wallet/me', null, hdr(token));
  console.log(`Balance before: ${w0.body.balance}\n`);

  // Redemption 1 → PASS
  const r1 = await req('POST', '/api/coupons/redeem', { code: 'WS-TEST-100' }, hdr(token));
  const w1 = await req('GET', '/api/wallet/me', null, hdr(token));
  console.log(`Redemption 1: ${r1.status >= 200 && r1.status < 300 ? 'PASS' : 'FAIL'} (${r1.status}) balance=${w1.body.balance}`);
  (r1.status >= 200 && r1.status < 300) ? pass++ : fail++;

  // Redemption 2 → PASS
  const r2 = await req('POST', '/api/coupons/redeem', { code: 'WS-TEST-100' }, hdr(token));
  const w2 = await req('GET', '/api/wallet/me', null, hdr(token));
  console.log(`Redemption 2: ${r2.status >= 200 && r2.status < 300 ? 'PASS' : 'FAIL'} (${r2.status}) balance=${w2.body.balance}`);
  (r2.status >= 200 && r2.status < 300) ? pass++ : fail++;

  // Redemption 3 → 409 REJECTED
  const r3 = await req('POST', '/api/coupons/redeem', { code: 'WS-TEST-100' }, hdr(token));
  console.log(`Redemption 3: ${r3.status === 409 ? 'PASS' : 'FAIL'} (${r3.status}) "${r3.body.message || ''}"`);
  r3.status === 409 ? pass++ : fail++;

  // Wallet should have increased by 200 total (2x100)
  const w3 = await req('GET', '/api/wallet/me', null, hdr(token));
  const totalIncrease = BigInt(w3.body.balance) - BigInt(w0.body.balance);
  console.log(`\nBalance after: ${w3.body.balance} (total increase: ${totalIncrease})`);
  (totalIncrease === 200n) ? pass++ : fail++;
  console.log(`Wallet correctness: ${totalIncrease === 200n ? 'PASS' : 'FAIL'}`);

  console.log(`\n=========================================`);
  console.log(`TOTAL: ${pass} PASS / ${fail} FAIL`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
