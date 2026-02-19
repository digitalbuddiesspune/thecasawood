const STORE_INFO = {
  name: 'THECASAWOOD',
  tagline: 'Premium Wooden Furniture',
  location: 'Pune, Maharashtra, India',
  email: 'support@thecasawood.com',
  phone: '+91 98765 43210',
};

const GST_RATE = 0.18;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const safe = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const toWordsUnder1000 = (n) => {
    let str = '';
    if (n >= 100) {
      str += `${ones[Math.floor(n / 100)]} Hundred `;
      n %= 100;
    }
    if (n >= 20) {
      str += `${tens[Math.floor(n / 10)]} `;
      n %= 10;
    } else if (n >= 10) {
      str += `${teens[n - 10]} `;
      n = 0;
    }
    if (n > 0) str += `${ones[n]} `;
    return str.trim();
  };

  if (!num || num <= 0) return 'Zero';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;
  const parts = [];

  if (crore) parts.push(`${toWordsUnder1000(crore)} Crore`);
  if (lakh) parts.push(`${toWordsUnder1000(lakh)} Lakh`);
  if (thousand) parts.push(`${toWordsUnder1000(thousand)} Thousand`);
  if (rest) parts.push(toWordsUnder1000(rest));

  return parts.join(' ').trim();
};

export const downloadInvoice = (order) => {
  if (!order) return;

  const orderId = order.orderNumber || order._id || '-';
  const invoiceNo = `INV-${orderId}`;
  const orderDate = order.createdAt;
  const invoiceDate = new Date();
  const transactionId =
    order.paymentInfo?.razorpayPaymentId ||
    order.paymentInfo?.transactionId ||
    '-';

  const items = Array.isArray(order.items) ? order.items : [];
  const shippingAddress = order.shippingAddress || {};
  const customerName = order.user?.name || shippingAddress.name || 'Customer';
  const customerPhone = shippingAddress.phone || order.user?.phone || '-';
  const customerEmail = order.user?.email || shippingAddress.email || '-';
  const customerAddress = [
    shippingAddress.addressLine1,
    shippingAddress.addressLine2,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount || 0);
  const deliveryCharges = Number(order.deliveryCharges || 0);
  const total = Number(order.total || 0);
  const taxableValue = subtotal / (1 + GST_RATE);
  const gstAmount = subtotal - taxableValue;
  const sgst = gstAmount / 2;
  const cgst = gstAmount / 2;

  const rows = items
    .map((item, index) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.price || 0);
      const lineTotal = qty * rate;
      const lineTaxable = lineTotal / (1 + GST_RATE);
      const lineGst = lineTotal - lineTaxable;
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${safe(item.name || item.product?.name || 'Item')}</td>
          <td>${qty}</td>
          <td>${formatMoney(rate)}</td>
          <td>${formatMoney(lineTaxable)}</td>
          <td>18%</td>
          <td>${formatMoney(lineGst)}</td>
          <td>${formatMoney(lineTotal)}</td>
        </tr>
      `;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${safe(invoiceNo)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1f2937; margin: 24px; }
      h1, h2, h3, p { margin: 0; }
      .center { text-align: center; }
      .top-title { font-size: 30px; color: #8b5e3c; font-weight: 800; letter-spacing: 1px; }
      .muted { color: #4b5563; font-size: 13px; }
      .section { margin-top: 16px; border: 1px solid #d1d5db; }
      .section-title { background: #111827; color: #fff; font-weight: 700; padding: 8px 10px; font-size: 14px; }
      .meta-grid { width: 100%; border-collapse: collapse; }
      .meta-grid td { border: 1px solid #d1d5db; padding: 7px 10px; font-size: 13px; }
      .meta-grid td:first-child { width: 240px; color: #4b5563; }
      .items-table { width: 100%; border-collapse: collapse; }
      .items-table th, .items-table td { border: 1px solid #d1d5db; padding: 7px; font-size: 13px; text-align: left; }
      .items-table th { background: #f3f4f6; font-weight: 700; }
      .items-table td:nth-child(1), .items-table td:nth-child(3), .items-table td:nth-child(6) { text-align: center; }
      .totals { width: 420px; margin-left: auto; margin-top: 12px; border-collapse: collapse; }
      .totals td { border: 1px solid #d1d5db; padding: 7px 10px; font-size: 13px; }
      .totals tr:last-child td { background: #111827; color: #fff; font-size: 18px; font-weight: 700; }
      .words { margin-top: 14px; font-size: 14px; }
      @media print { body { margin: 10mm; } }
    </style>
  </head>
  <body>
    <div class="center">
      <div class="top-title">${safe(STORE_INFO.name)}</div>
      <div style="font-size: 24px; font-weight: 800; margin-top: 6px;">TAX INVOICE</div>
      <p class="muted" style="margin-top: 6px;">
        ${safe(STORE_INFO.tagline)} | ${safe(STORE_INFO.location)} | Email: ${safe(STORE_INFO.email)} | Phone: ${safe(STORE_INFO.phone)}
      </p>
    </div>

    <div class="section">
      <div class="section-title">Invoice Details</div>
      <table class="meta-grid">
        <tr><td>Invoice No</td><td><b>${safe(invoiceNo)}</b></td></tr>
        <tr><td>Order ID</td><td><b>${safe(orderId)}</b></td></tr>
        <tr><td>Order Date</td><td>${formatDate(orderDate)}</td></tr>
        <tr><td>Invoice Date</td><td>${formatDate(invoiceDate)}</td></tr>
        <tr><td>Order Date & Time</td><td>${formatDateTime(orderDate)}</td></tr>
        <tr><td>Order Status</td><td>${safe(order.orderStatus || '-')}</td></tr>
        <tr><td>Payment Method</td><td>${safe(order.paymentMethod || '-')}</td></tr>
        <tr><td>Payment Status</td><td>${safe(order.paymentStatus || '-')}</td></tr>
        <tr><td>Transaction ID</td><td>${safe(transactionId)}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Bill To</div>
      <div style="padding: 10px; font-size: 13px; line-height: 1.5;">
        <div><b>Name:</b> ${safe(customerName)}</div>
        <div><b>Phone:</b> ${safe(customerPhone)}</div>
        <div><b>Email:</b> ${safe(customerEmail)}</div>
        <div><b>Address:</b> ${safe(customerAddress || '-')}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Order Details</div>
      <table class="items-table">
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Item Name</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Taxable Value</th>
            <th>GST %</th>
            <th>GST Amount</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="8">No items</td></tr>'}
        </tbody>
      </table>
    </div>

    <table class="totals">
      <tr><td>Sub Total (incl. GST)</td><td>${formatMoney(subtotal)}</td></tr>
      <tr><td>Taxable Value</td><td>${formatMoney(taxableValue)}</td></tr>
      <tr><td>SGST (9%)</td><td>${formatMoney(sgst)}</td></tr>
      <tr><td>CGST (9%)</td><td>${formatMoney(cgst)}</td></tr>
      <tr><td>Discount</td><td>- ${formatMoney(discount)}</td></tr>
      <tr><td>Shipping Charges</td><td>${formatMoney(deliveryCharges)}</td></tr>
      <tr><td>Total Amount</td><td>${formatMoney(total)}</td></tr>
    </table>

    <div class="words">
      <b>Amount in Words:</b> ${safe(numberToWords(Math.round(total)))} Rupees Only
    </div>
  </body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
    alert('Popup blocked. Please allow popups to download invoice.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
};

