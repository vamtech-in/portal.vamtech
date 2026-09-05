async function verifyProdDeployment() {
  console.log('Testing live production at https://portal.vamtech.in ...');

  try {
    // 1. Admin login
    console.log('1. Authenticating as Admin on portal.vamtech.in...');
    const loginRes = await fetch('https://portal.vamtech.in/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@vamtech.in', password: 'Admin@123' })
    });
    console.log('Login Status:', loginRes.status);
    const cookie = loginRes.headers.get('set-cookie');
    if (!cookie) {
      throw new Error('No session cookie returned from login');
    }

    // 2. Fetch candidates from production
    console.log('2. Fetching candidates from production...');
    const candsRes = await fetch('https://portal.vamtech.in/api/hr/candidates', {
      headers: { 'Cookie': cookie.split(';')[0] }
    });
    const candsData = await candsRes.json();
    const candidate = candsData.candidates?.find((c) => c.status === 'Selected' || c.status === 'Applied' || c.status === 'Interviewed') || candsData.candidates?.[0];
    console.log(`Target candidate: ${candidate?.name} (${candidate?.refNumber}) - Status: ${candidate?.status}`);

    if (!candidate) {
      throw new Error('No candidate found in database');
    }

    // 3. Trigger Offer Letter generation on production
    console.log(`3. Generating offer letter for ${candidate.name} on portal.vamtech.in ...`);
    const offerRes = await fetch('https://portal.vamtech.in/api/hr/offer-letter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie.split(';')[0]
      },
      body: JSON.stringify({
        candidateId: candidate.id,
        type: candidate.refNumber?.includes('INT') ? 'PAID_INTERNSHIP' : 'FULL_TIME',
        candidateAddress: 'Lucknow, Uttar Pradesh, 226028',
        designation: candidate.roleApplied || 'Software Engineer',
        department: 'Engineering',
        duration: '3 months',
        startDate: '5 September 2026',
        endDate: '5 December 2026',
        workingHours: '10:00 AM to 5:00 PM, 5 days a week',
        stipendAmount: '5000',
        reportingManager: 'Aditya Gupta, HR',
        workLocation: 'Remote',
        dateOfJoining: '2026-10-01',
        probationPeriod: '6 Months',
        annualCtc: '1200000',
        noticePeriod: '60 Days',
        hrName: 'Aditya Gupta'
      })
    });

    console.log('Offer Letter Generation Status:', offerRes.status);
    const offerJson = await offerRes.json();
    console.log('Offer Letter Response Body:\n', JSON.stringify(offerJson, null, 2));

    if (offerRes.status !== 200 || !offerJson.success) {
      console.log('\n❌ Production returned an error or deployment is still in progress.');
      return false;
    }

    // 4. Test PDF download URL
    const downloadUrl = 'https://portal.vamtech.in' + offerJson.offerRecord.pdfUrl;
    console.log('\n4. Testing PDF Download endpoint:', downloadUrl);
    const pdfRes = await fetch(downloadUrl);
    console.log('Download Status:', pdfRes.status);
    console.log('Content-Type:', pdfRes.headers.get('content-type'));
    const pdfBytes = await pdfRes.arrayBuffer();
    console.log('Downloaded PDF Size:', pdfBytes.byteLength, 'bytes');

    if (pdfRes.status === 200 && pdfBytes.byteLength > 10000) {
      console.log('\n🎉 PRODUCTION DEPLOYMENT VERIFIED 100% WORKING! Offer letter generated and downloaded with status 200.');
      return true;
    } else {
      console.log('PDF download check failed');
      return false;
    }
  } catch (err) {
    console.error('Production test error:', err);
    return false;
  }
}

verifyProdDeployment();
