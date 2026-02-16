import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartAPI } from '../services/api';

const MobileBottomNav = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    // Fetch cart count
    useEffect(() => {
        const fetchCartCount = async () => {
            if (!isAuthenticated) {
                setCartCount(0);
                return;
            }

            try {
                const response = await cartAPI.get();
                if (response.data.success) {
                    const items = response.data.data?.items || response.data.data || [];
                    const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
                    setCartCount(totalCount);
                }
            } catch (error) {
                console.error('Error fetching cart count:', error);
                setCartCount(0);
            }
        };

        fetchCartCount();

        // Listen for cart update events
        window.addEventListener('cartUpdated', fetchCartCount);

        // Refresh cart count every 10 seconds
        const interval = setInterval(fetchCartCount, 10000);

        return () => {
            window.removeEventListener('cartUpdated', fetchCartCount);
            clearInterval(interval);
        };
    }, [isAuthenticated]);

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        {
            name: 'Home',
            path: '/',
            icon: (active) => (
                <svg className={`w-6 h-6 ${active ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
                </svg>
            )
        },
        {
            name: 'Shop',
            path: '/products',
            icon: (active) => (
                <svg className={`w-6 h-6 ${active ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            )
        },
        {
            name: 'Search',
            path: '#search', // Placeholder or trigger
            icon: (active) => (
                <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            name: 'Cart',
            path: '/cart',
            icon: (active) => (
                <div className="relative">
                    <svg className={`w-6 h-6 ${active ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#8b5e3c] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                            {cartCount > 9 ? '9+' : cartCount}
                        </span>
                    )}
                </div>
            )
        },
        {
            name: 'Account',
            path: '/profile',
            icon: (active) => (
                <svg className={`w-6 h-6 ${active ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[60] pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const isLink = !item.path.startsWith('#');

                    const Content = () => (
                        <div className={`flex flex-col items-center gap-1 transition-colors duration-200 ${active ? 'text-[#8b5e3c]' : 'text-gray-400 hover:text-gray-600'}`}>
                            {item.icon(active)}
                            <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
                        </div>
                    );

                    if (isLink) {
                        return (
                            <Link key={item.name} to={item.path} className="w-full h-full flex items-center justify-center active:scale-95 transition-transform">
                                <Content />
                            </Link>
                        );
                    }

                    return (
                        <button key={item.name} className="w-full h-full flex items-center justify-center active:scale-95 transition-transform">
                            <Content />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileBottomNav;
