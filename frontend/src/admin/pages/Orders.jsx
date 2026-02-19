import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { adminOrdersAPI } from '../services/adminApi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  const paymentStatuses = [
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
  ];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, selectedStatus, selectedPayment, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedPayment && { paymentStatus: selectedPayment === 'unpaid' ? 'pending' : selectedPayment }),
        ...(searchQuery && { search: searchQuery }),
        ...(dateRange.from && { fromDate: dateRange.from }),
        ...(dateRange.to && { toDate: dateRange.to }),
      };
      const response = await adminOrdersAPI.getAll(params);
      if (response.data.success) {
        setOrders(response.data.data.orders || response.data.data);
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminOrdersAPI.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    const found = orderStatuses.find(s => s.value === status);
    return found?.color || 'bg-gray-100 text-gray-800';
  };

  const isPaid = (order) => order.paymentStatus === 'paid';
  const getPaymentStatusColor = (order) => isPaid(order) ? 'text-green-600' : 'text-red-600';

  const getExportParams = () => ({
    page: 1,
    limit: 10000,
    ...(selectedStatus && { status: selectedStatus }),
    ...(selectedPayment && { paymentStatus: selectedPayment === 'unpaid' ? 'pending' : selectedPayment }),
    ...(searchQuery && { search: searchQuery }),
    ...(dateRange.from && { fromDate: dateRange.from }),
    ...(dateRange.to && { toDate: dateRange.to }),
  });

  const handleDownloadXLS = async () => {
    try {
      setExporting(true);
      const params = getExportParams();
      const response = await adminOrdersAPI.getAll(params);
      const list = response.data.success
        ? (response.data.data.orders || response.data.data)
        : [];
      const rows = [
        [
          'Order ID',
          'Customer Name',
          'Email',
          'Phone',
          'Date & Time',
          'Items Count',
          'Total (₹)',
          'Payment Status',
          'Order Status',
          'Payment Method',
        ],
        ...list.map((order) => [
          order.orderNumber || order._id,
          order.user?.name || order.shippingAddress?.name || 'Guest',
          order.user?.email || '—',
          order.user?.phone || '—',
          order.createdAt
            ? new Date(order.createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—',
          order.items?.length ?? 0,
          order.total ?? 0,
          order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid',
          order.orderStatus ?? '—',
          order.paymentMethod || '—',
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');
      const fileName = `orders_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Export error:', err);
      alert(err.response?.data?.message || 'Failed to download orders');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500">Manage and track customer orders</p>
        </div>
        <button
          type="button"
          onClick={handleDownloadXLS}
          disabled={exporting || loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#8b5e3c] rounded-lg hover:bg-[#70482d] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download XLS
            </>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 text-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by order ID or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
          >
            <option value="">All Status</option>
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
          >
            <option value="">All Payments</option>
            {paymentStatuses.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & time</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-3">
                        <Link to={`/admin/orders/${order._id}`} className="text-[#8b5e3c] font-medium hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 lg:px-6 py-3">
                        <div>
                          <p className="text-gray-900">{order.user?.name || order.shippingAddress?.name || 'Guest'}</p>
                          <p className="text-gray-500">{order.user?.email || order.shippingAddress?.phone || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-gray-600">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-gray-900 font-medium">
                        ₹{order.total?.toLocaleString()}
                      </td>
                      <td className="px-4 lg:px-6 py-3">
                        <span className={`font-medium ${getPaymentStatusColor(order)}`}>
                          {isPaid(order) ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`px-2 py-1 rounded text-sm border-0 focus:ring-2 focus:ring-[#8b5e3c] ${getStatusColor(order.orderStatus)}`}
                        >
                          {orderStatuses.map((status) => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 lg:px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <p className="text-gray-500">Page {currentPage} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {orders.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-500">No orders found</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
