import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { productsAPI, cartAPI, wishlistAPI, fabricsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ColorSelector from '../components/ColorSelector'

const ProductDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated } = useAuth()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [displayPrice, setDisplayPrice] = useState(0)

    // Fabric and Color Selection State
    const [fabricData, setFabricData] = useState({})
    const [fabricError, setFabricError] = useState(null)
    const [selectedFabric, setSelectedFabric] = useState(null)
    const [selectedColorCode, setSelectedColorCode] = useState(null)
    const [selectedColorData, setSelectedColorData] = useState(null)

    // Calculate available fabrics based on strict product data
    const availableFabrics = useMemo(() => {
        const dataKeys = Object.keys(fabricData);
        if (dataKeys.length === 0) return [];

        // Create case-insensitive lookup map
        // e.g. { "KEIBA": "KEIBA", "keiba": "KEIBA" }
        const keyMap = {};
        dataKeys.forEach(key => {
            keyMap[key] = key;
            keyMap[key.toUpperCase()] = key;
            keyMap[key.toLowerCase()] = key;
        });

        // 1. Explicit fabric types (Smart Matching)
        if (product && product.fabricTypes && product.fabricTypes.length > 0) {
            const valid = new Set();
            product.fabricTypes.forEach(type => {
                if (typeof type === 'string') {
                    // Try direct match first, then case-insensitive
                    if (keyMap[type]) {
                        valid.add(keyMap[type]);
                    } else if (keyMap[type.toUpperCase()]) {
                        valid.add(keyMap[type.toUpperCase()]);
                    }
                }
            });
            // Only return if we found valid matches. 
            // If product has fabricTypes but none match valid fabrics (e.g. typos), 
            // we probably shouldn't show anything (Strict) or maybe Fallback?
            // Strict is safer to avoid empty selectors.
            if (valid.size > 0) return Array.from(valid);
        }

        // 2. Inferred from colorOptions (legacy support)
        if (product && product.colorOptions && product.colorOptions.length > 0) {
            const inferred = new Set();
            product.colorOptions.forEach(opt => {
                if (typeof opt === 'string') {
                    const candidate = opt.split(' ')[0]; // e.g. "AMBER" from "AMBER 113"
                    if (keyMap[candidate]) {
                        inferred.add(keyMap[candidate]);
                    } else if (keyMap[candidate.toUpperCase()]) {
                        inferred.add(keyMap[candidate.toUpperCase()]);
                    }
                }
            });
            if (inferred.size > 0) return Array.from(inferred);
        }

        return [];
    }, [product, fabricData]);

    // Initialize variant and price when product loads
    useEffect(() => {
        if (product) {
            if (product.variants && product.variants.length > 0) {
                // Default to first variant
                setSelectedVariant(product.variants[0])
                setDisplayPrice(product.variants[0].price)
            } else {
                setSelectedVariant(null)
                setDisplayPrice(product.price)
            }
        }
    }, [product])

    const [quantity, setQuantity] = useState(1)
    const [isInWishlist, setIsInWishlist] = useState(false)
    const [addingToCart, setAddingToCart] = useState(false)

    // Fetch product and fabrics from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch product
                const productResponse = await productsAPI.getById(id)
                if (productResponse.data.success) {
                    setProduct(productResponse.data.data)
                }

                // Fetch fabrics
                try {
                    const fabricResponse = await fabricsAPI.getAll()
                    if (fabricResponse.data.success) {
                        if (Object.keys(fabricResponse.data.data).length === 0) {
                            console.warn("Fabric data fetched but empty");
                        }
                        setFabricData(fabricResponse.data.data)
                    } else {
                        setFabricError("API returned failure")
                    }
                } catch (fabricError) {
                    console.error('Error fetching fabrics:', fabricError)
                    setFabricError(`Fetch Error: ${fabricError.message}`)
                }

            } catch (error) {
                console.error('Error fetching product:', error)
            } finally {
                setLoading(false)
            }
        }

        // Check if product is in wishlist
        const checkWishlist = async () => {
            if (isAuthenticated) {
                try {
                    const response = await wishlistAPI.check(id)
                    setIsInWishlist(response.data.isInWishlist)
                } catch (error) {
                    console.error('Error checking wishlist:', error)
                }
            }
        }

        fetchData()
        checkWishlist()
    }, [id, isAuthenticated])

    const handleAddToCart = async () => {
        // Removed auth check to allow guest cart
        // if (!isAuthenticated) { ... }

        try {
            setAddingToCart(true)
            await cartAPI.add({
                productId: id,
                quantity,
                variantName: selectedVariant?.name || selectedVariant?.type || selectedVariant?.label || selectedVariant?.title,
                fabric: selectedFabric,
                colorCode: selectedColorCode ? `${selectedFabric} ${selectedColorCode}` : null,
                colorData: selectedColorData
            })
            // Trigger cart update event
            window.dispatchEvent(new Event('cartUpdated'))

            navigate('/cart')
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add to cart')
        } finally {
            setAddingToCart(false)
        }
    }

    const handleBuyNow = async () => {
        // Removed auth check
        // if (!isAuthenticated) { ... }

        try {
            setAddingToCart(true)
            await cartAPI.add({
                productId: id,
                quantity,
                variantName: selectedVariant?.name || selectedVariant?.type || selectedVariant?.label || selectedVariant?.title,
                fabric: selectedFabric,
                colorCode: selectedColorCode ? `${selectedFabric} ${selectedColorCode}` : null,
                colorData: selectedColorData,
                guestId: localStorage.getItem('guestId')
            })
            // Trigger cart update event
            window.dispatchEvent(new Event('cartUpdated'))
            navigate('/cart')
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add to cart')
        } finally {
            setAddingToCart(false)
        }
    }

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } })
            return
        }

        try {
            if (isInWishlist) {
                await wishlistAPI.remove(id)
                setIsInWishlist(false)
                window.dispatchEvent(new Event('wishlistUpdated'))
            } else {
                await wishlistAPI.add({ productId: id })
                setIsInWishlist(true)
                window.dispatchEvent(new Event('wishlistUpdated'))
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update wishlist')
        }
    }

    // Handle fabric/color selection change
    const handleColorChange = (fabric, colorCode, colorData) => {
        setSelectedFabric(fabric)
        setSelectedColorCode(colorCode)
        setSelectedColorData(colorData)

        // If color has an image, update the main product image
        if (colorData.image && product.images) {
            // Find if this color image exists in product images
            const imageIndex = product.images.findIndex(img => img.includes(colorData.image))
            if (imageIndex !== -1) {
                setSelectedImage(imageIndex)
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                    <Link to="/products" className="text-[#8b5e3c] hover:text-[#70482d] font-semibold">
                        Back to Products
                    </Link>
                </div>
            </div>
        )
    }

    // Prepare images (ensure multiple)
    const images = product.images && product.images.length > 0
        ? product.images
        : [product.image];

    // Calculate discount
    const originalPrice = product.originalPrice || product.price;
    const discount = originalPrice > product.price
        ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
        : 0;



    return (
        <div className="bg-gray-100 min-h-screen py-4">
            <div className="max-w-[1400px] mx-auto bg-white shadow-sm rounded-sm overflow-hidden">
                <div className="flex flex-col md:flex-row">

                    {/* LEFT COLUMN - Sticky Images & Buttons */}
                    <div className="w-full md:w-[40%] lg:w-[35%] p-4 relative md:sticky md:top-0 h-fit bg-white">
                        <div className="flex flex-col relative">
                            {/* Main Image Area */}
                            <div className="flex">
                                {/* Vertical Thumbnails (Desktop) */}
                                <div className="hidden md:flex flex-col gap-2 w-16 mr-2 h-[450px] overflow-y-auto scrollbar-hide">
                                    {images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onMouseEnter={() => setSelectedImage(idx)}
                                            className={`w-16 h-16 border-2 cursor-pointer p-1 rounded-sm ${selectedImage === idx ? 'border-[#8b5e3c]' : 'border-gray-200 hover:border-[#8b5e3c]'}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    ))}
                                </div>

                                {/* Main Active Image */}
                                <div className="flex-1 h-[450px] flex items-center justify-center border border-gray-100 relative group">
                                    <img
                                        src={images[selectedImage]}
                                        alt={product.name}
                                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                    />
                                    {/* Wishlist Heart */}
                                    <button
                                        onClick={handleToggleWishlist}
                                        className={`absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 shadow border border-gray-200 flex items-center justify-center transition-colors ${isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                                            }`}
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Thumbnails (Below Main) */}
                            <div className="flex md:hidden gap-2 mt-4 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-16 h-16 flex-shrink-0 border-2 rounded-sm ${selectedImage === idx ? 'border-[#8b5e3c]' : 'border-gray-200'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className="flex-1 py-4 bg-[#a67c52] hover:bg-[#8b5e3c] text-white font-bold text-base uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addingToCart ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={addingToCart}
                                    className="flex-1 py-4 bg-[#5c4033] hover:bg-[#3e2b22] text-white font-bold text-base uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addingToCart ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z" /></svg>
                                            Buy Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Details */}
                    <div className="w-full md:w-[60%] lg:w-[65%] p-4 md:pl-8 border-l border-gray-100 flex-1">

                        {/* Breadcrumbs */}
                        <div className="flex items-center text-xs text-gray-500 mb-2 gap-1">
                            <Link to="/" className="hover:text-[#8b5e3c]">Home</Link>
                            <span>›</span>
                            <Link to="/products" className="hover:text-[#8b5e3c]">Furniture</Link>
                            <span>›</span>
                            <Link to={`/products?category=${product.category}`} className="hover:text-[#8b5e3c]">{product.category}</Link>
                            <span>›</span>
                            <span className="text-gray-400 truncate max-w-[200px]">{product.name}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-lg md:text-xl text-gray-800 font-normal mb-1">
                            {product.name}
                        </h1>

                        {/* Ratings & Tags */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1 bg-[#8b5e3c] text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">
                                {product.rating} <span className="text-[10px]">★</span>
                            </div>
                            <span className="text-gray-500 text-sm font-medium">{product.reviews * 12} Ratings & {product.reviews} Reviews</span>
                            {product.tag && (
                                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Assured" className="h-[21px] opacity-0" />
                            )}
                        </div>

                        {/* Variant/Size Selection */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-6">
                                <div className="text-sm text-gray-900 font-medium mb-3">
                                    Select Configuration: <span className="text-[#8b5e3c] font-bold">{selectedVariant?.name || selectedVariant?.type || selectedVariant?.label || selectedVariant?.title || (typeof selectedVariant === 'string' ? selectedVariant : '')}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedVariant(variant)
                                                setDisplayPrice(variant.price)
                                            }}
                                            className={`relative px-6 py-3 border rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center min-w-[100px] ${(selectedVariant?.name || selectedVariant?.type) === (variant.name || variant.type)
                                                ? 'border-[#8b5e3c] bg-[#fff8f5] text-[#8b5e3c] shadow-sm ring-1 ring-[#8b5e3c]'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-[#8b5e3c] hover:shadow-sm'
                                                }`}
                                        >
                                            <span className="font-bold text-base">
                                                {variant.name || variant.type || variant.label || variant.title || (typeof variant === 'string' ? variant : `Option ${idx + 1}`)}
                                            </span>
                                            {variant.dimensions && (
                                                <span className="text-[11px] text-gray-500 mt-1 block">{variant.dimensions.split('×')[0]}...</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fabric & Color Selection - Available for all products */}
                        {fabricError && (
                            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                Unable to load fabric options: {fabricError}
                            </div>
                        )}
                        <ColorSelector
                            fabricData={fabricData}
                            availableFabrics={availableFabrics}
                            defaultFabric={product.defaultFabric}
                            defaultColor={product.defaultColor}
                            onColorChange={handleColorChange}
                        />

                        {/* Price */}
                        <div className="flex items-end gap-3 mb-4">
                            <span className="text-3xl font-bold text-gray-900">₹{(displayPrice ?? product.price ?? 0).toLocaleString()}</span>
                            {(() => {
                                const currentPrice = displayPrice ?? product.price ?? 0;
                                const orig = selectedVariant?.originalPrice ?? product.originalPrice ?? currentPrice;
                                const showDiscount = orig > currentPrice;
                                const pct = showDiscount ? Math.round(((orig - currentPrice) / orig) * 100) : 0;
                                return (
                                    <>
                                        {showDiscount && <span className="text-gray-500 text-base line-through">₹{orig.toLocaleString()}</span>}
                                        {showDiscount && <span className="text-[#8b5e3c] text-base font-bold">{pct}% off</span>}
                                    </>
                                );
                            })()}
                        </div>





                        {/* Highlights */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 mb-6 border-b border-gray-100 pb-6">
                            <div className="w-32 text-gray-500 text-sm font-medium">Highlights</div>
                            <div className="flex-1">
                                <ul className="list-disc pl-4 space-y-1">
                                    {product.features?.map((feature, i) => (
                                        <li key={i} className="text-sm text-gray-800">{feature}</li>
                                    ))}
                                    <li className="text-sm text-gray-800">DIY - Basic assembly to be done with simple tools by the customer, comes with instructions.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Product Policies (Seller/Shipping) */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 mb-6 border-b border-gray-100 pb-6">
                            <div className="w-32 text-gray-500 text-sm font-medium">Product Policies</div>
                            <div className="flex-1">
                                <div className="space-y-3">
                                    {product.policies?.shipping && (
                                        <div className="flex gap-2">
                                            <span className="text-lg">🚚</span>
                                            <div>
                                                <span className="font-medium text-sm text-gray-900">Shipping:</span>
                                                <p className="text-sm text-gray-700">{product.policies.shipping}</p>
                                            </div>
                                        </div>
                                    )}
                                    {product.policies?.warranty && (
                                        <div className="flex gap-2">
                                            <span className="text-lg">🛡️</span>
                                            <div>
                                                <span className="font-medium text-sm text-gray-900">Warranty:</span>
                                                <p className="text-sm text-gray-700">{product.policies.warranty}</p>
                                            </div>
                                        </div>
                                    )}
                                    {product.policies?.cancellations && (
                                        <div className="flex gap-2">
                                            <span className="text-lg">❌</span>
                                            <div>
                                                <span className="font-medium text-sm text-gray-900">Cancellations:</span>
                                                <p className="text-sm text-gray-700">{product.policies.cancellations}</p>
                                            </div>
                                        </div>
                                    )}
                                    {(!product.policies || Object.keys(product.policies).length === 0) && (
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li className="text-sm text-gray-800">7 Days Replacement Policy</li>
                                            <li className="text-sm text-gray-800">GST invoice available</li>
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border border-gray-200 rounded-sm mb-6">
                            <div className="px-5 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-medium text-gray-800">Product Description</h2>
                            </div>
                            <div className="p-5 text-sm text-gray-700 leading-relaxed">
                                {product.description}
                                <br /><br />
                                <p>Whether you are looking to revamp your bedroom or living space, this piece from Casawood Furniture is designed to meet your highest standards of comfort and aesthetics. We use only selected materials to ensure longevity and class.</p>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="border border-gray-200 rounded-sm mb-6">
                            <div className="px-5 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-medium text-gray-800">Specifications</h2>
                            </div>
                            <div className="p-5">
                                <div className="mb-4">
                                    <div className="text-sm font-medium text-gray-800 mb-3 uppercase">General</div>
                                    <div className="border border-gray-200 rounded-sm">
                                        <div className="flex flex-col md:grid md:grid-cols-3 border-b border-gray-200 last:border-b-0">
                                            <div className="p-3 text-sm text-gray-500 md:col-span-1">Sales Package</div>
                                            <div className="p-3 text-sm text-gray-800 md:col-span-2 pt-0 md:pt-3">1 {product.category?.slice(0, -1) || 'Unit'}</div>
                                        </div>
                                        <div className="flex flex-col md:grid md:grid-cols-3 border-b border-gray-200 last:border-b-0">
                                            <div className="p-3 text-sm text-gray-500 md:col-span-1">Model Number</div>
                                            <div className="p-3 text-sm text-gray-800 md:col-span-2 pt-0 md:pt-3">CW-{(product._id || product.id || '').toString().slice(-6)}-2026</div>
                                        </div>

                                        {/* Dynamic Specifications */}
                                        {product.specifications?.map((spec, index) => (
                                            <div key={index} className="flex flex-col md:grid md:grid-cols-3 border-b border-gray-200 last:border-b-0">
                                                <div className="p-3 text-sm text-gray-500 md:col-span-1 capitalize">{spec.key}</div>
                                                <div className="p-3 text-sm text-gray-800 md:col-span-2 pt-0 md:pt-3">{spec.value}</div>
                                            </div>
                                        ))}

                                        {/* Fallback for old schema fields if no specifications exist */}
                                        {(!product.specifications || product.specifications.length === 0) && (
                                            <>
                                                {product.material && (
                                                    <div className="flex flex-col md:grid md:grid-cols-3 border-b border-gray-200 last:border-b-0">
                                                        <div className="p-3 text-sm text-gray-500 md:col-span-1">Material</div>
                                                        <div className="p-3 text-sm text-gray-800 md:col-span-2 pt-0 md:pt-3">{product.material}</div>
                                                    </div>
                                                )}
                                                {product.color && (
                                                    <div className="flex flex-col md:grid md:grid-cols-3 border-b border-gray-200 last:border-b-0">
                                                        <div className="p-3 text-sm text-gray-500 md:col-span-1">Color</div>
                                                        <div className="p-3 text-sm text-gray-800 md:col-span-2 pt-0 md:pt-3">{product.color}</div>
                                                    </div>
                                                )}
                                                {product.deliveryCondition && (
                                                    <div className="flex flex-col md:grid md:grid-cols-3 border-b border-gray-200 last:border-b-0">
                                                        <div className="p-3 text-sm text-gray-500 md:col-span-1">Delivery Condition</div>
                                                        <div className="p-3 text-sm text-gray-800 md:col-span-2 pt-0 md:pt-3">{product.deliveryCondition}</div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {product.dimensionDetails && product.dimensionDetails.length > 0 ? (
                                    <div className="mt-4">
                                        <div className="text-sm font-medium text-gray-800 mb-3 uppercase">Product Dimensions</div>
                                        <div className="border border-gray-200 rounded-sm">
                                            {/* Show Selected Variant Dimensions Highlighted if available */}
                                            {selectedVariant?.dimensions && (
                                                <div className="bg-[#fff8f5] border-b border-[#8b5e3c]/20">
                                                    <div className="flex flex-col md:grid md:grid-cols-3">
                                                        <div className="p-3 text-sm font-medium text-[#8b5e3c] md:col-span-1">Selected Configuration</div>
                                                        <div className="p-3 text-sm font-bold text-[#8b5e3c] md:col-span-2 pt-0 md:pt-3">
                                                            {selectedVariant.dimensions}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {product.dimensionDetails.map((detail, idx) => (
                                                <div key={idx} className="border-b border-gray-200 last:border-b-0">
                                                    {detail.title && (
                                                        <div className="bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                                                            {detail.title}
                                                        </div>
                                                    )}
                                                    {detail.items.map((item, itemIdx) => (
                                                        <div key={itemIdx} className="flex flex-col md:grid md:grid-cols-3 border-b border-gray-100 last:border-b-0">
                                                            <div className="p-3 text-sm text-gray-500 md:col-span-1">{item.label}</div>
                                                            <div className="p-3 text-sm text-gray-800 md:col-span-2 pt-0 md:pt-3">{item.value}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    (selectedVariant?.dimensions || (product.dimensions && (typeof product.dimensions === 'string' || product.dimensions.width || product.dimensions.length || product.dimensions.height))) && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-800 mb-3 uppercase">Dimensions</div>
                                            <div className="border border-gray-200 rounded-sm">
                                                {/* Priority: Selected Variant String -> Product String -> Product Object */}
                                                {(selectedVariant?.dimensions || typeof product.dimensions === 'string') ? (
                                                    <div className="flex flex-col md:grid md:grid-cols-3 border-b border-gray-200 last:border-b-0">
                                                        <div className="p-3 text-sm text-gray-500 md:col-span-1">Dimensions</div>
                                                        <div className="p-3 text-sm text-gray-800 md:col-span-2 font-medium pt-0 md:pt-3">
                                                            {selectedVariant?.dimensions || product.dimensions}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {product.dimensions && (product.dimensions.length !== undefined && product.dimensions.length !== '') && (
                                                            <div className="flex flex-col md:grid md:grid-cols-3 border-b border-gray-200 last:border-b-0">
                                                                <div className="p-3 text-sm text-gray-500 md:col-span-1">Length</div>
                                                                <div className="p-3 text-sm text-gray-800 md:col-span-2 pt-0 md:pt-3">{product.dimensions.length} {product.dimensions.unit || 'cm'}</div>
                                                            </div>
                                                        )}
                                                        {product.dimensions.width && (
                                                            <div className="flex flex-col md:grid md:grid-cols-3 border-b border-gray-200 last:border-b-0">
                                                                <div className="p-3 text-sm text-gray-500 md:col-span-1">Width</div>
                                                                <div className="p-3 text-sm text-gray-800 md:col-span-2 pt-0 md:pt-3">{product.dimensions.width} {product.dimensions.unit || 'cm'}</div>
                                                            </div>
                                                        )}
                                                        {product.dimensions.height && (
                                                            <div className="flex flex-col md:grid md:grid-cols-3 border-b border-gray-200 last:border-b-0">
                                                                <div className="p-3 text-sm text-gray-500 md:col-span-1">Height</div>
                                                                <div className="p-3 text-sm text-gray-800 md:col-span-2 pt-0 md:pt-3">{product.dimensions.height} {product.dimensions.unit || 'cm'}</div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Ratings & Reviews */}
                        <div className="border border-gray-200 rounded-sm mb-6">
                            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-xl font-medium text-gray-800">Ratings & Reviews</h2>
                                <button className="px-5 py-2 bg-white shadow border border-[#8b5e3c] text-sm font-medium text-[#8b5e3c] hover:bg-[#8b5e3c] hover:text-white transition-colors hover:shadow-md">Rate Product</button>
                            </div>
                            <div className="p-6 flex flex-col md:flex-row gap-8">
                                <div className="flex flex-col items-center justify-center w-full md:w-32 border-r-0 md:border-r border-gray-200 pr-0 md:pr-4">
                                    <div className="text-3xl font-medium text-gray-800 flex items-center gap-1">
                                        {product.rating} <span className="text-xl">★</span>
                                    </div>
                                    <div className="text-sm text-gray-500 text-center mt-1">{product.reviews} Reviews</div>
                                </div>

                                <div className="flex-1 space-y-2">
                                    {[5, 4, 3, 2, 1].map(stars => (
                                        <div key={stars} className="flex items-center gap-4 text-sm">
                                            <div className="w-8 font-medium text-gray-600 flex items-center gap-0.5">{stars} <span className="text-[10px]">★</span></div>
                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${[1, 2].includes(stars) ? 'bg-[#5c4033]' : 'bg-[#8b5e3c]'}`}
                                                    style={{ width: stars === 5 ? '60%' : stars === 4 ? '25%' : stars === 3 ? '10%' : '5%' }}
                                                ></div>
                                            </div>
                                            <div className="w-8 text-right text-gray-400 text-xs">
                                                {stars === 5 ? '60%' : stars === 4 ? '25%' : stars === 3 ? '10%' : '5%'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail
