import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';

const BestSeller = () => {
    const scrollRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await productsAPI.getAll({ tag: 'Best Seller', limit: 20 });
                if (response.data.success && response.data.data.length > 0) {
                    setProducts(response.data.data);
                } else {
                    // Fallback to showing message if no products
                    setProducts([]);
                }
            } catch (err) {
                console.error('Error fetching Best Seller products:', err);
                // Don't set error - just use empty array to prevent page crash
                setProducts([]);
                setError(null); // Clear error to prevent error UI from showing
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const scroll = (direction) => {
        const { current } = scrollRef;
        if (current) {
            const scrollAmount = 300;
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return null; // Don't show anything while loading to prevent layout shift
    }

    // Don't show section if no products
    if (products.length === 0) {
        return null;
    }


    return (
        <section className="w-full bg-white py-12 sm:py-16 border-t border-gray-100">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-[32px] font-normal text-gray-900 mb-2">
                            Best Sellers
                        </h2>
                        <div className="w-16 h-0.5 bg-[#8b5e3c]"></div>
                    </div>

                    {/* Mobile Swipe Hint */}
                    <div className="sm:hidden flex items-center gap-1 text-[#8b5e3c] text-xs font-medium animate-pulse">
                        <span>Swipe to explore</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>

                    {/* Navigation Buttons for larger screens */}
                    <div className="hidden sm:flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="p-2 rounded-full border border-gray-300 hover:border-[#8b5e3c] hover:text-[#8b5e3c] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-2 rounded-full border border-gray-300 hover:border-[#8b5e3c] hover:text-[#8b5e3c] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory custom-scrollbar"
                >
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="flex-shrink-0 w-[280px] snap-start group"
                        >
                            <Link to={`/product/${product._id}`} className="block h-full border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#8b5e3c]/20 transition-all duration-300 bg-white">
                                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Tag if exists */}
                                    {product.tag && (
                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#8b5e3c] text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm">
                                            {product.tag}
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">{product.category}</p>
                                        <div className="flex items-center space-x-1">
                                            <svg className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                            <span className="text-xs text-gray-500 font-medium">{product.rating}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-gray-900 font-serif text-lg mb-3 leading-tight group-hover:text-[#8b5e3c] transition-colors line-clamp-1">{product.name}</h3>

                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-[#8b5e3c] font-bold text-lg">₹{product.price.toLocaleString()}</p>
                                        <button className="w-8 h-8 rounded-full bg-[#f9f5f1] text-[#5c4033] flex items-center justify-center hover:bg-[#8b5e3c] hover:text-white transition-all duration-300">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
};

export default BestSeller;
