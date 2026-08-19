/**
 * test-ssrf.js — ECSOC26 Issue #219: SSRF / Loopback Filtering Unit Tests
 *
 * Tests the isInternalHostname() validator directly.
 * Run with: node test-ssrf.js
 */

'use strict';

// ─── Inline the same logic from server.js ───
function isInternalHostname(hostname) {
  if (!hostname) return true;

  const h = hostname.toLowerCase().trim();

  if (h === 'localhost') return true;

  const bare = h.startsWith('[') && h.endsWith(']') ? h.slice(1, -1) : h;

  const ipv6Blocked = [
    /^::1$/,
    /^fc[0-9a-f]{2}:/,
    /^fd[0-9a-f]{2}:/,
    /^fe80:/,
    /^::ffff:127\./,
    /^::ffff:10\./,
    /^::ffff:192\.168\./,
    /^::ffff:172\.(1[6-9]|2[0-9]|3[01])\./
  ];
  if (ipv6Blocked.some(re => re.test(bare))) return true;

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(bare);
  if (ipv4) {
    const [, a, b, c] = ipv4.map(Number);
    if (a === 127)                              return true;
    if (a === 10)                               return true;
    if (a === 192 && b === 168)                 return true;
    if (a === 172 && b >= 16 && b <= 31)        return true;
    if (a === 169 && b === 254)                 return true;
    if (a === 0)                                return true;
    if (a === 100 && b >= 64 && b <= 127)       return true;
    if (a === 198 && (b === 18 || b === 19))    return true;
    if (a === 203 && b === 0 && c === 113)      return true;
    if (a === 255 && b === 255 && c === 255)    return true;
    if (a === 240)                              return true;
  }

  return false;
}

// ─── Test runner ───
let passed = 0;
let failed = 0;

function test(description, hostname, expectedBlocked) {
  const actual = isInternalHostname(hostname);
  const ok = actual === expectedBlocked;
  if (ok) {
    console.log(`  ✅ PASS — ${description} (hostname: "${hostname}")`);
    passed++;
  } else {
    console.error(`  ❌ FAIL — ${description} (hostname: "${hostname}") expected blocked=${expectedBlocked}, got ${actual}`);
    failed++;
  }
}

// ─── ALLOWED (external — should NOT be blocked) ───
console.log('\n--- External / Public domains (should be ALLOWED) ---');
test('google.com is allowed',          'google.com',           false);
test('github.com is allowed',          'github.com',           false);
test('example.com is allowed',         'example.com',          false);
test('8.8.8.8 (Google DNS) allowed',   '8.8.8.8',              false);
test('1.1.1.1 (Cloudflare) allowed',   '1.1.1.1',              false);
test('203.0.114.1 (not doc range)',     '203.0.114.1',          false);
test('172.15.0.1 (not RFC-1918)',       '172.15.0.1',           false);
test('172.32.0.1 (not RFC-1918)',       '172.32.0.1',           false);
test('192.169.0.1 (not RFC-1918)',      '192.169.0.1',          false);
test('11.0.0.1 (not RFC-1918)',         '11.0.0.1',             false);

// ─── BLOCKED (internal / private — should be blocked) ───
console.log('\n--- Loopback addresses (should be BLOCKED) ---');
test('localhost blocked',              'localhost',             true);
test('127.0.0.1 blocked',             '127.0.0.1',             true);
test('127.1.2.3 blocked',             '127.1.2.3',             true);
test('127.255.255.255 blocked',        '127.255.255.255',       true);

console.log('\n--- RFC-1918 private ranges (should be BLOCKED) ---');
test('10.0.0.1 blocked',              '10.0.0.1',              true);
test('10.255.255.255 blocked',         '10.255.255.255',        true);
test('192.168.0.1 blocked',           '192.168.0.1',           true);
test('192.168.100.200 blocked',        '192.168.100.200',       true);
test('172.16.0.1 blocked',            '172.16.0.1',            true);
test('172.20.5.5 blocked',            '172.20.5.5',            true);
test('172.31.255.255 blocked',         '172.31.255.255',        true);

console.log('\n--- Link-local and special ranges (should be BLOCKED) ---');
test('169.254.1.1 link-local blocked', '169.254.1.1',          true);
test('0.0.0.0 unspecified blocked',    '0.0.0.0',              true);
test('100.64.0.1 shared blocked',      '100.64.0.1',           true);
test('100.127.255.255 shared blocked', '100.127.255.255',      true);
test('198.18.0.1 benchmark blocked',   '198.18.0.1',           true);
test('198.19.255.255 benchmark blocked','198.19.255.255',       true);
test('203.0.113.5 doc range blocked',  '203.0.113.5',          true);
test('255.255.255.255 broadcast blocked','255.255.255.255',     true);
test('240.0.0.1 reserved blocked',     '240.0.0.1',            true);

console.log('\n--- IPv6 internal ranges (should be BLOCKED) ---');
test('::1 IPv6 loopback blocked',       '::1',                  true);
test('[::1] bracketed IPv6 loopback',   '[::1]',                true);
test('fe80::1 link-local blocked',      'fe80::1',              true);
test('fc00::1 ULA blocked',             'fc00::1',              true);
test('fd12::1 ULA blocked',             'fd12::1',              true);
test('::ffff:127.0.0.1 mapped blocked', '::ffff:127.0.0.1',     true);
test('::ffff:10.0.0.1 mapped blocked',  '::ffff:10.0.0.1',      true);
test('::ffff:192.168.1.1 mapped blocked','::ffff:192.168.1.1',  true);

console.log('\n--- Edge cases ---');
test('empty string is blocked',        '',                      true);
test('LOCALHOST uppercase blocked',    'LOCALHOST',             true);

// ─── Summary ───
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
} else {
  console.log('✅ ALL TESTS PASSED');
  process.exit(0);
}
