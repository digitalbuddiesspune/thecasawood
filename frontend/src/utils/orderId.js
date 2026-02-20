export const getDisplayOrderId = (order) => {
  if (order?.orderNumber && String(order.orderNumber).trim()) {
    return String(order.orderNumber).trim();
  }

  if (order?._id) {
    return `ORD-${String(order._id).slice(-8).toUpperCase()}`;
  }

  return 'ORD-NA';
};

