import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const STORE_INFO = {
  name: 'THECASAWOOD',
  tagline: 'Premium Wooden Furniture',
  location: 'Nagpur, Maharashtra, India',
  email: 'support@thecasawood.com',
  phone: '9156746451',
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

const formatMoney = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getDisplayOrderId = (order) => {
  if (order?.orderNumber && String(order.orderNumber).trim()) {
    return String(order.orderNumber).trim();
  }

  if (order?._id) {
    return `ORD-${String(order._id).slice(-8).toUpperCase()}`;
  }

  return 'ORD-NA';
};

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

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 40;
  const right = pageWidth - 40;
  const contentWidth = right - left;

  const orderId = getDisplayOrderId(order);
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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(139, 94, 60);
  doc.text(STORE_INFO.name, pageWidth / 2, 44, { align: 'center' });

  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text('TAX INVOICE', pageWidth / 2, 68, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(
    `${STORE_INFO.tagline} | ${STORE_INFO.location} | Email: ${STORE_INFO.email} | Phone: ${STORE_INFO.phone}`,
    pageWidth / 2,
    86,
    { align: 'center' }
  );

  autoTable(doc, {
    startY: 102,
    head: [['Invoice Details', '']],
    body: [
      ['Invoice No', invoiceNo],
      ['Order ID', orderId],
      ['Invoice Date', formatDate(invoiceDate)],
      ['Order Date & Time', formatDateTime(orderDate)],
      ['Order Status', order.orderStatus || '-'],
      ['Payment Method', order.paymentMethod || '-'],
      ['Payment Status', order.paymentStatus || '-'],
      ['Transaction ID', transactionId],
    ],
    theme: 'grid',
    margin: { left, right: 40 },
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: contentWidth - 180 } },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 12,
    head: [['Bill To']],
    body: [[
      `Name: ${customerName}\nPhone: ${customerPhone}\nEmail: ${customerEmail}\nAddress: ${customerAddress || '-'}`
    ]],
    theme: 'grid',
    margin: { left, right: 40 },
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
  });

  const itemRows = items.length
    ? items.map((item, index) => {
        const qty = Number(item.quantity || 0);
        const rate = Number(item.price || 0);
        const lineTotal = qty * rate;
        const lineTaxable = lineTotal / (1 + GST_RATE);
        const lineGst = lineTotal - lineTaxable;
        return [
          String(index + 1),
          item.name || item.product?.name || 'Item',
          String(qty),
          formatMoney(rate),
          formatMoney(lineTaxable),
          '18%',
          formatMoney(lineGst),
          formatMoney(lineTotal),
        ];
      })
    : [['-', 'No items', '-', '-', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 12,
    head: [['Sr No', 'Item Name', 'Qty', 'Rate', 'Taxable Value', 'GST %', 'GST Amount', 'Amount']],
    body: itemRows,
    theme: 'grid',
    margin: { left, right: 40 },
    styles: { fontSize: 9.5, cellPadding: 5 },
    headStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 130 },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 60 },
      4: { cellWidth: 80 },
      5: { cellWidth: 40, halign: 'center' },
      6: { cellWidth: 70 },
      7: { cellWidth: 70 },
    },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    body: [
      ['Sub Total (incl. GST)', formatMoney(subtotal)],
      ['Taxable Value', formatMoney(taxableValue)],
      ['SGST (9%)', formatMoney(sgst)],
      ['CGST (9%)', formatMoney(cgst)],
      ['Discount', `- ${formatMoney(discount)}`],
      ['Shipping Charges', formatMoney(deliveryCharges)],
      ['Total Amount', formatMoney(total)],
    ],
    theme: 'grid',
    margin: { left: pageWidth - 320, right: 40 },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 100, halign: 'right' } },
    didParseCell: (data) => {
      if (data.row.index === 6) {
        data.cell.styles.fillColor = [17, 24, 39];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const wordsY = doc.lastAutoTable.finalY + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('Amount in Words:', left, wordsY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${numberToWords(Math.round(total))} Rupees Only`, left + 95, wordsY);

  doc.save(`${invoiceNo}.pdf`);
};

