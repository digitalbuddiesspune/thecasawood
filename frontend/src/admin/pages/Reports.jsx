import { useState, useEffect } from 'react';
import { adminReportsAPI } from '../services/adminApi';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
  });

  const tabs = [
    { id: 'sales', label: 'Sales Report' },
    { id: 'products', label: 'Product Report' },
    { id: 'users', label: 'User Activity' },
    { id: 'revenue', label: 'Revenue Analysis' },
  ];

  useEffect(() => {
    fetchReportData();
  }, [activeTab, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = {
        fromDate: dateRange.from,
        toDate: dateRange.to,
      };

      if (activeTab === 'sales') {
        const response = await adminReportsAPI.getSalesReport(params);
        if (response.data.success) {
          setSalesData(response.data.data.dailySales || []);
          const s = response.data.data.summary;
          if (s) setSummary({ totalSales: s.totalSales ?? 0, totalOrders: s.totalOrders ?? 0, averageOrderValue: s.averageOrderValue ?? 0, totalCustomers: s.totalCustomers ?? 0 });
        }
      } else if (activeTab === 'products') {
        const response = await adminReportsAPI.getProductReport(params);
        if (response.data.success) {
          setProductData(response.data.data || []);
        }
      } else if (activeTab === 'users') {
        const response = await adminReportsAPI.getUserReport(params);
        if (response.data.success) {
          setUserActivityData(response.data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      if (activeTab === 'sales') {
        setSalesData([]);
      } else if (activeTab === 'products') {
        setProductData([]);
      } else if (activeTab === 'users') {
        setUserActivityData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export endpoint not implemented on backend yet
    alert('Report export (CSV/PDF) is not available yet. Use the date range and tabs to view data.');
  };

  // Simple Bar Chart Component
  const BarChart = ({ data, labelKey, valueKey, label }) => {
    const maxValue = Math.max(...data.map(d => d[valueKey]), 1);
    
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-24 text-sm text-gray-600 truncate">
              {item[labelKey]}
            </div>
            <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8b5e3c] to-[#a67c52] rounded-full transition-all duration-300"
                style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
              />
            </div>
            <div className="w-24 text-sm font-medium text-gray-800 text-right">
              {typeof item[valueKey] === 'number' && item[valueKey] > 1000 
                ? `₹${item[valueKey].toLocaleString()}`
                : item[valueKey]}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-500">Analyze your store performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 text-sm bg-[#8b5e3c] text-white rounded-lg hover:bg-[#70482d]"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="text-sm text-gray-600">Date Range:</span>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
          />
          <button
            onClick={fetchReportData}
            className="px-4 py-2 bg-[#8b5e3c] text-white rounded-lg hover:bg-[#70482d]"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-gray-800">₹{summary.totalSales?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Average Order Value</p>
          <p className="text-2xl font-bold text-gray-800">₹{summary.averageOrderValue?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalCustomers}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#8b5e3c] text-[#8b5e3c]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
            </div>
          ) : (
            <>
              {/* Sales Report */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Daily Sales Overview</h3>
                  <div className="h-80">
                    <div className="flex items-end gap-4 h-64 border-b border-gray-200 pb-4">
                      {salesData.map((item, index) => {
                        const maxSales = Math.max(...salesData.map(d => d.sales), 1);
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <span className="text-xs text-gray-500 mb-2">
                              ₹{(item.sales / 1000).toFixed(0)}K
                            </span>
                            <div
                              className="w-full bg-gradient-to-t from-[#8b5e3c] to-[#a67c52] rounded-t-lg transition-all duration-300 hover:from-[#70482d]"
                              style={{ height: `${(item.sales / maxSales) * 200}px`, minHeight: '4px' }}
                            />
                            <span className="text-xs text-gray-500 mt-2">
                              {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Sales Table */}
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full min-w-[280px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {salesData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(item.date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800">{item.orders}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                              ₹{item.sales?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Product Report */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Top Selling Products</h3>
                  <BarChart
                    data={productData}
                    labelKey="name"
                    valueKey="revenue"
                    label="Revenue"
                  />
                  
                  {/* Product Table (API returns name, sales, revenue; category not from API) */}
                  <div className="overflow-x-auto -mx-2 mt-8">
                    <table className="w-full min-w-[320px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {productData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">{item.sales}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                              ₹{item.revenue?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* User Activity */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">User Activity Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <p className="text-sm text-blue-600">New Users (Period)</p>
                      <p className="text-3xl font-bold text-blue-800">
                        {userActivityData.reduce((sum, d) => sum + (d.newUsers || 0), 0)}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6">
                      <p className="text-sm text-green-600">Avg. Active Users/Day</p>
                      <p className="text-3xl font-bold text-green-800">
                        {Math.round(userActivityData.reduce((sum, d) => sum + (d.activeUsers || 0), 0) / (userActivityData.length || 1))}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6">
                      <p className="text-sm text-purple-600">Orders (Period)</p>
                      <p className="text-3xl font-bold text-purple-800">
                        {userActivityData.reduce((sum, d) => sum + (d.orders || 0), 0)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Activity Table */}
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full min-w-[280px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Users</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {userActivityData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(item.date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800">{item.newUsers}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">{item.activeUsers}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">{item.orders}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Revenue Analysis */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Revenue Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-medium text-gray-800 mb-4">Revenue by Category</h4>
                      <div className="space-y-4">
                        {[
                          { category: 'Beds', revenue: 180000, percentage: 35 },
                          { category: 'Sofas', revenue: 150000, percentage: 28 },
                          { category: 'Dining', revenue: 100000, percentage: 20 },
                          { category: 'Tables', revenue: 50000, percentage: 10 },
                          { category: 'Chairs', revenue: 36000, percentage: 7 },
                        ].map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">{item.category}</span>
                              <span className="font-medium text-gray-800">₹{item.revenue.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#8b5e3c] rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-medium text-gray-800 mb-4">Monthly Comparison</h4>
                      <div className="space-y-4">
                        {[
                          { month: 'January 2026', revenue: 516000, growth: 12 },
                          { month: 'December 2025', revenue: 461000, growth: 8 },
                          { month: 'November 2025', revenue: 427000, growth: 15 },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800">{item.month}</p>
                              <p className="text-sm text-gray-500">₹{item.revenue.toLocaleString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              item.growth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.growth > 0 ? '+' : ''}{item.growth}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
