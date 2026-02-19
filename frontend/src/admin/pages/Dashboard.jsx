import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/adminApi';

// Stats Card Component
const StatsCard = ({ title, value, icon, trend, trendValue, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {trendValue}
            </p>
          )}
        </div>
        <div className={`w-14 h-14 ${colorClasses[color]} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Monthly bar chart: order count (bar height) + sum of orders (label) per month
const MonthlyOrdersChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];
  const maxCount = safeData.length ? Math.max(...safeData.map((d) => d.orderCount), 1) : 1;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Monthly order count & revenue</h3>
      <div className="flex items-end justify-around gap-1 h-56">
        {safeData.map((item, index) => (
          <div key={index} className="flex-1 min-w-0 flex flex-col items-center">
            <span className="text-xs text-gray-600 font-medium mb-0.5">
              ₹{(item.totalAmount / 1000).toFixed(0)}k
            </span>
            <div
              className="w-full max-w-[36px] mx-auto bg-[#8b5e3c] rounded-t transition-all hover:opacity-90"
              style={{
                height: `${(item.orderCount / maxCount) * 160}px`,
                minHeight: item.orderCount ? '4px' : 0,
              }}
              title={`${item.orderCount} orders · ₹${item.totalAmount?.toLocaleString()}`}
            />
            <span className="text-xs text-gray-500 mt-1">{item.orderCount}</span>
            <span className="text-xs text-gray-400 truncate w-full text-center mt-0.5">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-3 text-center">
        Bar = order count · Top label = revenue (₹)
      </p>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayConfirmedOrders: 0,
    todayCancelledOrders: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getSalesChart('monthly'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (chartRes.data.success) setChartData(chartRes.data.data || []);

      const recentOrdersRes = await dashboardAPI.getRecentOrders();
      if (recentOrdersRes.data.success) setRecentOrders(recentOrdersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid - Today's orders only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Today's Orders"
          value={stats.todayOrders?.toLocaleString() ?? '0'}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatsCard
          title="Today's Confirmed Orders"
          value={stats.todayConfirmedOrders?.toLocaleString() ?? '0'}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Today's Cancelled Orders"
          value={stats.todayCancelledOrders?.toLocaleString() ?? '0'}
          color="orange"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Monthly bar chart */}
      <MonthlyOrdersChart data={chartData} />

      {/* Today's Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Today's Recent Orders</h3>
          <Link to="/admin/orders" className="text-sm text-[#8b5e3c] font-medium hover:text-[#70482d]">
            View All Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
            No orders found for today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber || order._id}</td>
                    <td className="px-4 py-3 text-gray-700">{order.user?.name || 'Guest'}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(order.createdAt).toLocaleTimeString()}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{(order.total || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{order.orderStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
