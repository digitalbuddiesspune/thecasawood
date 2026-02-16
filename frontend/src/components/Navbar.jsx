import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cartAPI } from '../services/api'
import CategoryHeader, { useNavCategories } from './CategoryHeader'

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth()
    const navLinks = useNavCategories()
    const [activeLink, setActiveLink] = useState(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [cartCount, setCartCount] = useState(0)

    // Fetch cart count
    useEffect(() => {
        const fetchCartCount = async () => {
            // Fetch for both auth and guest users
            // if (!isAuthenticated) { ... }

            try {
                const response = await cartAPI.get()
                if (response.data.success) {
                    const items = response.data.data?.items || response.data.data || []
                    const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
                    setCartCount(totalCount)
                }
            } catch (error) {
                console.error('Error fetching cart count:', error)
                setCartCount(0)
            }
        }

        fetchCartCount()

        // Listen for cart update events
        window.addEventListener('cartUpdated', fetchCartCount)

        // Refresh cart count every 10 seconds
        const interval = setInterval(fetchCartCount, 10000)

        return () => {
            window.removeEventListener('cartUpdated', fetchCartCount)
            clearInterval(interval)
        }
    }, [isAuthenticated])



    const handleLogout = () => {
        logout()
        setShowUserMenu(false)
        setIsMobileMenuOpen(false)
    }

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Mobile & Tablet Header (below lg) */}
                <div className="flex items-center justify-between h-16 md:h-18 lg:hidden">
                    {/* Mobile Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/">
                            <img
                                src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769077778/Casawood_logo_500x-8_pzbmu9.png"
                                alt="Casawood Logo"
                                className="h-8 sm:h-10 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Mobile Right Icons */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {/* Cart Icon - Mobile */}
                        <Link to="/cart" className="p-1.5 sm:p-2 text-gray-600 hover:text-[#8b5e3c] relative touch-manipulation">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 2L7.17 4H3C2.45 4 2 4.45 2 5C2 5.55 2.45 6 3 6H4L7.6 13.59L6.25 16.04C5.52 17.37 6.48 19 8 19H19C19.55 19 20 18.55 20 18C20 17.45 19.55 17 19 17H8L9.1 15H16.55C17.3 15 17.96 14.59 18.3 13.97L21.88 7.48C22.25 6.82 21.77 6 21.01 6H6.21L5.27 4H9V2Z" />
                                <circle cx="8" cy="20.5" r="1.5" fill="currentColor" />
                                <circle cx="17" cy="20.5" r="1.5" fill="currentColor" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-[#8b5e3c] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Hamburger Menu */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-1.5 sm:p-2 text-gray-600 hover:text-[#8b5e3c] touch-manipulation"
                            aria-label="Menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Desktop Header (lg and above) */}
                <div className="hidden lg:flex items-center justify-between h-16 relative border-b border-gray-100">
                    {/* Left - Tagline/Text */}
                    <div className="flex-1 flex items-center justify-start">
                        <p className="text-xs font-medium text-[#8b5e3c] uppercase tracking-widest pl-2">
                            Handcrafted Luxury Furniture
                        </p>
                    </div>

                    {/* Center - Logo */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <Link to="/">
                            <img
                                src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769077778/Casawood_logo_500x-8_pzbmu9.png"
                                alt="Casawood Logo"
                                className="h-10 xl:h-12 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Right - Track Order and Icons */}
                    <div className="flex-1 flex items-center justify-end space-x-4 xl:space-x-6">
                        {/* Track Your Order */}
                        {/* Track Your Order */}
                        <Link to={isAuthenticated ? "/orders" : "/login"} className="hidden lg:flex items-center gap-2 text-gray-500 hover:text-[#8b5e3c] transition-colors group">
                            <div className="p-1.5 rounded-full bg-gray-50 group-hover:bg-[#8b5e3c]/10 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                </svg>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">Track Order</span>
                        </Link>

                        {/* Icons */}
                        <div className="flex items-center space-x-3">
                            {/* Location */}
                            <a href="#location" className="text-gray-500 hover:text-[#8b5e3c] transition-colors p-1.5">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                            </a>

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative group">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 text-gray-500 hover:text-[#8b5e3c] transition-colors p-1.5"
                                    >
                                        <div className="w-8 h-8 bg-[#8b5e3c] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    </button>

                                    {/* Dropdown - Add group-hover:block for easier desktop usage if desired, but click is fine */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-gray-200">
                                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                                            </div>
                                            <Link to="/profile" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                My Profile
                                            </Link>
                                            <Link to="/wishlist" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                My Wishlist
                                            </Link>
                                            <Link to="/cart" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                                My Cart
                                            </Link>
                                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-200 mt-2 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="px-4 py-2 bg-[#8b5e3c] text-white rounded-lg hover:bg-[#70482d] transition-colors text-sm font-medium">
                                    Login
                                </Link>
                            )}

                            {/* Wishlist */}
                            <Link to="/wishlist" className="text-gray-500 hover:text-[#8b5e3c] transition-colors p-1.5 hidden sm:block">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                </svg>
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="text-gray-500 hover:text-[#8b5e3c] transition-colors p-1.5 relative hidden sm:block">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#8b5e3c] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Combined Category Header - Visible on ALL screens below the main navbar content */}
            {/* Combined Category Header - Visible on ALL screens below the main navbar content */}
            <CategoryHeader activeLink={activeLink} setActiveLink={setActiveLink} />

            {/* Mobile Menu Overlay */}
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white animate-in slide-in-from-top duration-200">
                    {/* Mobile Search */}
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] focus:bg-white"
                            />
                            <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* User Section - Mobile */}
                    {isAuthenticated ? (
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-[#8b5e3c] rounded-full flex items-center justify-center text-white font-bold">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{user?.name}</p>
                                    <p className="text-sm text-gray-600 truncate max-w-[150px]">{user?.email}</p>
                                </div>
                            </div>
                            <Link
                                to={isAuthenticated ? "/orders" : "/login"}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mb-3 flex items-center gap-2 text-sm text-[#8b5e3c] font-bold bg-[#8b5e3c]/10 p-2 rounded-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                                Track Your Order
                            </Link>
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 text-center"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-4 py-2 bg-[#8b5e3c] text-white rounded-lg text-sm font-medium hover:bg-[#70482d] text-center"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-4 py-2 border-2 border-[#8b5e3c] text-[#8b5e3c] rounded-lg text-sm font-medium hover:bg-[#8b5e3c] hover:text-white text-center"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Mobile Navigation Links */}
                    <div className="px-3 sm:px-4 py-2 max-h-[60vh] overflow-y-auto">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.to}
                                onClick={() => {
                                    setActiveLink(link.name)
                                    setIsMobileMenuOpen(false)
                                }}
                                className={`block py-3 px-4 text-sm font-semibold tracking-wide uppercase transition-all duration-200 border-b border-gray-100 last:border-b-0 touch-manipulation ${activeLink === link.name
                                    ? 'text-[#8b5e3c] bg-[#8b5e3c]/10 rounded-lg'
                                    : 'text-gray-900 hover:text-[#8b5e3c] hover:bg-gray-50 active:bg-gray-100'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
