import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Cart = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [cartItems, setCartItems] = useState([])
    const [savedForLater, setSavedForLater] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch cart from API
    useEffect(() => {
        // Fetch cart when component mounts (or auth state changes)
        // Removed explicit auth check to support guest cart

        const fetchCart = async () => {
            try {
                setLoading(true)
                const response = await cartAPI.get()
                if (response.data.success) {
                    // Handle both response formats
                    const items = response.data.data?.items || response.data.data || []
                    const saved = response.data.data?.savedForLater || []
                    setCartItems(items)
                    setSavedForLater(saved)
                }
            } catch (error) {
                console.error('Error fetching cart:', error)
                setCartItems([])
                setSavedForLater([])
            } finally {
                setLoading(false)
            }
        }

        fetchCart()
    }, [isAuthenticated])

    const updateQuantity = async (itemId, change) => {
        if (!itemId) {
            console.error('Invalid item ID')
            return
        }

        try {
            const item = cartItems.find(i => (i._id || i.id) === itemId)
            if (!item) return

            const newQuantity = Math.max(1, item.quantity + change)
            const response = await cartAPI.update(itemId, { quantity: newQuantity })
            if (response.data.success) {
                const items = response.data.data?.items || response.data.data || []
                setCartItems(items)
                // Trigger cart update event
                window.dispatchEvent(new Event('cartUpdated'))
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update quantity')
        }
    }

    const removeItem = async (itemId) => {
        if (!itemId) {
            console.error('Invalid item ID')
            return
        }

        try {
            const response = await cartAPI.remove(itemId)
            if (response.data.success) {
                const items = response.data.data?.items || response.data.data || []
                setCartItems(items)
                // Trigger cart update event
                window.dispatchEvent(new Event('cartUpdated'))
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to remove item')
        }
    }

    const saveForLater = async (itemId) => {
        try {
            const response = await cartAPI.saveForLater(itemId)
            if (response.data.success) {
                setCartItems(response.data.data.items || [])
                setSavedForLater(response.data.data.savedForLater || [])
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save for later')
        }
    }

    const moveToCart = async (itemId) => {
        try {
            const response = await cartAPI.moveToCart(itemId)
            if (response.data.success) {
                setCartItems(response.data.data.items || [])
                setSavedForLater(response.data.data.savedForLater || [])
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to move to cart')
        }
    }

    const subtotal = cartItems.reduce((sum, item) => {
        const product = item.product
        return sum + ((product?.price || item.price) * item.quantity)
    }, 0)

    const discount = cartItems.reduce((sum, item) => {
        const product = item.product
        // Force 25% logic
        const price = product?.price || item.price
        const originalPrice = Math.round(price * 1.25)
        return sum + ((originalPrice - price) * item.quantity)
    }, 0)

    const deliveryCharges = subtotal > 50000 ? 0 : 500
    const total = subtotal + deliveryCharges

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
            </div>
        )
    }

    // Removed login prompt - Guests can view cart now
    // if (!isAuthenticated) { ... }

    if (cartItems.length === 0 && savedForLater.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
                <div className="text-center max-w-md px-4">
                    <div className="mb-6">
                        <svg className="w-32 h-32 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h2>
                    <p className="text-gray-500 mb-6">Add items to your cart to get started</p>
                    <Link
                        to="/products"
                        className="inline-block px-8 py-3 bg-[#8b5e3c] text-white font-semibold rounded-lg hover:bg-[#70482d] transition-colors shadow-md hover:shadow-lg"
                    >
                        Shop Now
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-100 min-h-screen py-4 md:py-6">
            <div className="max-w-[1400px] mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Left Column - Cart Items */}
                    <div className="flex-1">
                        {/* Cart Items */}
                        {cartItems.length > 0 && (
                            <div className="bg-white rounded-sm shadow-sm mb-4">
                                <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        My Cart ({cartItems.length})
                                    </h2>
                                    <Link to="/products" className="text-sm text-[#8b5e3c] font-medium hover:text-[#70482d]">
                                        + Add More Items
                                    </Link>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {cartItems.map((item, index) => {
                                        const product = item.product || {}
                                        const productPrice = product.price || item.price
                                        const productOriginalPrice = product.originalPrice || product.price || item.price
                                        const productName = product.name || item.name
                                        const productImage = product.image || item.image
                                        const productCategory = product.category || item.category

                                        return (
                                            <div key={item._id || item.id || `cart-item-${index}`} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                                                <div className="flex gap-4">
                                                    {/* Product Image */}
                                                    <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                                                        <img
                                                            src={productImage}
                                                            alt={productName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between gap-4 mb-2">
                                                            <div className="flex-1">
                                                                <Link to={`/product/${product._id || item.product}`} className="text-base md:text-lg font-medium text-gray-900 hover:text-[#8b5e3c] line-clamp-2">
                                                                    {productName}
                                                                </Link>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Category: {productCategory} | Seller: CASAWOOD
                                                                </p>
                                                                {item.variantName && (
                                                                    <div className="mt-1 inline-block px-2 py-0.5 bg-gray-100 text-xs font-medium text-gray-700 rounded border border-gray-200">
                                                                        Size: {item.variantName}
                                                                    </div>
                                                                )}
                                                                {item.colorCode && (
                                                                    <div className="mt-1 flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500">Color:</span>
                                                                        {item.colorData?.color && (
                                                                            <div
                                                                                className="w-5 h-5 rounded border border-gray-300"
                                                                                style={{ backgroundColor: item.colorData.color }}
                                                                                title={item.colorCode}
                                                                            />
                                                                        )}
                                                                        <span className="text-xs font-medium text-gray-700">{item.colorCode}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => removeItem(item._id || item.id)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                                                aria-label="Remove item"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <span className="text-xl md:text-2xl font-bold text-gray-900">₹{(productPrice * item.quantity).toLocaleString()}</span>
                                                            <span className="text-sm text-gray-500 line-through">₹{(Math.round(productPrice * 1.25) * item.quantity).toLocaleString()}</span>
                                                            <span className="text-sm text-[#8b5e3c] font-bold">25% off</span>
                                                        </div>

                                                        {/* Delivery Info */}
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                            </svg>
                                                            <span>Delivery by <span className="font-medium text-gray-900">Tomorrow, 11 PM</span></span>
                                                            {deliveryCharges === 0 && <span className="text-[#8b5e3c] font-bold ml-2">FREE</span>}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-4 flex-wrap">
                                                            {/* Quantity Selector */}
                                                            <div className="flex items-center border border-gray-300 rounded-sm">
                                                                <button
                                                                    onClick={() => updateQuantity(item._id || item.id, -1)}
                                                                    className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                                                                    disabled={item.quantity <= 1}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                                                    </svg>
                                                                </button>
                                                                <span className="px-4 py-1.5 border-x border-gray-300 font-medium text-gray-900 min-w-[50px] text-center">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(item._id, 1)}
                                                                    className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                                    </svg>
                                                                </button>
                                                            </div>

                                                            <button
                                                                onClick={() => saveForLater(item._id)}
                                                                className="text-sm font-medium text-gray-700 hover:text-[#8b5e3c] transition-colors"
                                                            >
                                                                SAVE FOR LATER
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Place Order Button - Mobile */}
                                <div className="lg:hidden p-4 border-t border-gray-200">
                                    <Link
                                        to="/address"
                                        className="block w-full py-3 bg-[#5c4033] text-white text-center font-bold uppercase rounded-sm hover:bg-[#3e2b22] transition-colors shadow-md"
                                    >
                                        Place Order
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Saved For Later */}
                        {savedForLater.length > 0 && (
                            <div className="bg-white rounded-sm shadow-sm">
                                <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Saved For Later ({savedForLater.length})
                                    </h2>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {savedForLater.map((item, index) => {
                                        const product = item.product || {}
                                        const productName = product.name || item.name
                                        const productImage = product.image || item.image
                                        const productPrice = product.price || item.price
                                        const productOriginalPrice = product.originalPrice || product.price || item.price

                                        return (
                                            <div key={item._id || item.id || `saved-item-${index}`} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                                                <div className="flex gap-4">
                                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                                                        <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                                                    </div>

                                                    <div className="flex-1">
                                                        <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2">{productName}</h3>
                                                        {item.variantName && (
                                                            <div className="mb-2 inline-block px-2 py-0.5 bg-gray-100 text-xs font-medium text-gray-700 rounded border border-gray-200">
                                                                Size: {item.variantName}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <span className="text-xl font-bold text-gray-900">₹{productPrice.toLocaleString()}</span>
                                                            <span className="text-sm text-gray-500 line-through">₹{Math.round(productPrice * 1.25).toLocaleString()}</span>
                                                            <span className="text-xs text-[#8b5e3c] font-bold">25% OFF</span>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <button
                                                                onClick={() => moveToCart(item._id)}
                                                                className="text-sm font-medium text-[#8b5e3c] hover:text-[#70482d] transition-colors"
                                                            >
                                                                MOVE TO CART
                                                            </button>
                                                            <button
                                                                onClick={() => removeItem(item._id)}
                                                                className="text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
                                                            >
                                                                REMOVE
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Price Details (Sticky) */}
                    {cartItems.length > 0 && (
                        <div className="lg:w-[380px] flex-shrink-0">
                            <div className="bg-white rounded-sm shadow-sm sticky top-20">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wide">Price Details</h2>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between text-base">
                                        <span className="text-gray-700">Price ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                        <span className="font-medium text-gray-900">₹{(subtotal + discount).toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between text-base">
                                        <span className="text-gray-700">Discount</span>
                                        <span className="font-medium text-[#8b5e3c]">− ₹{discount.toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between text-base">
                                        <span className="text-gray-700">Delivery Charges</span>
                                        <span className="font-medium">
                                            {deliveryCharges === 0 ? (
                                                <span className="text-[#8b5e3c]">FREE</span>
                                            ) : (
                                                `₹${deliveryCharges}`
                                            )}
                                        </span>
                                    </div>

                                    {subtotal < 50000 && (
                                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-sm">
                                            Add items worth ₹{(50000 - subtotal).toLocaleString()} more to get FREE delivery
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span className="text-gray-900">Total Amount</span>
                                            <span className="text-gray-900">₹{total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="text-sm text-[#8b5e3c] font-medium bg-[#8b5e3c]/10 p-3 rounded-sm">
                                        You will save ₹{discount.toLocaleString()} on this order
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            if (isAuthenticated) {
                                                navigate('/address')
                                            } else {
                                                alert("Please login to place your order.")
                                                navigate('/login', { state: { from: '/address' } })
                                            }
                                        }}
                                        className="block w-full py-3 bg-[#5c4033] text-white text-center font-bold uppercase rounded-sm hover:bg-[#3e2b22] transition-colors shadow-md hover:shadow-lg"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Cart
