import { useEffect, useState } from 'react';
import { adminPaymentsAPI } from '../services/adminApi';
import { getDisplayOrderId } from '../../utils/orderId';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, selectedStatus, selectedMethod, searchQuery]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 15,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedMethod && { method: selectedMethod }),
      };
      const response = await adminPaymentsAPI.getAll(params);
      if (response.data.success) {
        setPayments(response.data.data.payments || []);
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusPill = (status) => {
    const value = (status || '').toLowerCase();
    if (value === 'paid') return 'bg-green-100 text-green-700';
    if (value === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (value === 'failed') return 'bg-red-100 text-red-700';
    if (value === 'refunded') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-500">Track payment details for all orders</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search order no / transaction id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
          >
            <option value="">All Methods</option>
            <option value="COD">COD</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="NetBanking">NetBanking</option>
            <option value="Wallet">Wallet</option>
            <option value="Online">Online</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-56">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8b5e3c]" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No payment records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gateway Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">{getDisplayOrderId(payment)}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{payment.customer?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{payment.customer?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">₹{(payment.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-4 text-gray-700">{payment.paymentMethod || '-'}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusPill(payment.paymentStatus)}`}>
                        {payment.paymentStatus || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{payment.transactionId || '-'}</td>
                    <td className="px-4 py-4 text-gray-700">{payment.gatewayOrderId || '-'}</td>
                    <td className="px-4 py-4 text-gray-600">{new Date(payment.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
