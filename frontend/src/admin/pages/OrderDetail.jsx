import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminOrdersAPI } from '../services/adminApi';
import { downloadInvoice } from '../../utils/invoice';
import { getDisplayOrderId } from '../../utils/orderId';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await adminOrdersAPI.getById(id);
      if (response.data.success) setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await adminOrdersAPI.updateStatus(id, newStatus);
      fetchOrder();
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await adminOrdersAPI.updatePaymentStatus(id, newStatus);
      await fetchOrder();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update payment status';
      alert(msg);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const found = orderStatuses.find((s) => s.value === status);
    return found?.color || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusMeta = (status) => {
    if (status === 'paid') return { label: 'Paid', className: 'bg-green-100 text-green-800 border-green-200' };
    if (status === 'refunded') return { label: 'Refunded', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (status === 'failed') return { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-200' };
    return { label: 'Unpaid', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  const getAddress = () => {
    const a = order?.shippingAddress;
    if (!a || typeof a !== 'object') return '—';
    const parts = [
      a.addressLine1,
      a.addressLine2,
      a.city,
      a.state && a.pincode ? `${a.state} - ${a.pincode}` : a.pincode,
      a.landmark,
    ].filter(Boolean);
    return parts.join(', ') || '—';
  };

  const timelineSteps = [
    { key: 'ordered', label: 'Ordered', date: order?.createdAt, done: true },
    { key: 'packed', label: 'Packed', date: order?.createdAt, done: !['pending'].includes(order?.orderStatus) },
    { key: 'shipped', label: 'Shipped', date: order?.deliveredOn, done: ['shipped', 'delivered'].includes(order?.orderStatus) },
    { key: 'delivered', label: 'Delivered', date: order?.deliveredOn, done: order?.orderStatus === 'delivered' },
    { key: 'cancelled', label: 'Cancelled', date: null, done: order?.orderStatus === 'cancelled' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 text-sm">
        <p className="text-gray-500">Order not found</p>
        <button onClick={() => navigate('/admin/orders')} className="mt-4 text-[#8b5e3c] hover:underline">
          Back to Orders
        </button>
      </div>
    );
  }

  const customerName = order.user?.name || order.shippingAddress?.name || 'Guest';
  const email = order.user?.email || order.shippingAddress?.email || 'N/A';
  const phone = order.user?.phone || order.shippingAddress?.phone || '—';
  const paymentStatusMeta = getPaymentStatusMeta(order.paymentStatus);

  return (
    <div className="space-y-6 text-sm">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </button>

      {/* Header: Order ID + Status dropdowns */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">#{getDisplayOrderId(order)}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => downloadInvoice(order)}
            className="px-3 py-1.5 rounded-full font-medium border border-[#8b5e3c] text-[#8b5e3c] hover:bg-[#8b5e3c] hover:text-white transition-colors"
          >
            Download Invoice
          </button>
          <select
            value={order.orderStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating || order.orderStatus === 'delivered'}
            className={`px-3 py-1.5 rounded-full font-medium border cursor-pointer ${getStatusColor(order.orderStatus)}`}
          >
            {orderStatuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={order.paymentStatus}
            onChange={(e) => handlePaymentStatusChange(e.target.value)}
            disabled={updating}
            className={`px-3 py-1.5 rounded-full font-medium border cursor-pointer ${paymentStatusMeta.className}`}
          >
            <option value="pending">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Customer & Shipping block */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><span className="text-gray-500">Date:</span> {formatDate(order.createdAt)}</p>
          <p><span className="text-gray-500">Payment:</span> {order.paymentMethod || 'COD'}</p>
          <p><span className="text-gray-500">Customer:</span> {customerName}</p>
          <p><span className="text-gray-500">Phone:</span> {phone}</p>
          <p><span className="text-gray-500">Email:</span> {email}</p>
          <p className="md:col-span-2"><span className="text-gray-500">Address:</span> {getAddress()}</p>
        </div>
      </div>

      {/* Order tracking timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Order tracking</h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-0">
          {timelineSteps.map((step, i) => (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px]">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs">{step.label.slice(0, 1)}</span>
                  )}
                </div>
                <span className="mt-1 text-xs font-medium text-gray-700">{step.label}</span>
                {step.date && step.done && (
                  <span className="text-xs text-gray-500 mt-0.5">{formatDate(step.date)}</span>
                )}
              </div>
              {i < timelineSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 sm:mx-2 min-w-[20px] ${step.done ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed information grid */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-500 uppercase text-xs">User ID</p>
            <p className="font-medium text-gray-900">{order.user?._id?.slice(-6) || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs">Display Order ID</p>
            <p className="font-medium text-gray-900">#{getDisplayOrderId(order)}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs">Customer name</p>
            <p className="font-medium text-[#8b5e3c]">{customerName}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs">Mobile</p>
            <p className="font-medium text-gray-900">{phone}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs">Email</p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs">Payment status</p>
            <span className={`inline-block px-2 py-0.5 rounded font-medium ${paymentStatusMeta.className}`}>
              {paymentStatusMeta.label}
            </span>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs">Order status</p>
            <span className={`inline-block px-2 py-0.5 rounded font-medium ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs">Payment mode</p>
            <p className="font-medium text-gray-900">{order.paymentMethod || 'COD'}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs">Order date & time</p>
            <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Order items table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Order items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || item.product?.image || '/placeholder.png'}
                        alt=""
                        className="w-10 h-10 object-cover rounded bg-gray-100"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name || item.product?.name}</p>
                        {item.variantName && <p className="text-gray-500 text-xs">{item.variantName}</p>}
                        {item.fabric && <p className="text-gray-500 text-xs">Fabric: {item.fabric}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-600">₹{item.price?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">—</td>
                  <td className="px-4 py-3 font-medium text-gray-900">₹{((item.price || 0) * (item.quantity || 0))?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t space-y-1">
          {order.subtotal != null && (
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>₹{order.subtotal?.toLocaleString()}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{order.discount?.toLocaleString()}</span>
            </div>
          )}
          {order.deliveryCharges != null && order.deliveryCharges > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery</span>
              <span>₹{order.deliveryCharges?.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>₹{order.total?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
