import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ordersAPI } from '../services/api'

const OrderDetail = () => {
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await ordersAPI.getById(id)
                if (response.data.success) {
                    setOrder(response.data.data)
                }
            } catch (error) {
                console.error('Error fetching order:', error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchOrder()
        }
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
                    <Link to="/" className="text-[#8b5e3c] hover:underline">Return Home</Link>
                </div>
            </div>
        )
    }

    const { shippingAddress, items, paymentInfo, paymentMethod } = order

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-gray-500 text-sm mt-1">Order ID: {order.orderNumber || order._id}</p>
                    </div>

                    <div className="flex gap-3">
                        {order.paymentStatus === 'paid' ? (
                            <span className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-full text-sm">
                                Paid Successfully
                            </span>
                        ) : (
                            <span className="px-4 py-2 bg-yellow-100 text-yellow-700 font-medium rounded-full text-sm">
                                Payment Pending
                            </span>
                        )}
                        <Link to="/products" className="px-4 py-2 bg-[#8b5e3c] text-white rounded-lg hover:bg-[#70482d] transition-colors text-sm font-medium">
                            Continue Shopping
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Items & Status */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="font-semibold text-gray-900">Order Items ({items.length})</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {items.map((item, index) => (
                                    <div key={index} className="p-6 flex gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>

                                            {/* Configuration Details */}
                                            {/* Configuration Details */}
                                            <div className="text-sm text-gray-600 space-y-1 mb-2 bg-gray-50 p-2 rounded-md border border-gray-100">
                                                {item.variantName && (
                                                    <div className="flex gap-2">
                                                        <span className="font-medium text-gray-500 min-w-[80px]">Variant:</span>
                                                        <span className="font-semibold text-gray-900">{item.variantName}</span>
                                                    </div>
                                                )}
                                                {item.fabric && (
                                                    <div className="flex gap-2">
                                                        <span className="font-medium text-gray-500 min-w-[80px]">Fabric:</span>
                                                        <span className="font-semibold text-gray-900">{item.fabric}</span>
                                                    </div>
                                                )}
                                                {(item.colorCode || item.colorData) && (
                                                    <div className="flex gap-2 items-center">
                                                        <span className="font-medium text-gray-500 min-w-[80px]">Color:</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-900">
                                                                {item.colorData?.name || item.colorCode || 'Custom'}
                                                            </span>
                                                            {item.colorData?.color && (
                                                                <span
                                                                    className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                                                    style={{ backgroundColor: item.colorData.color }}
                                                                    title={item.colorData.name}
                                                                ></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-500 mb-2">Quantity: {item.quantity}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₹{Math.round(item.price * 1.25).toLocaleString()}
                                                </span>
                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                    25% OFF
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Track Order Status */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#8b5e3c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Order Status
                            </h2>

                            {/* Simplified Status Stepper */}
                            <div className="relative pl-4 md:pl-0 mt-8 mb-4">
                                {/* Desktop Line */}
                                <div className="hidden md:block absolute top-[11px] left-0 w-full h-[2px] bg-gray-200 -z-10"></div>
                                {/* Mobile Line */}
                                <div className="md:hidden absolute left-[11px] top-0 h-full w-[2px] bg-gray-200 -z-10"></div>

                                <div className="flex flex-col md:flex-row justify-between h-full gap-8 md:gap-0">
                                    {[
                                        { key: 'confirmed', label: 'Ordered', date: order.createdAt },
                                        { key: 'processing', label: 'Processing', date: null }, // Usually no specific date for processing start visible to user
                                        { key: 'shipped', label: 'Shipped', date: null },
                                        { key: 'delivered', label: 'Delivered', date: order.deliveredOn || order.estimatedDelivery }
                                    ].map((step, i) => {
                                        // Status Logic
                                        const currentStatus = (order.orderStatus || 'confirmed').toLowerCase();
                                        const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

                                        // Find indices
                                        const currentIdx = statusOrder.indexOf(currentStatus === 'ordered' ? 'confirmed' : currentStatus);
                                        const stepIdx = statusOrder.indexOf(step.key);

                                        const isCompleted = currentIdx > stepIdx;
                                        const isCurrent = currentIdx === stepIdx;
                                        const isUpcoming = currentIdx < stepIdx;

                                        return (
                                            <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-2">
                                                {/* Dot/Indicator */}
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white z-10 
                                                    ${(isCompleted || isCurrent) ? 'border-[#8b5e3c]' : 'border-gray-300'}`}>

                                                    {isCompleted && (
                                                        <div className="w-3 h-3 bg-[#8b5e3c] rounded-full"></div>
                                                    )}
                                                    {isCurrent && (
                                                        <div className="w-3 h-3 bg-[#8b5e3c] rounded-full animate-pulse"></div>
                                                    )}
                                                    {isUpcoming && (
                                                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                                    )}
                                                </div>

                                                {/* Text Info */}
                                                <div className="md:text-center">
                                                    <p className={`text-sm font-bold ${isUpcoming ? 'text-gray-400' : 'text-gray-900'}`}>
                                                        {step.label}
                                                    </p>
                                                    {step.date && (isCompleted || isCurrent || step.key === 'delivered') && (
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {new Date(step.date).toLocaleDateString('en-IN', {
                                                                day: 'numeric', month: 'short'
                                                            })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Tracking Number or Extra Info */}
                            {order.trackingNumber && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-600">
                                        Tracking Number: <span className="font-medium text-gray-900 ml-1">{order.trackingNumber}</span>
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Right Column: Address & Payment */}
                    <div className="space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Shipping Address</h2>
                            <h3 className="font-medium text-gray-900">{shippingAddress?.name}</h3>
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                {shippingAddress?.addressLine1}<br />
                                {shippingAddress?.addressLine2 && <>{shippingAddress.addressLine2}<br /></>}
                                {shippingAddress?.city}, {shippingAddress?.state} - {shippingAddress?.pincode}
                            </p>
                            <p className="text-sm text-gray-600 mt-2 font-medium">
                                Phone: {shippingAddress?.phone}
                            </p>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Payment Details</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment Method</span>
                                    <span className="font-medium text-gray-900">{paymentMethod === 'Online' ? 'Razorpay' : paymentMethod}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment Status</span>
                                    <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                        {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                                {paymentInfo?.razorpayPaymentId && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Transaction ID</span>
                                        <span className="font-medium text-gray-900 font-mono text-xs">{paymentInfo.razorpayPaymentId}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Order Summary</h2>
                            <div className="space-y-3 pb-3 border-b border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{order.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="font-medium text-green-600">-₹{order.discount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery Charges</span>
                                    <span className="font-medium text-gray-900">
                                        {order.deliveryCharges === 0 ? <span className="text-green-600">Free</span> : `₹${order.deliveryCharges}`}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-3">
                                <span className="font-bold text-gray-900">Total Amount</span>
                                <span className="font-bold text-xl text-[#8b5e3c]">₹{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetail
