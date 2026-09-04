import http from 'http';

const testCases = [
  { identifier: 'VT-HR-ADMIN', password: 'Admin@123', label: 'Admin Ref ID (VT-HR-ADMIN)' },
  { identifier: 'VT - HR - ADMIN', password: 'Admin@123', label: 'Admin Ref ID with spaces (VT - HR - ADMIN)' },
  { identifier: 'admin@vamtech.in', password: 'Admin@123', label: 'Admin Email (admin@vamtech.in)' },
  { identifier: 'VT-2026-001', password: 'Emp@123', label: 'Employee Ref ID (VT-2026-001)' },
  { identifier: 'employee@vamtech.in', password: 'Emp@123', label: 'Employee Email (employee@vamtech.in)' },
  { identifier: 'VT-INT-2026-001', password: 'Intern@123', label: 'Paid Intern ID (VT-INT-2026-001)' },
  { identifier: 'VT - INT - 2026 - 001', password: 'Intern@123', label: 'Paid Intern ID with spaces (VT - INT - 2026 - 001)' },
  { identifier: 'INT-2026-001', password: 'Intern@123', label: 'Paid Intern ID shorthand (INT-2026-001)' },
  { identifier: 'intern@vamtech.in', password: 'Intern@123', label: 'Paid Intern Email (intern@vamtech.in)' },
  { identifier: 'VT-INT-2026-002', password: 'Intern@123', label: 'Unpaid Intern ID (VT-INT-2026-002)' },
  { identifier: 'unpaid.intern@vamtech.in', password: 'Intern@123', label: 'Unpaid Intern Email (unpaid.intern@vamtech.in)' },
];

function postLogin(tc: typeof testCases[0]): Promise<void> {
  return new Promise((resolve) => {
    const data = JSON.stringify({ identifier: tc.identifier, password: tc.password });
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            console.log(`[${res.statusCode}] ${tc.label} -> Success: ${parsed.success}, Role: ${parsed.role}, Redirect: ${parsed.redirectTo}`);
          } catch (e) {
            console.log(`[${res.statusCode}] ${tc.label} -> Raw: ${body}`);
          }
          resolve();
        });
      }
    );
    req.on('error', (e) => {
      console.error(`${tc.label} request error:`, e.message);
      resolve();
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  for (const tc of testCases) {
    await postLogin(tc);
  }
}

run();
