import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cartAPI, paymentAPI, ordersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Payment = () => {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [cartData, setCartData] = useState(null)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        if (!state?.addressId) {
            navigate('/address')
            return
        }

        fetchCart()
    }, [isAuthenticated, state, navigate])

    const fetchCart = async () => {
        try {
            setLoading(true)
            const response = await cartAPI.get()
            if (response.data.success) {
                setCartData(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching cart:', error)
            alert('Failed to load order details')
        } finally {
            setLoading(false)
        }
    }

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handlePayment = async () => {
        const res = await loadRazorpay()
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?')
            return
        }

        try {
            setProcessing(true)

            // 1. Create Order on Backend
            const { data: { key } } = await paymentAPI.getKey()
            const { data: orderData } = await paymentAPI.createOrder({
                shippingAddressId: state.addressId,
                billingAddressId: state.addressId
            })

            if (!orderData.success) {
                throw new Error('Failed to create order')
            }

            const options = {
                key: key,
                amount: orderData.order.amount,
                currency: "INR",
                name: "The Casawood",
                description: "Furniture Order Payment",
                image: "https://thecasawood.com/logo.png", // Replace with actual logo if available
                order_id: orderData.order.id,
                handler: async function (response) {
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            shippingAddressId: state.addressId,
                            billingAddressId: state.addressId
                        }

                        const { data: result } = await paymentAPI.verify(verifyData)

                        if (result.success) {
                            window.dispatchEvent(new Event('cartUpdated'))
                            navigate(`/order/${result.data._id}`)
                        } else {
                            alert('Payment verification failed')
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error)
                        alert('Payment verification failed: ' + (error.response?.data?.message || error.message))
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                notes: {
                    address: "Casawood Corporate Office"
                },
                theme: {
                    color: "#8b5e3c"
                },
                modal: {
                    ondismiss: function () {
                        alert('Payment cancelled');
                        setProcessing(false);
                    }
                }
            }

            const paymentObject = new window.Razorpay(options)
            paymentObject.open()

        } catch (error) {
            console.error('Payment error:', error)
            alert(error.response?.data?.message || 'Payment failed')
        } finally {
            setProcessing(false)
        }
    }

    const handleCOD = async () => {
        try {
            setProcessing(true)
            const response = await ordersAPI.create({
                shippingAddressId: state.addressId,
                paymentMethod: 'COD'
            })
            if (response.data.success) {
                // alert('Order Placed Successfully!')
                window.dispatchEvent(new Event('cartUpdated'))
                navigate(`/order/${response.data.data._id}`)
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to place order')
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
            </div>
        )
    }

    if (!cartData) return null

    // Calculate totals
    const items = cartData.items || []
    const subtotal = items.reduce((sum, item) => sum + ((item.product?.price || item.price) * item.quantity), 0)
    const deliveryCharges = subtotal > 50000 ? 0 : 500
    const total = subtotal + deliveryCharges

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Payment Method</h1>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Payment Options */}
                    <div className="flex-1 space-y-4">
                        <div className="bg-white p-6 rounded-sm shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Select Payment Option</h3>

                            <div className="space-y-4">
                                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-[#8b5e3c] bg-[#8b5e3c]/5">
                                    <input
                                        type="radio"
                                        name="payment"
                                        defaultChecked
                                        className="h-5 w-5 text-[#8b5e3c] focus:ring-[#8b5e3c]"
                                    />
                                    <div className="ml-4 flex-1">
                                        <span className="block font-medium text-gray-900">Online Payment (Razorpay)</span>
                                        <span className="block text-sm text-gray-500">Credit/Debit Card, NetBanking, UPI</span>
                                    </div>
                                    <img src="https://cdn.razorpay.com/static/assets/logo/payment_methods.svg" alt="Razorpay" className="h-6 opacity-70" />
                                </label>

                                <button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="w-full py-3 bg-[#5c4033] text-white font-bold uppercase rounded-sm hover:bg-[#3e2b22] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {processing ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
                                </button>
                            </div>
                        </div>

                        {/* COD Option */}
                        <div className="bg-white p-6 rounded-sm shadow-sm opacity-90">
                            <h3 className="text-lg font-semibold mb-4 text-gray-500">Other Options</h3>
                            <button
                                onClick={handleCOD}
                                disabled={processing}
                                className="w-full py-3 border-2 border-gray-300 text-gray-700 font-bold uppercase rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cash On Delivery
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full md:w-80 h-fit bg-white p-6 rounded-sm shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-wide mb-4">Order Summary</h3>

                        <div className="space-y-3 text-sm border-b border-gray-200 pb-4 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Items</span>
                                <span className="font-medium">{items.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery</span>
                                <span className="text-[#8b5e3c] font-medium">{deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-lg font-bold">
                            <span>Total Payable</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Payment
