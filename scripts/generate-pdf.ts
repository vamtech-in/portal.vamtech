import fs from 'fs';
import path from 'path';
import { renderDirectOfferLetterPDFBuffer, renderDirectVaultDocumentPDFBuffer, OfferDetails } from '../src/lib/pdf-generator';

async function main() {
  const args = process.argv.slice(2);
  const inputFilePath = args[0];
  const outputFilePath = args[1];

  if (!inputFilePath || !outputFilePath) {
    console.error('Usage: tsx generate-pdf.ts <inputJsonPath> <outputPdfPath>');
    process.exit(1);
  }

  const rawInput = fs.readFileSync(inputFilePath, 'utf8');
  const payload = JSON.parse(rawInput);

  let buffer: Buffer;

  if (payload.kind === 'VAULT_DOCUMENT') {
    buffer = await renderDirectVaultDocumentPDFBuffer({
      title: payload.title || 'Document',
      type: payload.type || 'Document',
      userName: payload.userName || payload.employeeName || 'Employee',
      userEmail: payload.userEmail || '',
      uploadedBy: payload.uploadedBy || 'HR Administration',
    });
  } else {
    // Offer letter
    buffer = await renderDirectOfferLetterPDFBuffer(payload.type, payload.details as OfferDetails);
  }

  fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
  fs.writeFileSync(outputFilePath, buffer);
  console.log('PDF_GENERATED_SUCCESS:' + buffer.length);
}

main().catch((err) => {
  console.error('PDF_GENERATION_FAILED:', err);
  process.exit(1);
});
