import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { productsAPI, wishlistAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ProductList = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    // Lazy init category from URL to prevent race condition on mount
    const [selectedCategory, setSelectedCategory] = useState(() => {
        const searchParams = new URLSearchParams(location.search)
        return searchParams.get('category') || 'All'
    })

    const [priceRange, setPriceRange] = useState([0, 100000])
    const [sortBy, setSortBy] = useState('sequence')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [wishlistIds, setWishlistIds] = useState([])

    // Sync category with URL updates
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const category = searchParams.get('category')
        if (category) {
            setSelectedCategory(category)
        } else {
            setSelectedCategory('All')
        }
        setPage(1) // Reset page on category change
    }, [location.search])

    // Fetch products from API
    useEffect(() => {
        let ignore = false
        const fetchProducts = async () => {
            try {
                setLoading(true)
                const params = { page }

                if (selectedCategory !== 'All') {
                    params.category = selectedCategory
                }

                if (priceRange[0] > 0 || priceRange[1] < 100000) {
                    params.minPrice = priceRange[0]
                    params.maxPrice = priceRange[1]
                }

                if (sortBy === 'popular') {
                    params.sortBy = 'popular'
                } else if (sortBy === 'sequence') {
                    params.sortBy = 'sequence'
                    params.sortOrder = 'asc'
                } else if (sortBy === 'newest') {
                    params.sortBy = 'createdAt'
                    params.sortOrder = 'desc'
                } else if (sortBy === 'price_low') {
                    params.sortBy = 'price'
                    params.sortOrder = 'asc'
                } else if (sortBy === 'price_high') {
                    params.sortBy = 'price'
                    params.sortOrder = 'desc'
                }

                const response = await productsAPI.getAll(params)
                if (!ignore && response.data.success) {
                    if (page === 1) {
                        setProducts(response.data.data)
                    } else {
                        setProducts(prev => [...prev, ...response.data.data])
                    }
                    setHasMore(response.data.pagination.page < response.data.pagination.pages)
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.response?.data?.message || 'Failed to load products')
                    console.error('Error fetching products:', err)
                }
            } finally {
                if (!ignore) {
                    setLoading(false)
                }
            }
        }

        fetchProducts()
        return () => { ignore = true }
    }, [selectedCategory, sortBy, priceRange, page])

    useEffect(() => {
        if (!isAuthenticated) {
            setWishlistIds([])
            return
        }

        let ignore = false
        const fetchWishlist = async () => {
            try {
                const response = await wishlistAPI.get()
                if (!ignore && response.data.success) {
                    const ids = (response.data.data || []).map((item) => item._id || item.id).filter(Boolean)
                    setWishlistIds(ids)
                }
            } catch (error) {
                if (!ignore) {
                    console.error('Error fetching wishlist:', error)
                }
            }
        }

        fetchWishlist()
        return () => { ignore = true }
    }, [isAuthenticated])

    const handleWishlistToggle = async (e, productId) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } })
            return
        }

        const isInWishlist = wishlistIds.includes(productId)

        try {
            if (isInWishlist) {
                await wishlistAPI.remove(productId)
                setWishlistIds((prev) => prev.filter((id) => id !== productId))
                window.dispatchEvent(new Event('wishlistUpdated'))
            } else {
                await wishlistAPI.add({ productId })
                setWishlistIds((prev) => [...prev, productId])
                window.dispatchEvent(new Event('wishlistUpdated'))
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update wishlist')
        }
    }

    const displayCategory = (selectedCategory || 'All').toUpperCase()

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayCategory}</h1>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="lg:hidden flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            Filters
                        </button>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="sequence">Sequence</option>
                            <option value="newest">Newest Arrivals</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className={`
                        fixed inset-0 z-50 bg-black/50 lg:static lg:bg-transparent lg:z-auto transition-opacity duration-300
                        ${isFilterOpen ? 'opacity-100 visible' : 'opacity-0 invisible lg:opacity-100 lg:visible'}
                    `} onClick={() => setIsFilterOpen(false)}>
                        <div
                            className={`
                                w-[80%] max-w-xs h-full bg-white lg:w-64 lg:h-auto lg:bg-transparent lg:block
                                fixed top-0 left-0 lg:static shadow-2xl lg:shadow-none overflow-y-auto lg:overflow-visible
                                transform transition-transform duration-300 ease-in-out p-6 lg:p-0
                                ${isFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                            `}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-white lg:p-6 lg:rounded-xl lg:border lg:border-gray-200 lg:sticky lg:top-24">
                                <div className="flex justify-between items-center mb-6 lg:hidden">
                                    <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                                    <button onClick={() => setIsFilterOpen(false)} className="p-2 -mr-2 text-gray-500 hover:text-gray-900">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <h3 className="hidden lg:block text-lg font-semibold mb-6">Filters</h3>



                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wider">Price Range</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                min={0}
                                                value={priceRange[0] === 0 ? '' : priceRange[0]}
                                                onChange={(e) => setPriceRange(prev => [e.target.value === '' ? 0 : Number(e.target.value), prev[1]])}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                min={0}
                                                value={priceRange[1] === 100000 ? '' : priceRange[1]}
                                                onChange={(e) => setPriceRange(prev => [prev[0], e.target.value === '' ? 100000 : Number(e.target.value)])}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPage(1)}
                                            className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            Apply Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading && page === 1 ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <p className="text-red-500 mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 bg-[#8b5e3c] text-white rounded-lg hover:bg-[#70482d]"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-gray-500">No products found</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <Link to={`/product/${product._id || product.id}`} key={product._id || product.id} className="group">
                                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                                                <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-50 p-3">
                                                    <img
                                                        src={product.image || product.images?.[0] || '/placeholder.png'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    {product.tag && (
                                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-[#8b5e3c]">{product.tag}</span>
                                                        </div>
                                                    )}
                                                    {(() => {
                                                        const orig = product.originalPrice || product.price;
                                                        const discountPct = orig > product.price
                                                            ? Math.round(((orig - product.price) / orig) * 100)
                                                            : 0;
                                                        return discountPct > 0 ? (
                                                            <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded shadow-sm">
                                                                {discountPct}% OFF
                                                            </div>
                                                        ) : null;
                                                    })()}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleWishlistToggle(e, product._id || product.id)}
                                                        className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#8b5e3c]/10"
                                                    >
                                                        <svg
                                                            className={`w-5 h-5 ${(wishlistIds.includes(product._id || product.id)) ? 'text-red-500 fill-current' : 'text-gray-900'}`}
                                                            fill={(wishlistIds.includes(product._id || product.id)) ? 'currentColor' : 'none'}
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <div className="p-5">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="text-xs font-medium text-[#8b5e3c] uppercase tracking-wide">{product.category}</div>
                                                        <div className="flex items-center text-amber-400 text-xs">
                                                            <span className="font-bold mr-1">{product.rating || 0}</span>
                                                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                                            <span className="text-gray-400 ml-1">({product.reviews || 0})</span>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#8b5e3c] transition-colors">{product.name}</h3>

                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl font-bold text-gray-900">₹{(product.price ?? 0).toLocaleString()}</span>
                                                                {(product.originalPrice && product.originalPrice > product.price) && (
                                                                    <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-medium text-[#8b5e3c] hover:text-[#70482d]">View →</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {hasMore && (
                                    <div className="mt-12 flex justify-center">
                                        <button
                                            onClick={() => setPage(prev => prev + 1)}
                                            disabled={loading}
                                            className="px-8 py-3 bg-white border border-[#8b5e3c] text-[#8b5e3c] font-semibold rounded-full hover:bg-[#8b5e3c] hover:text-white transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                                        >
                                            {loading ? 'Loading...' : 'Load More Products'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductList
