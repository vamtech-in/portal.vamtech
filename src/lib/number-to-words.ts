/**
 * Converts numbers into Indian currency word representation (Lakhs, Thousands, Hundreds)
 */
export function numberToWords(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n) || n === 0) return 'Zero Rupees';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const double = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(val: number): string {
    let str = '';
    if (val > 99) {
      str += single[Math.floor(val / 100)] + ' Hundred ';
      val %= 100;
    }
    if (val > 19) {
      str += tens[Math.floor(val / 10)] + ' ';
      val %= 10;
    }
    if (val > 9) {
      str += double[val - 10] + ' ';
      val = 0;
    }
    if (val > 0) {
      str += single[val] + ' ';
    }
    return str;
  }

  let amount = Math.floor(n);
  let result = '';

  if (amount >= 10000000) {
    const crore = Math.floor(amount / 10000000);
    result += convertChunk(crore) + 'Crore ';
    amount %= 10000000;
  }

  if (amount >= 100000) {
    const lakh = Math.floor(amount / 100000);
    result += convertChunk(lakh) + 'Lakh ';
    amount %= 100000;
  }

  if (amount >= 1000) {
    const thousand = Math.floor(amount / 1000);
    result += convertChunk(thousand) + 'Thousand ';
    amount %= 1000;
  }

  if (amount > 0) {
    result += convertChunk(amount);
  }

  return `${result.trim()} Rupees Only`;
}
