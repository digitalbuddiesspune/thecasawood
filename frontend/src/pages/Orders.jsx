import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ordersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getDisplayOrderId } from '../utils/orderId'

const Orders = () => {
    const { isAuthenticated } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            if (!isAuthenticated) return;
            try {
                setLoading(true)
                const response = await ordersAPI.getMyOrders()
                if (response.data.success) {
                    setOrders(response.data.data)
                }
            } catch (error) {
                console.error('Error fetching orders:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [isAuthenticated])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
                <p className="text-gray-500 mb-6 text-center">Login to view your order history</p>
                <Link to="/login" className="px-8 py-3 bg-[#8b5e3c] text-white font-bold rounded-lg hover:bg-[#70482d] transition-colors shadow-lg">
                    Login
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
                    <Link to="/profile" className="text-sm font-medium text-[#8b5e3c] hover:underline">
                        Back to Profile
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
                        <p className="text-gray-500 mb-8">Looks like you haven't placed any orders yet.</p>
                        <Link to="/products" className="inline-block px-8 py-3 bg-[#8b5e3c] text-white font-bold rounded-lg hover:bg-[#70482d] transition-colors shadow-md hover:shadow-lg">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4 sm:gap-0">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide 
                                                    ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'}`}>
                                                    {order.orderStatus}
                                                </span>
                                                <span className="text-sm text-gray-500">Order #{getDisplayOrderId(order)}</span>
                                            </div>
                                            <p className="text-xs text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-lg font-bold text-gray-900">₹{(order.total || order.totalAmount || 0).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            {/* Preview Images (First 3) */}
                                            <div className="flex items-center gap-2 flex-1 w-full order-2 sm:order-1">
                                                {order.items.slice(0, 3).map((item, idx) => (
                                                    <div key={idx} className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center text-xs font-medium text-gray-500 border border-gray-200">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <Link
                                                to={`/order/${order._id}`}
                                                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#8b5e3c] hover:border-[#8b5e3c] transition-colors text-center order-1 sm:order-2"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders
