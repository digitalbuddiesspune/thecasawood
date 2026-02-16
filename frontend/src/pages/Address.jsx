import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addressesAPI, cartAPI, paymentAPI, ordersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Address = () => {
    // ==========================================
    // 1. Hooks & State Management
    // ==========================================
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()

    // Status States
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false) // For payment processing

    // Data States
    const [addresses, setAddresses] = useState([])
    const [cartData, setCartData] = useState(null)

    // UI Selection States
    const [selectedAddressId, setSelectedAddressId] = useState(null) // Renamed for clarity
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)

    // Form Data State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        pincode: '',
        address: '',
        locality: '',
        city: '',
        state: '',
        type: 'Home'
    })

    // ==========================================
    // 2. Data Fetching
    // ==========================================
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/')
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                const [addressRes, cartRes] = await Promise.all([
                    addressesAPI.getAll(),
                    cartAPI.get()
                ])

                if (addressRes.data.success) {
                    setAddresses(addressRes.data.data || [])
                    // Auto-select default address if user hasn't selected one
                    const defaultAddr = addressRes.data.data.find(a => a.isDefault) || addressRes.data.data[0]
                    if (defaultAddr) setSelectedAddressId(defaultAddr._id || defaultAddr.id)
                }

                if (cartRes.data.success) {
                    setCartData(cartRes.data.data)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [isAuthenticated, navigate])

    // ==========================================
    // 3. Address Form Handlers
    // ==========================================
    const [pincodeStatus, setPincodeStatus] = useState('initial') // initial, loading, valid, invalid
    const [pincodeError, setPincodeError] = useState('')

    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Pincode specific logic
        if (name === 'pincode') {
            // Only allow numbers
            if (!/^\d*$/.test(value)) return

            // Limit to 6 digits
            if (value.length > 6) return

            setFormData(prev => ({ ...prev, [name]: value }))

            // Verify when 6 digits
            if (value.length === 6) {
                verifyPincode(value)
            } else {
                setPincodeStatus('initial')
                setPincodeError('')
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const verifyPincode = async (code) => {
        try {
            setPincodeStatus('loading')
            setPincodeError('')

            const response = await fetch(`https://api.postalpincode.in/pincode/${code}`)
            const data = await response.json()

            if (data && data[0].Status === 'Success') {
                const details = data[0].PostOffice[0]
                setFormData(prev => ({
                    ...prev,
                    city: details.District,
                    state: details.State,
                    // Optional: country: details.Country
                }))
                setPincodeStatus('valid')
            } else {
                setPincodeStatus('invalid')
                setPincodeError('Invalid Pincode. Delivery not available.')
                // Reset city/state to force manual correction if needed, or keep for user to see
                setFormData(prev => ({ ...prev, city: '', state: '' }))
            }
        } catch (error) {
            console.error('Pincode lookup failed:', error)
            setPincodeStatus('initial') // Allow manual entry on API error? Or show warning.
            // Let's assume network error means we can't verify, user can maybe proceed manually?
            // Usually safest to say "Could not verify"
            setPincodeError('Could not verify pincode. Check connection.')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '', phone: '', pincode: '', address: '',
            locality: '', city: '', state: '', type: 'Home'
        })
        setPincodeStatus('initial')
        setPincodeError('')
        setEditingAddress(null)
        setShowAddressForm(false)
    }

    const handleAddressSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingAddress) {
                const response = await addressesAPI.update(editingAddress._id || editingAddress.id, formData)
                if (response.data.success) {
                    setAddresses(addresses.map(addr =>
                        addr._id === editingAddress._id ? response.data.data : addr
                    ))
                    resetForm()
                }
            } else {
                const response = await addressesAPI.create({
                    ...formData,
                    addressLine1: formData.address,
                    addressLine2: formData.locality
                })
                if (response.data.success) {
                    setAddresses([...addresses, response.data.data])
                    // Auto select the new address
                    setSelectedAddressId(response.data.data._id || response.data.data.id)
                    resetForm()
                }
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save address')
        }
    }

    const startEditing = (address) => {
        setFormData({
            name: address.name,
            phone: address.phone,
            pincode: address.pincode,
            address: address.addressLine1 || address.address,
            locality: address.addressLine2 || address.locality || '',
            city: address.city,
            state: address.state,
            type: address.type
        })
        setEditingAddress(address)
        setShowAddressForm(true)
    }

    const handleDeleteAddress = async (id, e) => {
        e.stopPropagation() // Prevent selecting the address when clicking delete
        if (!window.confirm('Are you sure you want to delete this address?')) return

        try {
            await addressesAPI.delete(id)
            setAddresses(addresses.filter(addr => (addr._id || addr.id) !== id))
            if (selectedAddressId === id) setSelectedAddressId(null)
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete address')
        }
    }

    // ==========================================
    // 4. Payment Handlers
    // ==========================================
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleOnlinePayment = async () => {
        if (!selectedAddressId) {
            alert('Please select a delivery address first')
            return
        }

        const isScriptLoaded = await loadRazorpayScript()
        if (!isScriptLoaded) {
            alert('Razorpay SDK failed to load. Please check your internet connection.')
            return
        }

        try {
            setProcessing(true)

            // Step 1: Create Order on Backend
            const { data: { key } } = await paymentAPI.getKey()
            const { data: orderData } = await paymentAPI.createOrder({
                shippingAddressId: selectedAddressId,
                billingAddressId: selectedAddressId
            })

            if (!orderData.success) throw new Error('Failed to create order')

            // Step 2: Initialize Razorpay
            const options = {
                key: key,
                amount: orderData.order.amount,
                currency: "INR",
                name: "The Casawood",
                description: "Furniture Purchase",
                image: "https://thecasawood.com/logo.png",
                order_id: orderData.order.id,
                handler: async function (response) {
                    try {
                        // Step 3: Verify Payment on Backend
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            shippingAddressId: selectedAddressId,
                            billingAddressId: selectedAddressId
                        }

                        const { data: result } = await paymentAPI.verify(verifyData)

                        if (result.success) {
                            window.dispatchEvent(new Event('cartUpdated'))
                            navigate(`/order-success/${result.data._id}`)
                        } else {
                            alert('Payment verification failed')
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error)
                        alert('Payment verification failed. Please contact support.')
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: { color: "#8b5e3c" },
                modal: {
                    ondismiss: () => {
                        alert('Payment cancelled')
                        setProcessing(false)
                    }
                }
            }

            const razorpayInstance = new window.Razorpay(options)
            razorpayInstance.open()

        } catch (error) {
            console.error('Payment initialization error:', error)
            alert(error.response?.data?.message || 'Payment initialization failed')
            setProcessing(false)
        }
    }

    const handleCODPayment = async () => {
        if (!selectedAddressId) {
            alert('Please select a delivery address first')
            return
        }

        try {
            setProcessing(true)
            const response = await ordersAPI.create({
                shippingAddressId: selectedAddressId,
                paymentMethod: 'COD'
            })

            if (response.data.success) {
                window.dispatchEvent(new Event('cartUpdated'))
                navigate(`/order-success/${response.data.data._id}`)
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to place order')
        } finally {
            setProcessing(false)
        }
    }

    // ==========================================
    // 5. Calculations
    // ==========================================
    const items = cartData?.items || []
    const subtotal = items.reduce((sum, item) => sum + ((item.product?.price || item.price) * item.quantity), 0)
    const deliveryCharges = subtotal > 50000 ? 0 : 500
    const totalAmount = subtotal + deliveryCharges

    // ==========================================
    // 6. Component Renders
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
            </div>
        )
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4">

                {/* Header / Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 mb-6 font-medium">
                    <Link to="/cart" className="hover:text-[#8b5e3c] transition-colors">Cart</Link>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900">Checkout</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Checkout Steps */}
                    <div className="flex-1 space-y-6">

                        {/* ---------------- STEP 1: ADDRESS ---------------- */}
                        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 bg-[#8b5e3c] text-white text-xs rounded-full">1</span>
                                    Select Delivery Address
                                </h2>
                                {!showAddressForm && (
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="text-[#8b5e3c] text-sm font-bold uppercase hover:underline"
                                    >
                                        + Add New Address
                                    </button>
                                )}
                            </div>

                            <div className="p-6">
                                {showAddressForm ? (
                                    // -------- FORM VIEW --------
                                    <form onSubmit={handleAddressSubmit} className="space-y-4 animate-fadeIn">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-medium text-gray-700">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                                            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">✕ Cancel</button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleInputChange} required className="input-field p-3 border rounded w-full focus:ring-1 focus:ring-[#8b5e3c] outline-none" />
                                            <input type="tel" name="phone" placeholder="Phone Number *" value={formData.phone} onChange={handleInputChange} required maxLength="10" className="input-field p-3 border rounded w-full focus:ring-1 focus:ring-[#8b5e3c] outline-none" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    placeholder="Pincode *"
                                                    value={formData.pincode}
                                                    onChange={handleInputChange}
                                                    required
                                                    maxLength="6"
                                                    className={`input-field p-3 border rounded w-full outline-none focus:ring-1 ${pincodeStatus === 'invalid' ? 'border-red-500 focus:ring-red-500' :
                                                        pincodeStatus === 'valid' ? 'border-green-500 focus:ring-green-500' :
                                                            'focus:ring-[#8b5e3c]'
                                                        }`}
                                                />
                                                {pincodeStatus === 'loading' && (
                                                    <div className="absolute right-3 top-3.5">
                                                        <svg className="animate-spin h-5 w-5 text-[#8b5e3c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    </div>
                                                )}
                                                {pincodeStatus === 'valid' && (
                                                    <div className="absolute right-3 top-3.5 text-green-500">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                )}
                                                {pincodeError && <p className="text-xs text-red-500 mt-1 absolute -bottom-5 left-0">{pincodeError}</p>}
                                            </div>
                                            <input type="text" name="locality" placeholder="Locality / Area *" value={formData.locality} onChange={handleInputChange} required className="input-field p-3 border rounded w-full focus:ring-1 focus:ring-[#8b5e3c] outline-none" />
                                        </div>

                                        <textarea name="address" placeholder="Address (House No, Building, Street) *" value={formData.address} onChange={handleInputChange} required rows="3" className="input-field p-3 border rounded w-full focus:ring-1 focus:ring-[#8b5e3c] outline-none resize-none" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" name="city" placeholder="City / District *" value={formData.city} onChange={handleInputChange} required className="input-field p-3 border rounded w-full focus:ring-1 focus:ring-[#8b5e3c] outline-none" />
                                            <input type="text" name="state" placeholder="State *" value={formData.state} onChange={handleInputChange} required className="input-field p-3 border rounded w-full focus:ring-1 focus:ring-[#8b5e3c] outline-none" />
                                        </div>

                                        <div className="flex gap-4 pt-2">
                                            <label className="flex items-center cursor-pointer">
                                                <input type="radio" name="type" value="Home" checked={formData.type === 'Home'} onChange={handleInputChange} className="text-[#8b5e3c] focus:ring-[#8b5e3c]" />
                                                <span className="ml-2 text-sm text-gray-700">Home</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input type="radio" name="type" value="Work" checked={formData.type === 'Work'} onChange={handleInputChange} className="text-[#8b5e3c] focus:ring-[#8b5e3c]" />
                                                <span className="ml-2 text-sm text-gray-700">Work</span>
                                            </label>
                                        </div>

                                        <button type="submit" className="w-full bg-[#8b5e3c] text-white font-bold py-3 rounded hover:bg-[#70482d] transition-colors mt-4">
                                            SAVE ADDRESS
                                        </button>
                                    </form>
                                ) : (
                                    // -------- LIST VIEW --------
                                    <div className="grid grid-cols-1 gap-4">
                                        {addresses.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <p>No addresses saved yet.</p>
                                                <button onClick={() => setShowAddressForm(true)} className="mt-2 text-[#8b5e3c] font-medium hover:underline">Add one now</button>
                                            </div>
                                        ) : (
                                            addresses.map(addr => {
                                                const addrId = addr._id || addr.id
                                                return (
                                                    <div
                                                        key={addrId}
                                                        onClick={() => setSelectedAddressId(addrId)}
                                                        className={`border rounded-lg p-4 cursor-pointer transition-all relative group ${selectedAddressId === addrId
                                                            ? 'border-[#8b5e3c] bg-[#8b5e3c]/5 shadow-sm ring-1 ring-[#8b5e3c]'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center ${selectedAddressId === addrId ? 'border-[#8b5e3c]' : 'border-gray-300'}`}>
                                                                {selectedAddressId === addrId && <div className="w-3 h-3 bg-[#8b5e3c] rounded-full" />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-semibold text-gray-800">{addr.name}</span>
                                                                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold uppercase rounded">{addr.type}</span>
                                                                    </div>
                                                                    {/* Edit/Delete Buttons (Visible on Hover/Selected) */}
                                                                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={(e) => { e.stopPropagation(); startEditing(addr); }} className="text-blue-600 text-sm hover:underline font-medium">Edit</button>
                                                                        <button onClick={(e) => handleDeleteAddress(addrId, e)} className="text-red-500 text-sm hover:underline font-medium">Delete</button>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                                    {addr.addressLine1 || addr.address}, {addr.addressLine2 && `${addr.addressLine2}, `}
                                                                    {addr.city}, {addr.state} - <span className="font-medium text-gray-800">{addr.pincode}</span>
                                                                </p>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    Mobile: <span className="font-medium text-gray-800">{addr.phone}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ---------------- STEP 2: PAYMENT ---------------- */}
                        <section className={`bg-white rounded-lg shadow-sm border border-gray-100 transition-opacity ${!selectedAddressId ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 bg-[#8b5e3c] text-white text-xs rounded-full">2</span>
                                    Payment Method
                                </h2>
                            </div>

                            <div className="p-6">
                                {!selectedAddressId && <p className="text-sm text-red-500 mb-4">* Select an address above to proceed</p>}

                                <div className="space-y-4">
                                    {/* Razorpay Option */}
                                    <div className="border border-gray-200 rounded-lg p-4 hover:border-[#8b5e3c] transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <input type="radio" name="payment" id="online" defaultChecked className="text-[#8b5e3c] focus:ring-[#8b5e3c] w-5 h-5" />
                                                <label htmlFor="online" className="font-semibold text-gray-800 cursor-pointer">Online Payment</label>
                                            </div>
                                            <div className="flex space-x-2">
                                                <img src="https://cdn.razorpay.com/static/assets/logo/payment_methods.svg" alt="Payment Methods" className="h-5 opacity-70" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-8 mb-4">Pay securely using Credit/Debit Card, UPI, NetBanking, or Wallets.</p>
                                        <button
                                            onClick={handleOnlinePayment}
                                            disabled={processing}
                                            className="w-full ml-8 max-w-sm bg-[#8b5e3c] text-white font-bold py-3 px-6 rounded hover:bg-[#70482d] transition-all shadow-md disabled:bg-gray-400"
                                        >
                                            {processing ? 'Processing...' : `PAY ₹${totalAmount.toLocaleString()} NOW`}
                                        </button>
                                    </div>

                                    <div className="relative flex py-2 items-center">
                                        <div className="flex-grow border-t border-gray-200"></div>
                                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">OR</span>
                                        <div className="flex-grow border-t border-gray-200"></div>
                                    </div>

                                    {/* COD Option */}
                                    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <input type="radio" name="payment" id="cod" className="text-[#8b5e3c] focus:ring-[#8b5e3c] w-5 h-5" />
                                            <label htmlFor="cod" className="font-semibold text-gray-800 cursor-pointer">Cash on Delivery</label>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-8 mb-4">Pay in cash when your order is delivered.</p>
                                        <button
                                            onClick={handleCODPayment}
                                            disabled={processing}
                                            className="w-full ml-8 max-w-sm border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded hover:bg-gray-50 transition-all disabled:opacity-50"
                                        >
                                            PLACE ORDER (COD)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sticky Summary */}
                    <div className="lg:w-96 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 sticky top-24">
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide">Order Summary</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Items ({items.length})</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery</span>
                                    <span className={deliveryCharges === 0 ? 'text-green-600 font-medium' : ''}>
                                        {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}
                                    </span>
                                </div>
                                <div className="border-t pt-4 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-xl font-bold text-[#8b5e3c]">₹{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 text-xs text-gray-500 text-center border-t border-gray-100 rounded-b-lg">
                                Safe & Secure Payment | 100% Authentic Products
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Address
