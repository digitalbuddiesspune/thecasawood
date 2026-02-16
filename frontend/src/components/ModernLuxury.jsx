import React from 'react';
import { Link } from 'react-router-dom';

const ModernLuxury = () => {
    return (
        <section className="w-full bg-[#f4f1ee] py-8 sm:py-12 overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Visual Side */}
                    <div className="relative order-1 lg:order-1">
                        {/* New Arrival Badge - Mobile Only */}
                        <div className="text-center mb-6 lg:hidden">
                            <span className="inline-block py-1 px-3 border border-[#8b5e3c] rounded-full text-[#8b5e3c] text-xs font-bold tracking-wider uppercase">
                                New Arrival
                            </span>
                        </div>
                        <div className="relative z-10 w-full max-w-md mx-auto aspect-square rounded-t-full overflow-hidden shadow-2xl">
                            <img
                                src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1769154872/Brown_Elegant_Minimalist_Furniture_Instagram_Post_nspjpj.svg"
                                alt="Modern Luxury Chair"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute -top-6 -right-6 lg:right-10 w-48 h-48 bg-[#e8e0d9] rounded-full z-0 hidden lg:block" />
                        <div className="absolute -bottom-6 -left-6 lg:left-10 w-32 h-32 border-2 border-[#8b5e3c]/20 rounded-full z-0 hidden lg:block" />

                        {/* Floating Card */}
                        <div className="absolute bottom-10 -right-4 lg:right-0 z-20 bg-white p-4 rounded-sm shadow-xl max-w-[200px] hidden sm:block">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 rounded-full bg-[#f9f5f1] flex items-center justify-center text-[#8b5e3c]">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">New Arrival</p>
                                    <p className="text-xs text-gray-500">The Velvet Accent Chair</p>
                                </div>
                            </div>
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full w-4/5 bg-[#8b5e3c]" />
                            </div>
                            <p className="text-xs text-right mt-1 text-[#8b5e3c] font-medium">Limited Stock</p>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="order-2 lg:order-2 text-center">
                        <span className="hidden lg:inline-block py-1 px-3 border border-[#8b5e3c] rounded-full text-[#8b5e3c] text-xs font-bold tracking-wider uppercase mb-6">
                            New Arrival
                        </span>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-gray-900 mb-4 leading-none">
                            Modern <br />
                            <span className="text-[#8b5e3c]">Luxury</span> Edit.
                        </h2>
                        <p className="text-gray-600 text-lg mb-6 leading-relaxed max-w-lg mx-auto">
                            Redefine your living space with our exclusive Modern Luxury collection. Featuring clean lines, premium velvet upholstery, and gold accents that speak of sophistication without saying a word.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/products" className="group bg-[#3e2b22] text-white px-8 py-4 rounded-sm font-medium hover:bg-[#5c4033] transition-all flex items-center justify-center gap-2">
                                Shop The Look
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ModernLuxury;
